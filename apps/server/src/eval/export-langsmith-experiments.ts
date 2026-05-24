import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { stringify } from "csv-stringify/sync";
import type { ExperimentResultRow } from "langsmith/evaluation";

type ExperimentExport = {
  assistant: "frontier" | "open_source";
  dataset: string;
  rows: ExperimentResultRow[];
};

export async function exportLangSmithExperiments(
  experiments: ExperimentExport[],
) {
  const exportDir = fileURLToPath(new URL("./export/", import.meta.url));

  await rm(exportDir, { force: true, recursive: true });
  await mkdir(exportDir, { recursive: true });

  const rows = experiments.map((experiment) => {
    const scores = experiment.rows
      .map((row) => row.evaluationResults.results[0]?.score)
      .filter((score): score is number => typeof score === "number");

    if (scores.length === 0) {
      throw new Error(`No scores found for ${experiment.dataset}`);
    }

    const totalScore = scores.reduce((total, score) => total + score, 0);
    const passingScores = scores.filter((score) => score >= 8);

    return {
      assistant: experiment.assistant,
      dataset: experiment.dataset,
      examples: scores.length,
      average_score: Number((totalScore / scores.length).toFixed(2)),
      pass_rate: Number((passingScores.length / scores.length).toFixed(2)),
    };
  });

  await writeFile(
    `${exportDir}/results.csv`,
    stringify(rows, { header: true }),
  );
  console.log(`Exported LangSmith results to ${exportDir}`);
}
