FROM node:18.12-alpine3.16
COPY ./app .
RUN yarn set version stable
RUN yarn install
ENTRYPOINT ["sh","start.sh"]