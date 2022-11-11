import { Module } from '@nestjs/common';
import { TestappService } from './services/testapp.service';
import { TestappController } from './controllers/testapp.controller';

@Module({
  providers: [TestappService],
  controllers: [TestappController]
})
export class TestappModule {}
