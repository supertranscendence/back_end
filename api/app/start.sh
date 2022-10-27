#!/bin/bash

yarn global add pm2
yarn build
pm2-runtime start index.js --name api