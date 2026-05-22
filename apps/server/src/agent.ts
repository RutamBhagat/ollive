import { createAgent } from "langchain";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { env } from "@ollive/env/server";
import { TOOLS } from "./tools.js";
import { SYSTEM_PROMPT } from "./prompts.js";

const frontierMemory = new MemorySaver();
const openSourceMemory = new MemorySaver();

export const agent = createAgent({
  model: new ChatOpenAI({
    model: "gpt-5.4-mini",
    ...(env.OPENAI_PROXY_URL
      ? { configuration: { baseURL: env.OPENAI_PROXY_URL } }
      : {}),
  }),
  tools: TOOLS,
  systemPrompt: SYSTEM_PROMPT,
  checkpointer: frontierMemory,
});

export const openSourceAgent = createAgent({
  model: new ChatOllama({
    model: "qwen3.5:9b",
    ...(env.OLLAMA_PROXY_URL ? { baseUrl: env.OLLAMA_PROXY_URL } : {}),
  }),
  tools: TOOLS,
  systemPrompt: SYSTEM_PROMPT,
  checkpointer: openSourceMemory,
});
