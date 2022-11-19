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
    entities: ['dist/**/*{.ts,.js}'], //entities는 엔티티 파일들이 위치하는 경로를 설정한다.
    //         'src/entities/*.ts 의 원래 파일들을 저기에서 찾아오기!
    //entities: ['/entities/Game'],
    // dist/**/*.entity{.ts,.js}q
    synchronize: false,
    retryDelay: 3000,
    retryAttempts: 10
}
