FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/app/artifacts/hf-cache \
    HF_HUB_DISABLE_XET=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# CPU wheels avoid downloading CUDA libraries on an Oracle ARM CPU VM.
RUN python -m pip install --no-cache-dir "torch>=2.6,<3" --index-url https://download.pytorch.org/whl/cpu
COPY requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt

COPY download_model.py inference.py serve.py healthcheck.py knowledge.json ./

# Must match the base revision used by the fine-tuning notebook / adapter.
ARG MODEL_REVISION=7ae557604adf67be50417f59c2c2f167def9a775
RUN python download_model.py --revision "$MODEL_REVISION"

RUN useradd --create-home --uid 1000 chatbot \
    && chown -R chatbot:chatbot /app
USER chatbot

EXPOSE 8001
HEALTHCHECK --interval=30s --timeout=5s --start-period=300s --retries=3 \
    CMD ["python", "healthcheck.py"]

CMD ["python", "-m", "uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8001"]
