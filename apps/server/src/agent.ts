import * as z from "zod";
import { createAgent, createMiddleware, initChatModel } from "langchain";
import { env } from "@ollive/env/server";
import { TOOLS } from "./tools.js";
import { SYSTEM_PROMPT } from "./prompts.js";

const MODELS = [
  "ollama:gemma4:26b",
  "ollama:qwen3.5:9b", // NOTE: do not switch between local models you will run out of vram, you must stop the other local model first
  "google-genai:gemini-3.1-flash-lite",
  "google-genai:gemini-2.5-flash-lite",
  "openai:gpt-5.4-mini",
  "openai:gpt-5.5",
] as const;

const contextSchema = z.object({
  model: z.enum(MODELS).default(MODELS[0]),
});

const modelSelector = createMiddleware({
  name: "ModelSelector",
  contextSchema,
  wrapModelCall: async (request, handler) => {
    const modelName = request.runtime.context.model ?? MODELS[0];
    const model = await initChatModel(
      modelName,
      modelName.startsWith("ollama:") && env.OLLAMA_HOST
        ? { baseUrl: env.OLLAMA_HOST }
        : undefined,
    );

    return handler({
      ...request,
      model,
    });
  },
});

export const agent = createAgent({
  model: MODELS[0],
  tools: TOOLS,
  systemPrompt: SYSTEM_PROMPT,
  contextSchema,
  middleware: [modelSelector],
});
