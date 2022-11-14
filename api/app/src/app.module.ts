import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestappModule } from './testapp/testapp.module';
import { typeORMConfig } from './typeorm.config';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    TestappModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
