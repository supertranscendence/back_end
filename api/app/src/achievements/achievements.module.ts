import { Module } from '@nestjs/common';
import { AchievementsService } from './services/achievements.service';
import { AchievementsController } from './controller/achievements.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Achievements } from 'src/entities/Achievements';
import { AchievementsRepository } from './repository/achievements.repository';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Achievements])
  ],
  providers: [AchievementsService, AchievementsRepository],
  controllers: [AchievementsController]
})
export class AchievementsModule {}
