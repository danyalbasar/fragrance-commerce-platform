"""Run locally: python -m uvicorn serve:app --host 127.0.0.1 --port 8001."""

from contextlib import asynccontextmanager
import hmac
import logging
import os
from pathlib import Path
import threading

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
import torch

from inference import DEFAULT_MODEL_DIR, ModelRuntime, reviewed_answer

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app):
    if os.environ.get("CHATBOT_REQUIRE_SERVICE_KEY", "false").lower() == "true" and not os.environ.get("CHATBOT_SERVICE_KEY", "").strip():
        raise RuntimeError("Set CHATBOT_SERVICE_KEY before starting the hosted model service.")
    threads = int(os.environ.get("CHATBOT_THREADS", "4"))
    if not 1 <= threads <= 32:
        raise ValueError("CHATBOT_THREADS must be between 1 and 32.")
    torch.set_num_threads(threads)
    app.state.model = None
    app.state.metadata = None
    app.state.lock = threading.Lock()
    model_dir = Path(os.environ.get("CHATBOT_MODEL_DIR", str(DEFAULT_MODEL_DIR)))
    adapter = os.environ.get("CHATBOT_ADAPTER_DIR")
    if (model_dir / "download.json").is_file():
        try:
            app.state.model = ModelRuntime(model_dir, Path(adapter) if adapter else None)
            app.state.metadata = {"model": app.state.model.model_id, "fine_tuned": app.state.model.fine_tuned}
        except (ValueError, RuntimeError, OSError, KeyError):
            logger.exception("Could not load the chatbot model")
    yield


app = FastAPI(title="Fragrance open-model service", lifespan=lifespan)


def authorize(x_chatbot_key: str = Header(default="")):
    expected = os.environ.get("CHATBOT_SERVICE_KEY", "")
    if expected and not hmac.compare_digest(x_chatbot_key.encode("utf-8"), expected.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid service key.")


class GenerateRequest(BaseModel):
    message: str = Field(min_length=1, max_length=600)
    context: str = Field(default="", max_length=6000)


@app.get("/health", dependencies=[Depends(authorize)])
def health():
    return {"ready": app.state.model is not None, "metadata": app.state.metadata}


@app.post("/generate", dependencies=[Depends(authorize)])
def generate(request: GenerateRequest):
    if app.state.model is None:
        raise HTTPException(status_code=503, detail="Download the base model and restart the service first.")
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=422, detail="Please enter a question.")
    reference = reviewed_answer(message)
    if reference:
        return {"reply": reference, "source": "reviewed-reference", "experimental": False}
    # Serialize CPU inference; concurrent requests fail quickly instead of queueing forever.
    if not app.state.lock.acquire(blocking=False):
        raise HTTPException(status_code=429, detail="The learning model is busy. Try again shortly.")
    try:
        answer = app.state.model.reply(message, request.context)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    finally:
        app.state.lock.release()
    if not answer:
        raise HTTPException(status_code=502, detail="The learning model produced an empty answer.")
    return {"reply": answer, "source": "open-model", "experimental": True}
