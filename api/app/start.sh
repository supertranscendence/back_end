#!/bin/sh

yarn install
yarn build
export NODE_ENV=prod && pm2-runtime start dist/main.js --name api
