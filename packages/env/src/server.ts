import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    OLLAMA_PROXY_URL: z.url().optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_PROXY_URL: z.url().optional(),
    LANGSMITH_API_KEY: z.string().min(1),
    LANGSMITH_PROJECT: z.string().min(1),
    LANGSMITH_TRACING: z.enum(["true", "false"]).default("false"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
