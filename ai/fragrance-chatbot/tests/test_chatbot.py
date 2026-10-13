import json
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from peft import LoraConfig, get_peft_model
import torch
from transformers import Qwen2Config, Qwen2ForCausalLM

from inference import ROOT, build_messages, reference_notes
from serve import app
from train import load_examples, make_batch
from configure_deployment import hostname_for, write_configuration
from healthcheck import is_ready


class FakeTokenizer:
    eos_token_id = 7

    def apply_chat_template(self, messages, **kwargs):
        return [1, 2, 3]

    def encode(self, answer, **kwargs):
        return [4, 5]


class TrainingTests(unittest.TestCase):
    def test_phrasings_are_held_out(self):
        train, validation = load_examples(ROOT / "data/starter.json")
        self.assertEqual(len(train), 90)
        self.assertEqual(len(validation), 30)
        self.assertFalse({q for q, _ in train} & {q for q, _ in validation})

    def test_only_answer_tokens_have_labels(self):
        batch = make_batch([("hello", "answer")], FakeTokenizer(), "cpu")
        self.assertEqual(batch["labels"][0].tolist(), [-100, -100, -100, 4, 5, 7])
        self.assertEqual(batch["input_ids"][0].tolist(), [1, 2, 3, 4, 5, 7])

    def test_duplicate_questions_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            data = Path(directory) / "bad.json"
            data.write_text(json.dumps([{"questions": ["Hi", "hi"], "answer": "Hello"}]))
            with self.assertRaises(ValueError):
                load_examples(data)

    def test_lora_updates_adapters_and_keeps_base_frozen(self):
        torch.manual_seed(7)
        config = Qwen2Config(vocab_size=32, hidden_size=32, intermediate_size=64,
                             num_hidden_layers=1, num_attention_heads=2, num_key_value_heads=2)
        model = get_peft_model(Qwen2ForCausalLM(config), LoraConfig(
            task_type="CAUSAL_LM", r=2, target_modules=["q_proj", "v_proj"]
        ))
        before = {name: parameter.detach().clone() for name, parameter in model.named_parameters()}
        optimizer = torch.optim.AdamW((p for p in model.parameters() if p.requires_grad), lr=0.01)
        tokens = torch.tensor([[1, 2, 3, 4, 5]])
        loss = model(input_ids=tokens, labels=tokens).loss
        loss.backward()
        optimizer.step()
        changed_adapters = 0
        for name, parameter in model.named_parameters():
            if not parameter.requires_grad:
                self.assertTrue(torch.equal(before[name], parameter), name)
            elif not torch.equal(before[name], parameter):
                changed_adapters += 1
        self.assertGreater(changed_adapters, 0)

    def test_store_data_is_separate_from_system_instructions(self):
        messages = build_messages("What is available?", '{"products":[]}')
        self.assertEqual(messages[0]["role"], "system")
        self.assertNotIn('{"products":[]}', messages[0]["content"])
        self.assertIn('{"products":[]}', messages[1]["content"])

    def test_reviewed_definition_is_retrieved_for_attar(self):
        notes = reference_notes("What is attar?")
        self.assertEqual(len(notes), 1)
        self.assertIn("fragrant oil", notes[0])
        self.assertEqual(reference_notes("Hello"), [])


class FakeRuntime:
    def reply(self, message, context):
        self.received = (message, context)
        return "A fresh fragrance can feature citrus notes."


class ServiceTests(unittest.TestCase):
    def setUp(self):
        # Never download or load a real model in unit tests.
        self.environment = patch.dict("os.environ", {
            "CHATBOT_MODEL_DIR": str(ROOT / "artifacts/missing-test-model"),
            "CHATBOT_SERVICE_KEY": "", "CHATBOT_REQUIRE_SERVICE_KEY": "false", "CHATBOT_THREADS": "2",
        })
        self.environment.start()
        self.client_context = TestClient(app)
        self.client = self.client_context.__enter__()

    def tearDown(self):
        self.client_context.__exit__(None, None, None)
        self.environment.stop()

    def test_missing_model_returns_unavailable(self):
        self.assertFalse(self.client.get("/health").json()["ready"])
        self.assertEqual(self.client.post("/generate", json={"message": "Hello"}).status_code, 503)

    def test_generation_passes_context(self):
        runtime = FakeRuntime()
        app.state.model = runtime
        response = self.client.post("/generate", json={"message": " Hello ", "context": '{"currency":"INR"}'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(runtime.received, ("Hello", '{"currency":"INR"}'))
        self.assertEqual(response.json()["source"], "open-model")

    def test_definition_uses_reviewed_answer_instead_of_generation(self):
        runtime = FakeRuntime()
        app.state.model = runtime
        response = self.client.post("/generate", json={"message": "What is attar?"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["source"], "reviewed-reference")
        self.assertIn("fragrant oil", response.json()["reply"])
        self.assertFalse(hasattr(runtime, "received"))

    def test_empty_and_oversized_requests_fail(self):
        app.state.model = FakeRuntime()
        for message in ["", "   ", "a" * 601]:
            self.assertEqual(self.client.post("/generate", json={"message": message}).status_code, 422)

    def test_busy_inference_returns_429(self):
        app.state.model = FakeRuntime()
        app.state.lock.acquire()
        try:
            self.assertEqual(self.client.post("/generate", json={"message": "Hello"}).status_code, 429)
        finally:
            app.state.lock.release()

    def test_service_key_is_enforced(self):
        with patch.dict("os.environ", {"CHATBOT_SERVICE_KEY": "private-test-key"}):
            self.assertEqual(self.client.get("/health").status_code, 401)
            self.assertEqual(self.client.get("/health", headers={"X-Chatbot-Key": "private-test-key"}).status_code, 200)

    def test_hosted_profile_refuses_an_empty_key(self):
        with patch.dict("os.environ", {"CHATBOT_REQUIRE_SERVICE_KEY": "true", "CHATBOT_SERVICE_KEY": ""}):
            with self.assertRaises(RuntimeError):
                with TestClient(app):
                    self.fail("Hosted service must not start without its key.")

    def test_invalid_thread_count_fails_before_loading_a_model(self):
        with patch.dict("os.environ", {"CHATBOT_THREADS": "0"}):
            with self.assertRaises(ValueError):
                with TestClient(app):
                    self.fail("Zero worker threads must not be accepted.")


class DeploymentTests(unittest.TestCase):
    def test_public_ip_produces_ip_based_hostname(self):
        self.assertEqual(hostname_for("8.8.8.8"), "fragrance-chat.8-8-8-8.sslip.io")
        for address in ["127.0.0.1", "10.0.0.1", "203.0.113.10"]:
            with self.assertRaises(ValueError):
                hostname_for(address)

    def test_configuration_preserves_an_existing_key(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / ".env"
            write_configuration("8.8.8.8", output)
            contents = output.read_text()
            key = contents.split("CHATBOT_SERVICE_KEY=")[1].strip()
            self.assertEqual(len(key), 64)
            with self.assertRaises(FileExistsError):
                write_configuration("8.8.4.4", output)
            self.assertEqual(contents, output.read_text())

    def test_healthcheck_uses_the_key_and_requires_ready_true(self):
        with patch.dict("os.environ", {"CHATBOT_SERVICE_KEY": "test-health-key"}):
            with patch("healthcheck.urlopen", return_value=io.BytesIO(b'{"ready":true}')) as call:
                self.assertTrue(is_ready())
                request = call.call_args[0][0]
                self.assertEqual(request.get_header("X-chatbot-key"), "test-health-key")
            with patch("healthcheck.urlopen", return_value=io.BytesIO(b'{"ready":false}')):
                self.assertFalse(is_ready())


if __name__ == "__main__":
    torch.set_num_threads(2)
    unittest.main()
