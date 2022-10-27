FROM node:18.12-alpine3.16
COPY ./app .
RUN yarn global add pm2
RUN yarn global add @nestjs/cli
RUN yarn set version stable
RUN yarn install
ENTRYPOINT ["sh","start.sh"]