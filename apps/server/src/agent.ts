import { createAgent } from "langchain";
import { TOOLS } from "./tools.js";
import { SYSTEM_PROMPT } from "./prompts.js";

export const agent = createAgent({
  model: "anthropic:claude-haiku-4-5",
  tools: TOOLS,
  systemPrompt: SYSTEM_PROMPT,
});
