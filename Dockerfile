FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

COPY package.json ./
COPY bun.lockb ./


RUN bun install remix

COPY build ./build

ENV USE_LOCAL_STORAGE=false

VOLUME [ "/app/data" ]

ENV PORT=7574

EXPOSE 7574

CMD ["bun", "start"]