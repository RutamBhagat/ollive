# Ollive Assignment

This repository contains two LangGraph assistants exposed in LangGraph Studio:

- `agent`: hosted frontier model assistant (`ChatOpenAI`)
- `openSourceAgent`: open-source assistant via Ollama (`ChatOllama`)

Both assistants use the same:

- system prompt
- tools
- short-term memory (LangGraph `MemorySaver`)

## OSS model setup

The OSS assistant is configured to use exactly one model:

- `qwen2.5:0.5b-instruct`

Start Ollama:

```bash
ollama serve
```

Pull the model if needed:

```bash
ollama pull qwen2.5:0.5b-instruct
```

Keep `OLLAMA_PROXY_URL` configured in `apps/server/.env` (see `apps/server/.env.example`):

```bash
OLLAMA_PROXY_URL=http://localhost:11434
```

## Run LangGraph Studio

```bash
bun run dev:server
```

Then open LangGraph Studio and select:

- `agent`
- `openSourceAgent`

## LangSmith eval setup (happy path)

Set these in `apps/server/.env`:

```bash
LANGSMITH_API_KEY=your-langsmith-api-key
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=ollive
```

Create the three datasets manually in the LangSmith dashboard using the JSONL files in `apps/server/src/eval/datasets/`:

- `ollive_bias_and_fairness`
- `ollive_content_safety_jailbreak`
- `ollive_factual_hallucination`

Run experiments for both assistants (`agent` and `openSourceAgent`) on all three datasets:

```bash
bun run langsmith:eval
```

## OSS Model Deployment

The open-source assistant is deployed publicly on Hugging Face Spaces using Ollama.

- Platform: Hugging Face Spaces Docker
- Model: qwen2.5:0.5b-instruct
- Endpoint: https://rutambhagat-ollama-qwen.hf.space
- API: Ollama-compatible `/api/chat`
- Hardware: CPU Basic
- Quantization: Q4_K_M
- Model size: ~398 MB

Example request:

```bash
curl "https://rutambhagat-ollama-qwen.hf.space/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:0.5b-instruct",
    "messages": [{"role":"user","content":"hi"}],
    "stream": false
  }'



## Add this to your cost + latency table

From your test:

| Deployment | Model | Platform | Cost | Total latency | Load time | Output tokens | Approx generation speed |
|---|---|---|---:|---:|---:|---:|---:|
| OSS assistant | Qwen2.5-0.5B-Instruct | HF Spaces CPU Basic | Free | 7.93s | 2.25s | 24 | ~5.6 tok/s |


## Remaining work for the full submission

You are **done with the HF deployment**, but not the full assignment unless these are complete:

1. Wire your app’s OSS assistant to:

```bash
OLLAMA_PROXY_URL=https://rutambhagat-ollama-qwen.hf.space