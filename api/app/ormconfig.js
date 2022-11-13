module.exports = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: process.env.DB_HOST_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: ['dist/**/*.entity.js'],
    synchronize: true,
    migrationsTableName: "migrations",
    migrations: ["src/database/migrations/*.ts"],
    cli: {
        "migrationsDir": "src/database/migrations"
    }
  };