import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestappModule } from './testapp/testapp.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.DB_HOST_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      // entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: false,
      // retryDelay: 3000,
      // retryAttempts: 10
    }),
    TestappModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
