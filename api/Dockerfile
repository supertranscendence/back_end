FROM node:16.18-alpine3.16
COPY ./app .
RUN yarn install
ENTRYPOINT ["node","hello.js"]