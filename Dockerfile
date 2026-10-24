FROM --platform=$BUILDPLATFORM oven/bun:1.4.3-alpine AS build

WORKDIR /app
ENV DATA_DIR=/data
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --linker hoisted
COPY . .
RUN bun run build:server

FROM oven/bun:1.4.3-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=7574
ENV HOST=0.0.0.0
ENV DATA_DIR=/data
COPY --from=build --chown=bun:bun /app/.output ./.output
COPY --from=build --chown=bun:bun /app/scripts/reset-pin.ts ./scripts/reset-pin.ts
RUN mkdir -p /data && chown bun:bun /data
USER bun
VOLUME ["/data"]
EXPOSE 7574
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD bun -e "fetch('http://127.0.0.1:' + (process.env.PORT || '7574') + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", ".output/server/index.mjs"]
