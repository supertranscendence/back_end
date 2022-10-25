FROM node:16.18-alpine3.16
WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN npm ci
#COPY hello.js .
ENTRYPOINT ["node","hello.js"]