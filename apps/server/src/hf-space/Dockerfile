FROM ollama/ollama:latest

ENV OLLAMA_HOST=0.0.0.0:7860
ENV OLLAMA_MODELS=/tmp/ollama-models

EXPOSE 7860

ENTRYPOINT ["/bin/sh", "-c"]

CMD ["mkdir -p /tmp/ollama-models && \
  ollama serve & \
  until ollama list >/dev/null 2>&1; do sleep 1; done; \
  ollama pull qwen2.5:0.5b-instruct; \
  wait"]