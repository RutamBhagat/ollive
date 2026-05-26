# Setup

## Prerequisites

- Bun 1.3+
- Git
- OpenAI-compatible API key for the frontier assistant and judge model
- LangSmith API key from `https://smith.langchain.com/o/<your-org-id>/settings/apikeys`
- Ollama only if you want to run the OSS model locally instead of the hosted HF Space

```bash
git clone git@github.com:RutamBhagat/ollive.git
cd ollive
bun install
cp apps/server/.env.example apps/server/.env
```

## Environment

Update `apps/server/.env`:

```bash
OPENAI_API_KEY=...
OPENAI_PROXY_URL=
OLLAMA_PROXY_URL=https://rutambhagat-ollama-qwen.hf.space
LANGSMITH_API_KEY=...
LANGSMITH_PROJECT=ollive
LANGSMITH_TRACING=true
```

`OPENAI_PROXY_URL` is optional. Use it only for an OpenAI-compatible proxy.

The default OSS endpoint is the public Hugging Face Space. For local Ollama instead:

```bash
ollama serve
ollama pull qwen2.5:0.5b-instruct
```

Then set:

```bash
OLLAMA_PROXY_URL=http://localhost:11434
```

## Run the assistants

```bash
bun run dev
```

LangGraph Studio should open automatically. If not, open the Studio URL printed in the terminal.

Available graphs:

- `agent` - frontier assistant using `gpt-5.4-mini`
- `openSourceAgent` - OSS assistant using `qwen2.5:0.5b-instruct`

Both assistants use the same system prompt, calculator tool, current-time tool, and short-term memory.

Useful manual checks:

- turn on `show tool calls`
- ask a math question to verify the calculator tool
- ask for the current date/time to verify the time tool
- test memory with two messages such as `My name is ...` then `What is my name?`
- try prompts from `apps/server/src/eval/datasets`

## Run evaluations

Manually upload the JSONL files from `apps/server/src/eval/datasets` to LangSmith.

Go to:

```text
https://smith.langchain.com/o/<your-org-id>/datasets
```

Create these datasets with the exact names:

- `ollive_bias_and_fairness`
- `ollive_content_safety_jailbreak`
- `ollive_factual_hallucination`

Then run:

```bash
bun run langsmith:eval
```

The evaluators are already defined in code, so you do not need to create evaluators in LangSmith manually. The eval runner is `apps/server/src/eval/run-langsmith-experiments.ts` and the judge prompts are in `apps/server/src/eval/judge-prompts.ts`.

The OSS endpoint can cold start on the HF free tier, so the first request may be slow. The eval runs are intentionally kept sequential because parallel model calls can exhaust the Hugging Face Space resources.

## Results

- CSV exports and charts: `apps/server/src/eval/export/hf_spaces`
- Local GPU comparison exports: `apps/server/src/eval/export/local_gpu`

## HF Space deployment

`apps/server/src/hf-space` contains the Docker Space files required for deploying the Ollama-compatible OSS endpoint.

To create your own Space:

1. Go to `https://huggingface.co/spaces` and sign in.
2. Select **New Space**.
3. Give it a name.
4. Select **Docker** as the Space SDK.
5. Use **CPU Basic** hardware for the same setup.
6. Create the Space.
7. Upload the files from `apps/server/src/hf-space`.
8. Wait for the Docker build and model pull to finish.
9. Open the deployed Space URL:

```text
https://<username>-<space-name>.hf.space
```

Set the app to use that endpoint:

```bash
OLLAMA_PROXY_URL=https://<username>-<space-name>.hf.space
```

Public endpoint used for this submission:

```text
https://rutambhagat-ollama-qwen.hf.space
```
