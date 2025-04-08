FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

# Install dependencies
RUN bun install --include=dev

# Copy the rest of your application code
COPY . .

# Build the Remix app for production
RUN bun run build

ENV USE_LOCAL_STORAGE=false


VOLUME [ "/app/data" ]

EXPOSE 3000


CMD ["bun", "start"]