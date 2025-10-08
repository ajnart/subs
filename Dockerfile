FROM node:23-alpine

# Set the working directory inside the container
WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

COPY . /app/

RUN npm install

RUN npm run build

ENV USE_LOCAL_STORAGE=false

VOLUME [ "/app/data" ]

ENV PORT=7574

EXPOSE 7574

CMD ["npm", "run", "start"]