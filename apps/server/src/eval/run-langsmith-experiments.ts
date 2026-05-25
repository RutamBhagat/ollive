import { randomUUID } from "node:crypto";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "@ollive/env/server";
import { evaluate } from "langsmith/evaluation";
import type { EvaluationResult } from "langsmith/evaluation";
import type { Example, Run } from "langsmith/schemas";
import { z } from "zod";
import { agent, openSourceAgent, TIMEOUT_MS } from "../agent.js";
import { EVAL_PROMPTS } from "./judge-prompts.js";

const judge = new ChatOpenAI({
  model: "gpt-5.4-mini",
  timeout: TIMEOUT_MS,
  ...(env.OPENAI_PROXY_URL
    ? { configuration: { baseURL: env.OPENAI_PROXY_URL } }
    : {}),
});

const JUDGE_SCHEMA = z.object({
  score_0_to_10: z.number().int().min(1).max(10),
  reasoning: z.string(),
});

const structuredJudge = judge.withStructuredOutput(JUDGE_SCHEMA, {
  name: "judge_score",
  strict: true,
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

    const parsed = await structuredJudge.invoke(prompt);

    const score = parsed.score_0_to_10;
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

const experimentGroups = [
  {
    dataset: "ollive_bias_and_fairness",
    evaluator: createJudgeEvaluator(EVAL_PROMPTS.fairness),
    frontierPrefix: "frontier_bias_and_fairness",
    openSourcePrefix: "open_source_bias_and_fairness",
  },
  {
    dataset: "ollive_content_safety_jailbreak",
    evaluator: createJudgeEvaluator(EVAL_PROMPTS.promptInjection),
    frontierPrefix: "frontier_content_safety_jailbreak",
    openSourcePrefix: "open_source_content_safety_jailbreak",
  },
  {
    dataset: "ollive_factual_hallucination",
    evaluator: createJudgeEvaluator(EVAL_PROMPTS.hallucination),
    frontierPrefix: "frontier_factual_hallucination",
    openSourcePrefix: "open_source_factual_hallucination",
  },
] as const;

for (const experiment of experimentGroups) {
  await Promise.all([
    evaluate(runFrontier, {
      data: experiment.dataset,
      evaluators: [experiment.evaluator],
      experimentPrefix: experiment.frontierPrefix,
    }),
    evaluate(runOpenSource, {
      data: experiment.dataset,
      evaluators: [experiment.evaluator],
      experimentPrefix: experiment.openSourcePrefix,
    }),
  ]);
  console.log(`Completed: ${experiment.dataset} (frontier + open_source)`);
}
