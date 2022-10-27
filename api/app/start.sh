#!/bin/sh

yarn install
yarn build
exec pm2-runtime start dist/main.js --name api
