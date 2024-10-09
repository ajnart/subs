#FROM node:slim AS base
FROM node:slim

RUN mkdir /home/node/app &&\
    mkdir /home/node/pnpm &&\
    chown -R node:node \
      /home/node/app \
      /home/node/pnpm

WORKDIR /home/node/app

ENV PNPM_HOME="/home/node/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY --chown=node:node . .

USER node

RUN cp .env.example .env

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

EXPOSE 3000
CMD [ "pnpm", "run", "dev" ]
