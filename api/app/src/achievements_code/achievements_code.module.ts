import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsCode } from 'src/entities/AchievementsCode';
import { AchievementsCodeController } from './controller/achievements_code.controller';
import { AchievementsCodeRepository } from './repository/achievements_code.repository';
import { AchievementsCodeService } from './services/achievements_code.service';

@Module({
  imports: [
    // TypeOrmModule.forFeature([AchievementsCode])
  ],
  controllers: [AchievementsCodeController],
  providers: [AchievementsCodeService, AchievementsCodeRepository]
})
export class AchievementsCodeModule {}
