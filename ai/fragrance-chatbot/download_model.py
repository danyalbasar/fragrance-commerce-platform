"""Download public model files once; inference never contacts an external AI API."""

import argparse
import json
from pathlib import Path

from huggingface_hub import HfApi, snapshot_download

MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct"
DEFAULT_DIR = Path(__file__).resolve().parent / "artifacts/base-model"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DEFAULT_DIR)
    parser.add_argument("--revision", help="Optional exact model commit for reproducibility.")
    args = parser.parse_args()
    # Resolve to one exact commit and record it so training and serving use the same weights.
    revision = HfApi().model_info(MODEL_ID, revision=args.revision).sha
    snapshot_download(
        MODEL_ID, revision=revision, local_dir=args.output,
        allow_patterns=["*.json", "*.safetensors", "*.txt", "*.model", "README.md", "LICENSE*"],
    )
    (args.output / "download.json").write_text(
        json.dumps({"model_id": MODEL_ID, "revision": revision}, indent=2), encoding="utf-8"
    )
    print(f"Downloaded {MODEL_ID} at {revision} to {args.output}")


if __name__ == "__main__":
    main()
