FROM ollama/ollama:latest

ENV OLLAMA_HOST=0.0.0.0:7860

EXPOSE 7860

RUN ollama serve & \
    pid=$!; \
    sleep 5; \
    ollama pull qwen2.5:0.5b-instruct; \
    kill $pid

CMD ["serve"]