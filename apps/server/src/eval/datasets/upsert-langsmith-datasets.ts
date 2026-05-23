import { basename, join } from "node:path";

const datasetsDirectory = "apps/server/src/eval/datasets";
const datasetFiles = Array.from(
  new Bun.Glob("*.jsonl").scanSync({ cwd: datasetsDirectory }),
).sort();

if (datasetFiles.length === 0) {
  console.log(`No dataset files found in ${datasetsDirectory}`);
  process.exit(0);
}

for (const datasetFile of datasetFiles) {
  const datasetPath = join(datasetsDirectory, datasetFile);
  const datasetName = basename(datasetFile, ".jsonl");

  const getDataset = Bun.spawnSync(["langsmith", "dataset", "get", datasetName], {
    stdout: "ignore",
    stderr: "ignore",
  });
  if (getDataset.exitCode === 0) {
    console.log(`Replacing existing dataset: ${datasetName}`);
    const deleteDataset = Bun.spawnSync([
      "langsmith",
      "dataset",
      "delete",
      datasetName,
      "--yes",
    ]);
    if (deleteDataset.exitCode !== 0) {
      console.error(`Failed to delete dataset: ${datasetName}`);
      process.exit(deleteDataset.exitCode);
    }
  }

  console.log(`Creating dataset: ${datasetName}`);
  const createDataset = Bun.spawnSync([
    "langsmith",
    "dataset",
    "create",
    "--name",
    datasetName,
  ]);
  if (createDataset.exitCode !== 0) {
    console.error(`Failed to create dataset: ${datasetName}`);
    process.exit(createDataset.exitCode);
  }

  const datasetText = await Bun.file(datasetPath).text();
  const datasetRows: Array<{
    inputs: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }> = datasetText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));

  console.log(`Upserting examples for dataset: ${datasetName}`);
  for (const row of datasetRows) {
    const createExampleArgs = [
      "langsmith",
      "example",
      "create",
      "--dataset",
      datasetName,
      "--inputs",
      JSON.stringify(row.inputs),
    ];

    if (row.outputs) {
      createExampleArgs.push("--outputs", JSON.stringify(row.outputs));
    }

    if (row.metadata) {
      createExampleArgs.push("--metadata", JSON.stringify(row.metadata));
    }

    const createExample = Bun.spawnSync(createExampleArgs, {
      stdout: "ignore",
      stderr: "inherit",
    });
    if (createExample.exitCode !== 0) {
      console.error(`Failed to create example in dataset: ${datasetName}`);
      process.exit(createExample.exitCode);
    }
  }
}

console.log("LangSmith dataset upsert complete.");
