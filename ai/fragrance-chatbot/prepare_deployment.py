"""Bundle only deployment sources. Never include .env, keys, or the local virtualenv."""

from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent
DEPLOYMENT_FILES = [
    "Dockerfile", ".dockerignore", "compose.oracle.yml", "Caddyfile", "requirements.txt",
    "download_model.py", "inference.py", "serve.py", "healthcheck.py", "knowledge.json",
    "configure_deployment.py", "ORACLE_DEPLOYMENT.md",
]


def prepare():
    destination = ROOT / "artifacts/oracle-deployment.zip"
    destination.parent.mkdir(exist_ok=True)
    with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
        for name in DEPLOYMENT_FILES:
            archive.write(ROOT / name, name)
    return destination


if __name__ == "__main__":
    print(prepare())
