#!/bin/sh

yarn install
yarn build
pm2-runtime start dist/main.js --name api
