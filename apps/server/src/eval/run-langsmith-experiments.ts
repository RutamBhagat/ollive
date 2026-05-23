import { randomUUID } from "node:crypto";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "@ollive/env/server";
import { evaluate } from "langsmith/evaluation";
import type { EvaluationResult } from "langsmith/evaluation";
import type { Example, Run } from "langsmith/schemas";
import { agent, openSourceAgent } from "../agent.js";
import { EVAL_PROMPTS } from "./judge-prompts.js";

const judge = new ChatOpenAI({
  model: "gpt-5.4-mini",
  ...(env.OPENAI_PROXY_URL
    ? { configuration: { baseURL: env.OPENAI_PROXY_URL } }
    : {}),
});

function createJudgeEvaluator(promptTemplate: string) {
  return async (run: Run, example?: Example): Promise<EvaluationResult[]> => {
    const prompt = promptTemplate
      .replaceAll("{{inputs}}", JSON.stringify(run.inputs ?? {}))
      .replaceAll("{{outputs}}", JSON.stringify(run.outputs ?? {}))
      .replaceAll(
        "{{reference_outputs}}",
        JSON.stringify(example?.outputs ?? {}),
      );

    const response = await judge.invoke(prompt);
    const parsed = JSON.parse(String(response.content ?? "{}")) as {
      score_0_to_10?: number;
      verdict?: boolean;
      reasoning?: string;
    };

    const score = Math.max(0, Math.min(10, Number(parsed.score_0_to_10 ?? 0)));
    const reasoning = parsed.reasoning ?? "";

    return [{ key: "score", score, comment: reasoning }];
  };
}

const runFrontier = async (exampleInput: {
  input: string;
}): Promise<{ answer: string }> => {
  const result = await agent.invoke(
    { messages: [{ role: "user", content: exampleInput.input }] },
    { configurable: { thread_id: randomUUID() } },
  );
  return {
    answer: String(result.messages[result.messages.length - 1]?.content ?? ""),
  };
};

const runOpenSource = async (exampleInput: {
  input: string;
}): Promise<{ answer: string }> => {
  const result = await openSourceAgent.invoke(
    { messages: [{ role: "user", content: exampleInput.input }] },
    { configurable: { thread_id: randomUUID() } },
  );
  return {
    answer: String(result.messages[result.messages.length - 1]?.content ?? ""),
  };
};

await Promise.all([
  evaluate(runFrontier, {
    data: "ollive_bias_and_fairness",
    evaluators: [createJudgeEvaluator(EVAL_PROMPTS.fairness)],
    experimentPrefix: "ollive_bias_and_fairness frontier experiment",
  }),
  evaluate(runOpenSource, {
    data: "ollive_bias_and_fairness",
    evaluators: [createJudgeEvaluator(EVAL_PROMPTS.fairness)],
    experimentPrefix: "ollive_bias_and_fairness open_source experiment",
  }),
  evaluate(runFrontier, {
    data: "ollive_content_safety_jailbreak",
    evaluators: [createJudgeEvaluator(EVAL_PROMPTS.promptInjection)],
    experimentPrefix: "ollive_content_safety_jailbreak frontier experiment",
  }),
  evaluate(runOpenSource, {
    data: "ollive_content_safety_jailbreak",
    evaluators: [createJudgeEvaluator(EVAL_PROMPTS.promptInjection)],
    experimentPrefix: "ollive_content_safety_jailbreak open_source experiment",
  }),
  evaluate(runFrontier, {
    data: "ollive_factual_hallucination",
    evaluators: [createJudgeEvaluator(EVAL_PROMPTS.hallucination)],
    experimentPrefix: "ollive_factual_hallucination frontier experiment",
  }),
  evaluate(runOpenSource, {
    data: "ollive_factual_hallucination",
    evaluators: [createJudgeEvaluator(EVAL_PROMPTS.hallucination)],
    experimentPrefix: "ollive_factual_hallucination open_source experiment",
  }),
]);
