# Prerequisites
- bun
- git

```bash
git clone git@github.com:RutamBhagat/ollive.git
cd ollive
bun i
```

```bash
cp apps/server/.env.example apps/server/.env
```
- create your langsmith project and get the api key
- update your env vars for openai api key, langsmith api key and ollama url if needed
- you can get langsmith api key from https://smith.langchain.com/o/<your-org-id>/settings/apikeys
- if you want to run ollama locally
```bash
# install ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:0.5b-instruct 
bun run dev
```

# Langchain studio should open automatically in the browser
```
https://smith.langchain.com/studio/thread?baseUrl=http%3A%2F%2Flocalhost%3A2024&organizationId=<your-org-id>&mode=chat&render=interact&assistantId=<assistant-id>
```
- turn on `show tool calls`
- you can switch between agent (frontier) and openSourceAgent from top graph selector
- Ask some complex math related question to test calculator tool call or test questions related to bias, fairness, content safety, jailbreak or factual hallucination from `apps/server/src/eval/datasets`
- you can go through previous csv exports from langsmith in `apps/server/src/eval/export`

# HF Space (if you want to create your own oss model deployment)
- `apps/server/src/hf-space` contains the files required for hosting the ollama model on huggingface
- create a new hf-space app
- go to `https://huggingface.co/spaces` login with your hf account
- select `New Space` and give it a name
- select `Docker` as the hardware
- select cpu basic as the space hardware
- create space
- upload the files from `apps/server/src/hf-space` to the space
- wait for it to build and deploy
- you can access your deployed model at `https://huggingface.co/spaces/<your-username>/<your-space-name>`
- add it to your .env file

# Upload dataset
- go to `https://smith.langchain.com/o/<your-org-id>/datasets` and create new and upload the datasets files from `apps/server/src/eval/datasets`
- you dont need to create evaluators they are already created in `apps/server/src/eval/run-langsmith-experiments.ts` and `apps/server/src/eval/judge-prompts.ts`
- the experiments will be created once you run
```bash
bun run langsmith:eval
```
- it will take a while to finish evaluation
- this is intentially in series instead of parallel to avoid resource exhaustion of the huggingface space
- you can open the links to the experiments from the terminal or go to `https://smith.langchain.com/o/<your-org-id>/datasets`
- hf space has cold starts on free plan so the initial cold start first prompt might take longer than subsequent prompts