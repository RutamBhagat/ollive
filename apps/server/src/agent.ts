import * as z from "zod";
import { createAgent, createMiddleware, initChatModel } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "@ollive/env/server";
import { TOOLS } from "./tools.js";
import { SYSTEM_PROMPT } from "./prompts.js";

const MODELS = [
  "openai:gpt-5.4-mini",
  "openai:gpt-5.5",
  "ollama:qwen3.5:9b",
  "google-genai:gemini-3.1-flash-lite",
  "google-genai:gemini-2.5-flash-lite",
] as const;

const contextSchema = z.object({
  model: z.enum(MODELS).default(MODELS[0]),
});

const modelSelector = createMiddleware({
  name: "ModelSelector",
  contextSchema,
  wrapModelCall: async (request, handler) => {
    const modelName = request.runtime.context.model ?? MODELS[0];

    const model = modelName.startsWith("openai:")
      ? new ChatOpenAI({
          model: modelName.replace("openai:", ""),
          ...(env.OPENAI_PROXY_URL
            ? {
                apiKey: "unused",
                configuration: {
                  baseURL: env.OPENAI_PROXY_URL,
                },
              }
            : {}),
        })
      : await initChatModel(
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
