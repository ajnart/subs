FROM node

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./

USER node
COPY --chown=node:node . .
RUN cp .env.example .env &&\
    npm install
#RUN npm run build

EXPOSE 3000

ENTRYPOINT ["npm", "run", "dev"]
