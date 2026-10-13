"""Create a portable source bundle and a teaching notebook; exclude models and secrets."""

import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent
SOURCE_FILES = ["requirements.txt", "inference.py", "knowledge.json", "download_model.py", "train.py", "data/starter.json"]


def cell(kind, text):
    result = {"cell_type": kind, "metadata": {}, "source": text.splitlines(keepends=True)}
    if kind == "code":
        result.update(execution_count=None, outputs=[])
    return result


def main():
    artifacts = ROOT / "artifacts"
    artifacts.mkdir(exist_ok=True)
    with ZipFile(artifacts / "colab-source.zip", "w", ZIP_DEFLATED) as archive:
        for name in SOURCE_FILES:
            archive.write(ROOT / name, name)
        metadata = artifacts / "base-model/download.json"
        if metadata.exists():
            archive.write(metadata, "base_revision.json")
    cells = [
        cell("markdown", """# Fine-tune your fragrance assistant with LoRA

You are adapting **Qwen2.5-0.5B-Instruct**, an open instruction model. Its base weights stay frozen; LoRA learns small adapter matrices. No OpenAI API key is needed.

Choose **Runtime > Change runtime type > GPU** in Colab when available. Free GPUs are not guaranteed. Use Colab for interactive training, then download the adapter and serve it locally.

This starter has 90 training examples and 30 held-out question phrasings. Their answer families overlap, so validation measures familiar-domain phrasing performance, not unseen-topic generalization. Treat this as a learning experiment.
"""),
        cell("markdown", "## 1. Upload the source bundle\nRun `python prepare_colab.py` locally, then upload `artifacts/colab-source.zip` below. The bundle contains only an explicit list of source files, starter data, and optional model revision metadata.\n"),
        cell("code", """from google.colab import files
from pathlib import Path
from zipfile import ZipFile
import io, os

uploaded = files.upload()
assert len(uploaded) == 1, "Upload only colab-source.zip"
source_bytes = next(iter(uploaded.values()))
allowed = {"requirements.txt", "inference.py", "knowledge.json", "download_model.py", "train.py", "data/starter.json", "base_revision.json"}
work = Path("/content/fragrance-chatbot")
work.mkdir(exist_ok=True)
with ZipFile(io.BytesIO(source_bytes)) as archive:
    assert set(archive.namelist()) <= allowed, "Unexpected files in source bundle"
    assert sum(info.file_size for info in archive.infolist()) < 5_000_000, "Bundle too large"
    for name in archive.namelist():
        destination = work / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(archive.read(name))
os.chdir(work)
"""),
        cell("markdown", "## 2. Install libraries and download the base model\nThe exact model commit is recorded so the adapter can be paired with the same base weights locally.\n"),
        cell("code", """import subprocess, sys, json
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "-r", "requirements.txt"])
command = [sys.executable, "download_model.py"]
if Path("base_revision.json").exists():
    command += ["--revision", json.loads(Path("base_revision.json").read_text())["revision"]]
subprocess.check_call(command)
import torch
device = "cuda" if torch.cuda.is_available() else "cpu"
print("Device:", device)
if device == "cpu":
    print("Training works on CPU, but select a GPU runtime for faster experiments.")
"""),
        cell("markdown", "## 3. Record baseline answers and inspect tokenization\nKeep the same questions for the comparison after training. Notice that tokens are subwords, not whole sentences.\n"),
        cell("code", """import gc
from inference import ModelRuntime
from train import load_examples
train_examples, validation_examples = load_examples(Path("data/starter.json"))
print("Train / validation:", len(train_examples), len(validation_examples))
questions = ["What does attar mean?", "What perfume style is good for the office?", "Can you tell me the price of a product?"]
runtime = ModelRuntime(device=device)
print(runtime.tokenizer.tokenize("A bright citrus fragrance"))
baseline = {question: runtime.reply(question) for question in questions}
for question, answer in baseline.items():
    print(question, "\\nBASE:", answer, "\\n")
del runtime
gc.collect()
if device == "cuda":
    torch.cuda.empty_cache()
"""),
        cell("markdown", """## 4. Train the adapter

Read `train.py` alongside this cell. It masks prompt tokens with `-100`, computes next-token cross-entropy on answers, backpropagates, and updates only the LoRA parameters with AdamW. The seed makes dataset sampling repeatable; GPU kernels may still vary.

Start with 150 steps on GPU. On CPU, use 2 steps as a plumbing check before attempting a longer run. This is not evidence of a useful fine-tune by itself.
"""),
        cell("code", """steps = 150 if device == "cuda" else 2
subprocess.check_call([sys.executable, "train.py", "--device", device,
                       "--steps", str(steps), "--batch-size", "2", "--eval-every", "25"])
"""),
        cell("markdown", "## 5. Inspect training and validation loss\nLower loss means the model assigns more probability to the target answer tokens. It does not guarantee factual correctness. Rising validation loss alongside falling training loss can indicate overfitting. Step zero is the base-model baseline.\n"),
        cell("code", """import matplotlib.pyplot as plt
report = json.loads(Path("artifacts/adapter/training.json").read_text())
metrics = report["metrics"]
plt.plot([m["step"] for m in metrics], [m["train_loss_sample"] for m in metrics], label="Training sample loss")
plt.plot([m["step"] for m in metrics], [m["validation_loss"] for m in metrics], label="Held-out phrasing loss")
plt.xlabel("Optimizer step")
plt.ylabel("Answer token cross-entropy")
plt.legend()
plt.show()
print("Best saved adapter step:", report["best_step"])
"""),
        cell("markdown", "## 6. Compare the same questions before and after\nCheck whether answers improve, whether unsupported facts appear, and whether general language ability deteriorates. Also test new questions that were never included in either split.\n"),
        cell("code", """runtime = ModelRuntime(adapter_dir=Path("artifacts/adapter"), device=device)
for question in questions:
    print(question, "\\nBASE:", baseline[question], "\\nADAPTER:", runtime.reply(question), "\\n")
del runtime
gc.collect()
if device == "cuda":
    torch.cuda.empty_cache()
"""),
        cell("markdown", "## 7. Download your adapter\nExtract this zip into the local `artifacts/adapter` folder. It contains adapter weights, not the full base model. Set `CHATBOT_ADAPTER_DIR` to that folder and restart the Python service. Confirm the base revision in `training.json` matches local `artifacts/base-model/download.json`.\n"),
        cell("code", """from zipfile import ZIP_DEFLATED
with ZipFile("fragrance-adapter.zip", "w", ZIP_DEFLATED) as archive:
    for name in ["adapter_config.json", "adapter_model.safetensors", "training.json"]:
        archive.write(Path("artifacts/adapter") / name, name)
files.download("fragrance-adapter.zip")
"""),
        cell("markdown", """## Next experiments

- Add reviewed, varied examples and separate genuinely unseen topics into an additional test set.
- Change the learning rate or LoRA rank one at a time, then compare loss and answers.
- Include examples with supplied store context, teaching the model to use it and admit missing information.
- Keep changing prices and inventory in the database. Fine-tuning shapes behaviour; live retrieval supplies current facts.

References: [Qwen model card](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct), [PEFT quicktour](https://huggingface.co/docs/peft/quicktour), [Colab FAQ](https://research.google.com/colaboratory/faq.html).
"""),
    ]
    notebook = {"cells": cells, "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}, "language_info": {"name": "python"}, "colab": {"name": "Fragrance LoRA learning lab"}}, "nbformat": 4, "nbformat_minor": 5}
    for index, item in enumerate(cells):
        item["id"] = f"fragrance-{index:02d}"
    (ROOT / "fine_tune_colab.ipynb").write_text(json.dumps(notebook, indent=2) + "\n", encoding="utf-8")
    print(f"Prepared {artifacts / 'colab-source.zip'} and {ROOT / 'fine_tune_colab.ipynb'}")


if __name__ == "__main__":
    main()
