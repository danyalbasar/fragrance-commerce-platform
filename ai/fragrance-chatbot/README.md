# Fragrance chatbot: open-model learning lab

For your live Vercel/Render website, start with [Cloudflare Workers AI setup](CLOUDFLARE_DEPLOYMENT.md): it serves a hosted Llama model through your existing API, using a backend-only Cloudflare token and the free daily allocation.

The local learning lab uses **Qwen2.5-0.5B-Instruct** and optionally loads a LoRA adapter you train yourself. The model has about 0.49 billion parameters and an Apache 2.0 license; see the [model card](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct). Local Qwen inference does not need an external AI API key. Its trained adapters are not compatible with the hosted Llama model.

Use your CPU for the base chatbot and short training checks. Use an interactive Google Colab GPU runtime for longer training experiments. Free GPU access and session duration vary: [Colab FAQ](https://research.google.com/colaboratory/faq.html). Colab is the training environment; run the website's model service locally or on a separate server.

## How the pieces connect

```text
Next.js ChatWidget
    -> POST /api/chat (ASP.NET Core)
        -> query active products and an allowlist of public store policies
        -> POST /generate (local Python/FastAPI service)
            -> Qwen base model + optional trained LoRA adapter
        <- generated answer + independent live product cards
```

Catalog retrieval is a simple keyword search limited to three matching products. It is not semantic search and does not search private customer records. The model receives public names, descriptions, active variant prices, availability, and excerpts of public store policies. Cards use database prices; generated text can still be wrong. The assistant currently handles each question independently rather than remembering conversation history.

`knowledge.json` provides reviewed, keyword-matched reference notes. The initial attar definition cites the [American Heritage Dictionary](https://www.ahdictionary.com/word/search.html?q=attar). The base model incorrectly called attar incense even with reference context during a smoke check. Simple attar definition questions therefore return the reviewed answer directly and are labeled **Reviewed reference**, while other replies are generated and labeled experimental. Supplying facts does not guarantee factual generation. Reference retrieval and this reviewed-answer path do not change model weights; LoRA training is separate. Notebook baseline and adapter comparisons use the same reference notes and show actual generated answers.

## Run locally on Windows

The [Oracle deployment guide](ORACLE_DEPLOYMENT.md) is an alternative for hosting your own Qwen Python service if you obtain an Always Free VM. The [Cloudflare guide](CLOUDFLARE_DEPLOYMENT.md) is the current live deployment path and needs no VM. Run `python prepare_deployment.py` only when preparing an Oracle upload bundle.

Run these commands from `ai/fragrance-chatbot`:

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install "torch>=2.6,<3" --index-url https://download.pytorch.org/whl/cpu
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe download_model.py
.venv\Scripts\python.exe inference.py "What is attar?"
.venv\Scripts\python.exe -m uvicorn serve:app --host 127.0.0.1 --port 8001
```

The first download is roughly 1 GB. Inference loads local files with remote code disabled; it does not send customer questions to Hugging Face. Model caches, adapters, virtual environments, and generated bundles are ignored by Git. Dependencies are bounded in `requirements.txt`; `requirements.lock.txt` records the versions verified on Windows CPU (install that file to reproduce this environment; Colab uses the portable requirements).

Start the ASP.NET API and Next.js app using the repository's normal commands. The backend defaults to `http://127.0.0.1:8001/`, and the widget appears on public storefront pages. In `backend/FragranceCommerce.Api/.env`, optional settings are:

```dotenv
CHATBOT_BASE_URL=http://127.0.0.1:8001/
CHATBOT_ENABLED=true
CHATBOT_SERVICE_KEY=
```

For a remote model service, set `CHATBOT_SERVICE_KEY` in Python and the matching backend value (or `Chatbot__ServiceKey` in deployment environment variables). Use a private network or HTTPS. The key stays on the backend. ASP.NET requests time out after 90 seconds; inference is capped at 128 new tokens and approximately 60 seconds. One CPU generation runs at a time, with a friendly busy response for concurrent requests. The public endpoint allows 15 requests per minute per IP.

If the API runs in Docker and Python runs on the host, use `CHATBOT_BASE_URL=http://host.docker.internal:8001/`, bind Python to `0.0.0.0`, and configure matching service keys. A hosted API needs a separately reachable model service with enough RAM; the project's Render free API instance is not the place to load these model weights.

Set `NEXT_PUBLIC_CHATBOT_ENABLED=false` before building the frontend to hide the experimental widget. Set `Chatbot__Enabled=false` on the backend to disable generation too.

## Learn and train in Colab

```powershell
.venv\Scripts\python.exe prepare_colab.py
```

Upload `fine_tune_colab.ipynb` using **File > Upload notebook** in Colab. Its first cell requests `artifacts/colab-source.zip`. The bundle contains only the explicitly listed training sources and starter dataset, plus your base model revision when already downloaded. The notebook covers tokenization, baseline responses, frozen base weights, LoRA, answer-only loss masking, optimizer updates, loss plots, and before/after comparisons.

`data/starter.json` contains 30 topics, with four question phrasings per topic. The first three phrasings train the adapter; the fourth is held out. This split tests familiar-domain paraphrases with shared answer families. Add independently reviewed examples and an unseen-topic test set before making quality claims. Do not train on live prices, passwords, payment information, or private orders.

For a short CPU plumbing check:

```powershell
.venv\Scripts\python.exe train.py --device cpu --steps 2 --batch-size 1 --eval-every 2
```

For a GPU run in Colab, the notebook uses:

```bash
python train.py --device cuda --steps 150 --batch-size 2 --eval-every 25
```

The script saves the trained adapter with the lowest validation loss to `artifacts/adapter` and records the base revision, seed, metrics, and saved step in `training.json`. Step zero is the unmodified base baseline; a saved adapter can still perform worse than that baseline. Compare the answers before enabling it. Only LoRA adapters are saved, not another copy of all base weights.

After downloading the Colab adapter, extract it to `artifacts/adapter`, then serve it:

```powershell
$env:CHATBOT_ADAPTER_DIR = (Resolve-Path artifacts\adapter).Path
.venv\Scripts\python.exe -m uvicorn serve:app --host 127.0.0.1 --port 8001
```

The base model revision must match the adapter's `training.json`. To fetch the appropriate base revision, use `download_model.py --revision <revision-from-training.json>`. Restart the Python service whenever you replace the adapter.

## Verification

```powershell
# From ai/fragrance-chatbot
.venv\Scripts\python.exe -m unittest discover -s tests -v

# From the repository root
dotnet run --project tests/FragranceCommerce.Chat.Tests

# Optional: real Python model service, with isolated catalog fixtures (no database)
dotnet run --project tests/FragranceCommerce.Chat.Tests -- --live-model
```

Python tests check answer-only labels, held-out phrasings, LoRA updates with frozen base weights, service authentication, invalid requests, missing models, and concurrent inference. Backend contract checks use a fake model HTTP service and catalog, so no database or model download is required. Actual inference is a separate manual smoke check.

Read [PEFT's quicktour](https://huggingface.co/docs/peft/quicktour) for how adapter training and loading work.
