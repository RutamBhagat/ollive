import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    CORS_ORIGIN: z.url().optional(),
    GOOGLE_API_KEY: z.string().min(1).optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    OLLAMA_HOST: z.url().optional().default("http://localhost:11434"),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_PROXY_URL: z.url().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
