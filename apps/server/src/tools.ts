import nerdamer from "nerdamer-prime";
import { tool } from "langchain";
import { z } from "zod";

export const calculator = tool(
  async ({ expression }) => {
    try {
      const result = nerdamer(expression).evaluate();
      return `${result.text()}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return `Error evaluating expression: ${message}`;
    }
  },
  {
    name: "calculator",
    description:
      "Evaluate mathematical expressions using symbolic math syntax (e.g. '2+2', 'sin(pi/2)', 'x^2+2*x+1' with substitutions inline).",
    schema: z.object({
      expression: z
        .string()
        .min(1)
        .describe("A mathematical expression to evaluate"),
    }),
  },
);

export const getCurrentTime = tool(
  async () => {
    const now = new Date();
    return `Current date and time: ${now.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })}`;
  },
  {
    name: "get_current_time",
    description:
      "Get the current date and time. Use this when the user asks about the current time or date.",
    schema: z.object({}),
  },
);

export const TOOLS = [calculator, getCurrentTime];
