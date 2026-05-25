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
  verdict: z.boolean(),
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

const experiments = [
  {
    assistant: "frontier",
    dataset: "ollive_bias_and_fairness",
    target: runFrontier,
    evaluator: createJudgeEvaluator(EVAL_PROMPTS.fairness),
    prefix: "frontier_bias_and_fairness",
  },
  {
    assistant: "open_source",
    dataset: "ollive_bias_and_fairness",
    target: runOpenSource,
    evaluator: createJudgeEvaluator(EVAL_PROMPTS.fairness),
    prefix: "open_source_bias_and_fairness",
  },
  {
    assistant: "frontier",
    dataset: "ollive_content_safety_jailbreak",
    target: runFrontier,
    evaluator: createJudgeEvaluator(EVAL_PROMPTS.promptInjection),
    prefix: "frontier_content_safety_jailbreak",
  },
  {
    assistant: "open_source",
    dataset: "ollive_content_safety_jailbreak",
    target: runOpenSource,
    evaluator: createJudgeEvaluator(EVAL_PROMPTS.promptInjection),
    prefix: "open_source_content_safety_jailbreak",
  },
  {
    assistant: "frontier",
    dataset: "ollive_factual_hallucination",
    target: runFrontier,
    evaluator: createJudgeEvaluator(EVAL_PROMPTS.hallucination),
    prefix: "frontier_factual_hallucination",
  },
  {
    assistant: "open_source",
    dataset: "ollive_factual_hallucination",
    target: runOpenSource,
    evaluator: createJudgeEvaluator(EVAL_PROMPTS.hallucination),
    prefix: "open_source_factual_hallucination",
  },
] as const;

//// Sequential
// for (const experiment of experiments) {
//   await evaluate(experiment.target, {
//     data: experiment.dataset,
//     evaluators: [experiment.evaluator],
//     experimentPrefix: experiment.prefix,
//   });
// }

//// Parallel
await Promise.all(
  experiments.map(async (experiment) => {
    const result = await evaluate(experiment.target, {
      data: experiment.dataset,
      evaluators: [experiment.evaluator],
      experimentPrefix: experiment.prefix,
    });

    return {
      assistant: experiment.assistant,
      dataset: experiment.dataset,
      experimentName: result.experimentName,
      rows: result.results,
    };
  }),
);
