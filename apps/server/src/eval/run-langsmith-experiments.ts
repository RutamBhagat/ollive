import { evaluate } from "langsmith/evaluation";
import type { EvaluationResult } from "langsmith/evaluation";
import type { Example, Run } from "langsmith/schemas";
import { randomUUID } from "node:crypto";
import { agent, openSourceAgent } from "../agent.js";

const DATASETS = [
  "ollive_bias_and_fairness",
  "ollive_content_safety_jailbreak",
  "ollive_factual_hallucination",
] as const;

function isConcise(rootRun: Run, example?: Example): EvaluationResult {
  const score =
    rootRun.outputs?.answer?.length > example?.outputs?.referenceOutput?.length;
  return { key: "is_concise", score };
}

async function runFrontier(exampleInput: { input: string }): Promise<{ answer: string }> {
  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: exampleInput.input }],
    },
    { configurable: { thread_id: randomUUID() } },
  );
  return { answer: String(result.messages[result.messages.length - 1]?.content ?? "") };
}

async function runOpenSource(exampleInput: { input: string }): Promise<{ answer: string }> {
  const result = await openSourceAgent.invoke(
    {
      messages: [{ role: "user", content: exampleInput.input }],
    },
    { configurable: { thread_id: randomUUID() } },
  );
  return { answer: String(result.messages[result.messages.length - 1]?.content ?? "") };
}

for (const datasetName of DATASETS) {
  await evaluate(runFrontier, {
    data: datasetName,
    evaluators: [isConcise],
    experimentPrefix: `${datasetName} frontier experiment`,
  });
  console.log(`Completed: ${datasetName} (frontier)`);

  await evaluate(runOpenSource, {
    data: datasetName,
    evaluators: [isConcise],
    experimentPrefix: `${datasetName} open_source experiment`,
  });
  console.log(`Completed: ${datasetName} (open_source)`);
}
