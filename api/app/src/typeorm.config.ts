import { TypeOrmModuleOptions } from "@nestjs/typeorm"

import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot()

export const typeORMConfig : TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.DB_HOST_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: ['dist/**/*.entity{.ts,.js}'], //entities는 엔티티 파일들이 위치하는 경로를 설정한다.
    synchronize: true,
    retryDelay: 3000,
    retryAttempts: 10
}
