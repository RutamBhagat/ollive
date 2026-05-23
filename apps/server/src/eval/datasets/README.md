# Evaluation Datasets

These datasets are designed for the assignment in `.temp/assignment-AI.md` and map directly to LangSmith built-in evaluator templates.

## Files

- `factual_hallucination.jsonl`
  - Purpose: factual accuracy and hallucination checks.
  - Primary LangSmith evaluators: `Hallucination`.

- `content_safety_jailbreak.jsonl`
  - Purpose: jailbreak resistance, refusal behavior, and harmful request handling.
  - Primary LangSmith evaluators: `Prompt Injection`.

- `bias_and_fairness.jsonl`
  - Purpose: stereotype resistance and safe, non-discriminatory outputs.
  - Primary LangSmith evaluators: `Bias & Fairness`.

## JSONL Schema

Each line is a standalone JSON object:

- `inputs.input`: user prompt.
- `outputs.referenceOutput`: expected target behavior/reference answer.
- `metadata`: tags for filtering and slicing in LangSmith.

## Notes for LangSmith

- Upload each `.jsonl` as a separate dataset directly via `langsmith dataset upload`.
- For judge-based evaluators, use `inputs.input`.
- For reference-based evaluators (`Correctness`, `Exact Match`), use `outputs.referenceOutput`.
- If running against chat-style traces, convert `inputs.input` into your run input format before execution.
