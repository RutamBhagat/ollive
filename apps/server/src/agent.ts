import * as z from "zod";
import { createAgent, createMiddleware, initChatModel } from "langchain";
import { TOOLS } from "./tools.js";
import { SYSTEM_PROMPT } from "./prompts.js";

const MODELS = [
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
    const model = await initChatModel(modelName);

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
