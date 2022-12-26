import { Module } from '@nestjs/common';
import { AchievementsService } from './services/achievements.service';
import { AchievementsController } from './controller/achievements.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Achievements } from 'src/entities/Achievements';
import { AchievementsRepository } from './repository/achievements.repository';
import { UsersRepository } from '../users/repository/users.repository';
import { AuthService } from '../auth/auth.service';
import { AuthRepository } from '../auth/auth.repository';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Achievements])
  ],
  providers: [AchievementsService, AchievementsRepository, UsersRepository, AuthService, AuthRepository],
  controllers: [AchievementsController]
})
export class AchievementsModule {}
