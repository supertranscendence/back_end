# PingPong Game Server

- ### function

  - Application for PingPong Game
  - use nestjs and Socket I/O
  - use Oauth 2.0 but you must need 42 account

- ### usage

  - dev, test: in app/api yarn start:dev
  - prod: docker compose up

- ### environment(.env, .env.dev, .env.test)

  - you need .env file for prod

  - for dev, test also you need .env.dev and .env.test

  - below is format

    ```.env
    POSTGRES_HOST=
    POSTGRES_DB=
    DB_HOST_PORT=
    POSTGRES_USER=
    POSTGRES_PASSWORD=
    JWT_SECRET=
    AID=(42 api id)
    APW=(42 api pw)
    URL=(redirect url)
    FRONTEND_URL=(front end url)
    DOMAIN=(back end domain)
    ```