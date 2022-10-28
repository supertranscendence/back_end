#!/bin/sh

sudo docker compose -f ~/test/docker-compose.yml down
# shellcheck disable=SC2046
sudo docker rmi $(sudo docker images -f "dangling=true" -q)