FROM node:16.18-alpine3.16
WORKDIR /usr/app
#COPY ./app/package.json ./app/package-lock.json ./
COPY . .
RUN yarn
#COPY hello.js .
ENTRYPOINT ["node","hello.js"]