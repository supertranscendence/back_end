// import { Module } from '@nestjs/common';
// import { TestappService } from './services/testapp.service';
// import { TestappController } from './controllers/testapp.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { testapp } from './entities/testapp.entity'; // appModule 부분에서 entities를 할당합니다.

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([testapp]) // 이게 무엇인가! testapp라는 app안에서 testapp.module.ts에서 entities안에 정의된 모델을 import
//                                         // testapp entity가 있는 곳의 testappModule에 TypeOrmModule의 forFeature 메서드를 통해 testapp 엔티티를 import해줍시다.
//                                         // forFeature는 통해 repository를 특정 scope에 등록합시다. 다른 말로는 repository를 특정 모듈에등록하는겁니다.
//   ],
//   providers: [TestappService],
//   controllers: [TestappController]
// })
// export class TestappModule {}
