# Evaluation Report

**Assistants Compared:** Open-source assistant vs frontier model assistant  
**OSS Model:** Qwen2.5-0.5B-Instruct (via public Hugging Face Spaces / Ollama-compatible endpoint) 
**Frontier Model:** gpt-5-mini (via hosted frontier API proxy url)
**Repository:** [Ollive](https://github.com/RutamBhagat/ollive)
**OSS Deployment:** [OSS Model](https://rutambhagat-ollama-qwen.hf.space) 
**Demo:** [YouTube Link](to be recorded)

---

## 1. Evaluation

Compared two personal assistants with the same capabilities:

- Multi-turn assistantance
- Short-term conversation
- Same system and evaluation prompts
- Same tools used

Coveres three dimensions:

| Evaluation Area | It Tests | Prompts Count | Scoring |
|---|---:|---:|---|
| Factual accuracy / hallucination control | Whether the assistant answers factual prompts correctly without inventing details | 10 | 0-10 |
| Content safety / jailbreak resistance | Whether the assistant refuses unsafe or adversarial harmful requests | 10 | 0-10 |
| Bias and fairness | Whether the assistant avoids stereotypes, discriminatory outputs, and protected-class harm | 10 | 0-10 |

Each assistant was evaluated on the same 30 prompts, giving **60 total model-response evaluations**.

A score of **8/10 or higher** was treated as a passing response.

---

## 2. Results

| Metric | Frontier API | OSS Qwen 0.5B | Winner |
|---|---:|---:|---|
| Factual accuracy / hallucination control | **10.0 / 10** | 6.1 / 10 | Frontier |
| Content safety / jailbreak resistance | **9.8 / 10** | 8.2 / 10 | Frontier |
| Bias and fairness | **9.8 / 10** | 3.7 / 10 | Frontier |

**Summary:**  
The frontier assistant was stronger across all three required evaluation categories. The OSS assistant was usable for simple assistant workflows and performed reasonably on content-safety prompts, but it showed major weakness on factual reliability and especially bias/fairness.

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
The OSS assistant had no token API cost in the evaluation logs, but this does not mean it is free in production. The public Hugging Face Spaces path used here runs on free CPU Basic-style infrastructure: **2 vCPU, 16 GB RAM, 50 GB non-persistent disk, no standard GPU, and sleep after inactivity**. That is useful for demos, but constrained for LLM inference.

A local GPU comparison on my workstation — **Ryzen 7 9800X3D, RTX 5080 with 16 GB VRAM, 60 GB system RAM, NVIDIA driver 580 / CUDA 13** — served the same OSS model much faster, averaging roughly **0.22-0.34s** latency across the three eval categories. This means the OSS latency result is mainly a weak deployment/hardware constraint, not an inherent limit of open-source models.

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
* Lower average latency than the OSS deployment in this run (only against the Hugging Face Spaces CPU deployment, locally oss model was much faster because of better hardware)
* More suitable for production assistant behavior

**Weaknesses**

* Usage cost scales with traffic

### OSS assistant

**Strengths**

* Publicly deployable
* No token API cost in the logged evaluation (because of free hugging face space)
* Useful for prototyping, demos

**Weaknesses**

* Weaker factual accuracy
* Poor bias/fairness behavior in this evaluation
* Higher latency on the free public CPU deployment used for the main report
* More deployment complexity when moving to stronger self-hosted hardware
* Needs stronger guardrails before production use
* High number of parallel model calls will overwhelm the hardware

---

## 9. Recommendation

For a production-facing personal assistant, I would use the **frontier model assistant as the default** because it was stronger across factuality, safety, and fairness.

The OSS assistant is still valuable as a bonus deployment and experimentation path, but it should not be positioned as production-safe without additional work. The most important next steps for the OSS version are:

1. Add a safety classifier or moderation layer before and after generation.
2. Improve refusal templates for sensitive and protected-class prompts.

---

## 10. What I Would Improve With More Time

* Expand the evaluation set from 30 prompts to 100-300 prompts.
* Test larger OSS models such as qwen3.5:9b or gemma4:26b variants on Hugging face to measure quality/cost tradeoffs (I have tested them locally and they are much better than the current model but since the Hugging face free tier had resource limitations, I couldn't use them).

---

## Final Verdict

The frontier assistant is the stronger and safer default for the required assistant experience.

The OSS assistant satisfies the open-source deployment requirement and demonstrates the bonus path, but the current evaluation shows it needs stronger safety, grounding, and fairness guardrails before it should be used in a real user-facing product.
