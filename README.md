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

- `qwen3.5:9b`

Start Ollama:

```bash
ollama serve
```

Pull the model if needed:

```bash
ollama pull qwen3.5:9b
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
