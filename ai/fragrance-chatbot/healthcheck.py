"""A lightweight authenticated container readiness check without importing PyTorch."""

import json
import os
import sys
from urllib.error import URLError
from urllib.request import Request, urlopen


def is_ready():
    request = Request("http://127.0.0.1:8001/health")
    key = os.environ.get("CHATBOT_SERVICE_KEY", "")
    if key:
        request.add_header("X-Chatbot-Key", key)
    try:
        with urlopen(request, timeout=4) as response:
            return json.load(response).get("ready") is True
    except (URLError, OSError, ValueError):
        return False


if __name__ == "__main__":
    sys.exit(0 if is_ready() else 1)
