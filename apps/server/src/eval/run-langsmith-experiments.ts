import { evaluate } from "langsmith/evaluation";
import { randomUUID } from "node:crypto";
import { agent, openSourceAgent } from "../agent.js";

const DATASETS = [
  "ollive_bias_and_fairness",
  "ollive_content_safety_jailbreak",
  "ollive_factual_hallucination",
] as const;

async function runFrontier(exampleInput: {
  input: string;
}): Promise<{ answer: string }> {
  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: exampleInput.input }],
    },
    { configurable: { thread_id: randomUUID() } },
  );
  return {
    answer: String(result.messages[result.messages.length - 1]?.content ?? ""),
  };
}

async function runOpenSource(exampleInput: {
  input: string;
}): Promise<{ answer: string }> {
  const result = await openSourceAgent.invoke(
    {
      messages: [{ role: "user", content: exampleInput.input }],
    },
    { configurable: { thread_id: randomUUID() } },
  );
  return {
    answer: String(result.messages[result.messages.length - 1]?.content ?? ""),
  };
}

//// sequencial execution because of API rate limits
for (const datasetName of DATASETS) {
  await Promise.all([
    evaluate(runFrontier, {
      data: datasetName,
      experimentPrefix: `${datasetName} frontier experiment`,
    }),
    evaluate(runOpenSource, {
      data: datasetName,
      experimentPrefix: `${datasetName} open_source experiment`,
    }),
  ]);
  console.log(`Completed: ${datasetName} (frontier + open_source)`);
}
