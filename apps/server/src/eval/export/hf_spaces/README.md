# AI Personal Assistant Evaluation Report

**Submission:** Founding AI/ML Engineer Take-Home  
**Assistants Compared:** Open-source assistant vs frontier model assistant  
**OSS Model:** Qwen2.5-0.5B-Instruct via public Hugging Face Spaces / Ollama-compatible endpoint  
**Frontier Model:** Hosted frontier API assistant  
**Evaluation Date:** 2026-05-25  
**Repository:** `[INSERT_GITHUB_REPO_URL]`  
**OSS Deployment:** `[INSERT_HF_SPACE_OR_PUBLIC_ENDPOINT]`  
**Demo:** `[INSERT_DEMO_LINK_OR_SCREENSHOTS_IF_AVAILABLE]`

---

## 1. Evaluation Setup

The goal was to compare two personal assistants with the same user-facing capabilities:

- Multi-turn assistant behavior
- Short-term conversation context
- Basic personal-assistant style responses
- Same evaluation prompt sets across both systems

The evaluation covered the three required dimensions from the assignment:

| Evaluation Area | What It Tests | Prompt Count | Scoring |
|---|---:|---:|---|
| Factual accuracy / hallucination control | Whether the assistant answers factual prompts correctly without inventing details | 10 | 0-10 |
| Content safety / jailbreak resistance | Whether the assistant refuses unsafe or adversarial harmful requests | 10 | 0-10 |
| Bias and fairness | Whether the assistant avoids stereotypes, discriminatory outputs, and protected-class harm | 10 | 0-10 |

Each assistant was evaluated on the same 30 prompts, giving **60 total model-response evaluations**.

A score of **8/10 or higher** was treated as a passing response.

---

## 2. Headline Results

| Metric | Frontier API | OSS Qwen 0.5B | Winner |
|---|---:|---:|---|
| Factual accuracy / hallucination control | **10.0 / 10** | 6.1 / 10 | Frontier |
| Content safety / jailbreak resistance | **9.8 / 10** | 8.2 / 10 | Frontier |
| Bias and fairness | **9.8 / 10** | 3.7 / 10 | Frontier |

**Summary:**  
The frontier assistant was clearly stronger across all three required evaluation categories. The OSS assistant was usable for simple assistant workflows and performed reasonably on content-safety prompts, but it showed major weakness on factual reliability and especially bias/fairness.

---

## 3. Infographic Summary

### Overall factual accuracy / hallucination comparison

![Factual hallucination comparison](visualizations/compare_factual_hallucination.png)

**Result:**  
The frontier assistant scored **10.0/10**, while the OSS assistant scored **6.1/10**. Using the pass threshold of 8/10, the frontier assistant had a **0% factual failure rate**, while the OSS assistant had a **50% factual failure rate**.

---

### Content safety and jailbreak resistance comparison

![Content safety jailbreak comparison](visualizations/compare_content_safety_jailbreak.png)

**Result:**  
The frontier assistant scored **9.8/10**, while the OSS assistant scored **8.2/10**. The frontier assistant passed **100%** of content-safety prompts, while the OSS assistant passed **80%**.

---

### Bias and fairness comparison

![Bias and fairness comparison](visualizations/compare_bias_and_fairness.png)

**Result:**  
The frontier assistant scored **9.8/10**, while the OSS assistant scored **3.7/10**. This was the largest gap in the evaluation. The OSS assistant passed only **20%** of bias/fairness prompts and had one failed run from the public deployment endpoint.

---

## 4. Detailed Model-Level Visualizations

### Frontier model

![Frontier hallucination](visualizations/frontier_hallucination.png)

![Frontier content safety](visualizations/frontier_content_safety.png)

![Frontier bias and fairness](visualizations/frontier_bias_and_fairness.png)

### Open-source model

![Open source hallucination](visualizations/open_source_hallucination.png)

![Open source content safety](visualizations/open_source_content_safety.png)

![Open source bias and fairness](visualizations/open_source_bias_and_fairness.png)

---

## 5. Pass / Fail Analysis

| Metric | Assistant | Mean Score | Pass Rate | Failure Rate | Errors |
|---|---|---:|---:|---:|---:|
| Factual accuracy | Frontier API | 10.0 | 100% | 0% | 0 |
| Factual accuracy | OSS Qwen 0.5B | 6.1 | 50% | 50% | 0 |
| Content safety | Frontier API | 9.8 | 100% | 0% | 0 |
| Content safety | OSS Qwen 0.5B | 8.2 | 80% | 20% | 0 |
| Bias/fairness | Frontier API | 9.8 | 100% | 0% | 0 |
| Bias/fairness | OSS Qwen 0.5B | 3.7 | 20% | 80% | 1 |

---

## 6. Cost and Latency

| Assistant | Mean Latency | Median Latency | Max Latency | Eval Token Cost |
|---|---:|---:|---:|---:|
| Frontier API | 3.23s | 2.02s | 28.10s | $0.0234 |
| OSS Qwen 0.5B | 7.08s | 4.00s | 26.15s | $0.00 API token cost |

**Note:**  
The OSS assistant had no token API cost in the evaluation logs, but this does not mean it is free in production. Real deployment cost depends on the hosting platform, hardware, concurrency, cold starts, and uptime requirements.

---

## 7. Architecture Notes

Both assistants used the same high-level assistant flow:

![Assistant architecture](visualizations/architechture.png)

The main architectural decision was to keep the assistant interface and evaluation prompt sets consistent across both systems, so the comparison measured model behavior rather than differences in UX or task setup.

---

## 8. Key Tradeoffs

### Frontier assistant

**Strengths**

* Best factual reliability
* Strongest refusal behavior
* Best bias/fairness performance
* Lower average latency than the OSS deployment in this run
* More suitable for production assistant behavior

**Weaknesses**

* Paid API dependency
* Less control over model internals
* Vendor dependency
* Usage cost scales with traffic

### OSS assistant

**Strengths**

* Publicly deployable
* No token API cost in the logged evaluation
* Full control over model/runtime choices
* Useful for prototyping, demos, and constrained assistant tasks

**Weaknesses**

* Weaker factual accuracy
* Poor bias/fairness behavior in this evaluation
* Higher average latency
* More operational burden
* Needs stronger guardrails before production use

---

## 9. Recommendation

For a production-facing personal assistant, I would use the **frontier model assistant as the default** because it was materially stronger across factuality, safety, and fairness.

The OSS assistant is still valuable as a bonus deployment and experimentation path, but it should not be positioned as production-safe without additional work. The most important next steps for the OSS version are:

1. Add a safety classifier or moderation layer before and after generation.
2. Add retrieval or tool grounding for factual prompts.
3. Improve refusal templates for sensitive and protected-class prompts.
4. Add observability for latency, failures, refusal quality, and unsafe outputs.
5. Re-run evals after guardrail changes and track regressions over time.

---

## 10. What I Would Improve With More Time

* Expand the evaluation set from 30 prompts to 100-300 prompts.
* Add public benchmarks such as TruthfulQA-style factual prompts, BBQ/StereoSet-style bias prompts, and jailbreak/safety prompt suites.
* Add LLM-as-judge grading with rubric explanations.
* Add human spot checks for borderline safety and bias examples.
* Add per-category confusion analysis: correct refusal, over-refusal, unsafe compliance, factual error, hallucinated detail.
* Add prompt/version tracking so evals are reproducible across model and system-prompt changes.
* Add latency and cost monitoring by endpoint, prompt type, and response length.
* Test larger OSS models such as Qwen2.5-1.5B/3B or Llama 3.2 variants to measure quality/cost tradeoffs.

---

## Final Verdict

The frontier assistant is the stronger and safer default for the required assistant experience.

The OSS assistant satisfies the open-source deployment requirement and demonstrates the bonus path, but the current evaluation shows it needs stronger safety, grounding, and fairness guardrails before it should be used in a real user-facing product.
