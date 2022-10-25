FROM node:16.18-alpine3.16
WORKDIR /app
#COPY package.json package-lock.json ./
RUN npm ci
#COPY hello.js .
ENTRYPOINT ["node","hello.js"]