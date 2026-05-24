import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { stringify } from "csv-stringify/sync";
import type { ExperimentResultRow } from "langsmith/evaluation";

type ExperimentExport = {
  assistant: "frontier" | "open_source";
  dataset: string;
  experimentName: string;
  rows: ExperimentResultRow[];
};

export async function exportLangSmithExperiments(
  experiments: ExperimentExport[],
) {
  const exportDir = fileURLToPath(
    new URL("./export/", import.meta.url),
  );

  await rm(exportDir, { force: true, recursive: true });
  await mkdir(exportDir, { recursive: true });

  const rows = experiments.flatMap((experiment) =>
    experiment.rows.map((row) => {
      const score = row.evaluationResults.results[0];

      return {
        assistant: experiment.assistant,
        dataset: experiment.dataset,
        experiment_name: experiment.experimentName,
        run_id: row.run.id,
        example_id: row.example.id,
        input: row.run.inputs.input,
        reference_output: JSON.stringify(row.example.outputs ?? {}),
        answer: row.run.outputs?.answer,
        score: score?.score,
        comment: score?.comment,
        total_tokens: row.run.total_tokens,
        prompt_tokens: row.run.prompt_tokens,
        completion_tokens: row.run.completion_tokens,
      };
    }),
  );

  await writeFile(`${exportDir}/results.csv`, stringify(rows, { header: true }));
  await writeFile(
    `${exportDir}/summary.json`,
    JSON.stringify(
      experiments.map((experiment) => ({
        assistant: experiment.assistant,
        dataset: experiment.dataset,
        experimentName: experiment.experimentName,
        rows: experiment.rows.length,
      })),
      null,
      2,
    ),
  );

  console.log(`Exported LangSmith results to ${exportDir}`);
}
