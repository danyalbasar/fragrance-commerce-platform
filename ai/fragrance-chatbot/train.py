"""Fine-tune a small open model with LoRA. This is supervised training, not pretraining."""

import argparse
import json
from pathlib import Path
import random
import time

from peft import LoraConfig, get_peft_model
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

from inference import DEFAULT_MODEL_DIR, ROOT, build_messages


def load_examples(path: Path):
    train, validation, seen = [], [], set()
    for topic in json.loads(path.read_text(encoding="utf-8")):
        questions, answer = topic["questions"], topic["answer"].strip()
        if len(questions) < 2 or not answer:
            raise ValueError("Each topic needs an answer and at least two question phrasings.")
        for index, question in enumerate(questions):
            key = " ".join(question.lower().split())
            if not key or key in seen:
                raise ValueError(f"Empty or duplicate question: {question!r}")
            seen.add(key)
            (validation if index == len(questions) - 1 else train).append((question, answer))
    if not train or not validation:
        raise ValueError("Training and validation sets must both be nonempty.")
    return train, validation


def make_batch(examples, tokenizer, device, max_length=512):
    sequences, labels = [], []
    for question, answer in examples:
        prefix = tokenizer.apply_chat_template(
            build_messages(question), tokenize=True, add_generation_prompt=True
        )
        completion = tokenizer.encode(answer, add_special_tokens=False) + [tokenizer.eos_token_id]
        sequence = prefix + completion
        if len(sequence) > max_length:
            raise ValueError(f"Example exceeds the token limit: {question}")
        sequences.append(sequence)
        labels.append([-100] * len(prefix) + completion)
    length = max(map(len, sequences))
    ids = torch.full((len(sequences), length), tokenizer.eos_token_id, dtype=torch.long)
    attention = torch.zeros_like(ids)
    targets = torch.full_like(ids, -100)
    for row, sequence in enumerate(sequences):
        ids[row, :len(sequence)] = torch.tensor(sequence)
        attention[row, :len(sequence)] = 1
        targets[row, :len(sequence)] = torch.tensor(labels[row])
    return {"input_ids": ids.to(device), "attention_mask": attention.to(device), "labels": targets.to(device)}


@torch.no_grad()
def evaluate(model, examples, tokenizer, device):
    model.eval()
    total_loss, total_tokens = 0.0, 0
    for example in examples:
        batch = make_batch([example], tokenizer, device)
        count = int((batch["labels"][:, 1:] != -100).sum())
        total_loss += model(**batch).loss.item() * count
        total_tokens += count
    model.train()
    return total_loss / total_tokens


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-dir", type=Path, default=DEFAULT_MODEL_DIR)
    parser.add_argument("--data", type=Path, default=ROOT / "data/starter.json")
    parser.add_argument("--output", type=Path, default=ROOT / "artifacts/adapter")
    parser.add_argument("--device", choices=["auto", "cpu", "cuda"], default="auto")
    parser.add_argument("--steps", type=int, default=150)
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--eval-every", type=int, default=25)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    if min(args.steps, args.batch_size, args.eval_every) < 1:
        parser.error("Steps, batch size, and eval interval must be positive.")
    device = args.device
    if device == "auto":
        device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == "cuda" and not torch.cuda.is_available():
        parser.error("CUDA unavailable. Choose a Colab GPU runtime or use --device cpu.")
    torch.set_num_threads(4)
    torch.manual_seed(args.seed)
    random.seed(args.seed)
    metadata = json.loads((args.model_dir / "download.json").read_text(encoding="utf-8"))
    tokenizer = AutoTokenizer.from_pretrained(args.model_dir, local_files_only=True, trust_remote_code=False)
    dtype = torch.bfloat16 if device == "cuda" and torch.cuda.is_bf16_supported() else torch.float32
    base = AutoModelForCausalLM.from_pretrained(
        args.model_dir, local_files_only=True, trust_remote_code=False,
        use_safetensors=True, torch_dtype=dtype,
    ).to(device)
    model = get_peft_model(base, LoraConfig(
        task_type="CAUSAL_LM", r=8, lora_alpha=16, lora_dropout=0.05,
        target_modules=["q_proj", "v_proj"],
    ))
    model.config.use_cache = False
    model.print_trainable_parameters()
    train, validation = load_examples(args.data)
    for example in train + validation:
        make_batch([example], tokenizer, "cpu")
    optimizer = torch.optim.AdamW((p for p in model.parameters() if p.requires_grad), lr=2e-4)
    args.output.mkdir(parents=True, exist_ok=True)
    report = {
        **metadata, "seed": args.seed, "device": device,
        "training_examples": len(train), "validation_examples": len(validation),
        "validation_scope": "Held-out phrasings of known answer families, not unseen topics.",
        "metrics": [],
    }
    started = time.monotonic()
    best = float("inf")

    def record(step):
        nonlocal best
        train_loss = evaluate(model, train[:12], tokenizer, device)
        val_loss = evaluate(model, validation, tokenizer, device)
        report["metrics"].append({"step": step, "train_loss_sample": train_loss,
                                  "validation_loss": val_loss, "seconds": round(time.monotonic() - started, 2)})
        # Save a trained adapter; keep step zero as the comparison baseline only.
        if step > 0 and val_loss < best:
            best = val_loss
            report["best_step"] = step
            model.save_pretrained(args.output, safe_serialization=True)
        (args.output / "training.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"step {step:3d} | train sample {train_loss:.3f} | validation {val_loss:.3f}", flush=True)

    record(0)
    for step in range(1, args.steps + 1):
        batch = make_batch(random.choices(train, k=args.batch_size), tokenizer, device)
        loss = model(**batch).loss
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        if step % args.eval_every == 0 or step == args.steps:
            record(step)
    print(f"Saved adapter to {args.output}; compare its answers with the base model before serving it.", flush=True)


if __name__ == "__main__":
    main()
