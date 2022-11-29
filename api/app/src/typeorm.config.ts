import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from "@nestjs/typeorm"

import {ConfigService} from '@nestjs/config';
import {Injectable} from "@nestjs/common";



@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly config: ConfigService) {
    }
    createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: this.config.get('POSTGRES_HOST'),
            port: this.config.get('DB_HOST_PORT'),
            username: this.config.get('POSTGRES_USER'),
            password: this.config.get('POSTGRES_PASSWORD'),
            database: this.config.get('POSTGRES_DB'),
            entities: ['dist/**/*{.ts,.js}'], //entities는 엔티티 파일들이 위치하는 경로를 설정한다.
            //         'src/entities/*.ts 의 원래 파일들을 저기에서 찾아오기!
            //entities: ['/entities/Game'],
            // dist/**/*.entity{.ts,.js}q
            synchronize: false,
            retryDelay: 3000,
            retryAttempts: 10
        }
    }
}
