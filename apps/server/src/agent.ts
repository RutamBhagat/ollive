import { createAgent } from "langchain";
import { ChatOllama } from "@langchain/ollama";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "@ollive/env/server";
import { TOOLS } from "./tools.js";
import { SYSTEM_PROMPT } from "./prompts.js";

export const TIMEOUT_MS = 60_000;

const frontierMemory = new MemorySaver();
const openSourceMemory = new MemorySaver();

export const agent = createAgent({
  model: new ChatOpenAI({
    model: "gpt-5.4-mini",
    timeout: TIMEOUT_MS,
    maxRetries: 0,
    ...(env.OPENAI_PROXY_URL
      ? { configuration: { baseURL: env.OPENAI_PROXY_URL } }
      : {}),
  }),
  tools: TOOLS,
  systemPrompt: SYSTEM_PROMPT,
  checkpointer: frontierMemory,
});

const openSourceAgentGraph = createAgent({
  model: new ChatOllama({
    model: "qwen2.5:0.5b-instruct",
    maxRetries: 0,
    ...(env.OLLAMA_PROXY_URL ? { baseUrl: env.OLLAMA_PROXY_URL } : {}),
  }),
  tools: TOOLS,
  systemPrompt: SYSTEM_PROMPT,
  checkpointer: openSourceMemory,
});

export const openSourceAgent = openSourceAgentGraph.withConfig({
  timeout: TIMEOUT_MS,
});
