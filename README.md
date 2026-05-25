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

Upsert the three datasets:

```bash
bun run langsmith:upload
```

Run experiments for both assistants (`agent` and `openSourceAgent`) on all three datasets:

```bash
bun run langsmith:eval
```
