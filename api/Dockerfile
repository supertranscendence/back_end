FROM node:16.18-alpine3.16
COPY ./app .
RUN yarn install
EXPOSE 3000
ENTRYPOINT ["sh","start.sh"]