FROM node:16.18-alpine3.16
COPY . .
RUN yarn install
#COPY hello.js .
ENTRYPOINT ["node","hello.js"]