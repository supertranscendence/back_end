#!/bin/sh

sudo docker compose -f ~/Desktop/EntityConnect/docker-compose.yml down
# shellcheck disable=SC2046
#sudo docker rmi -f $(sudo docker images -f "dangling=true" -q)