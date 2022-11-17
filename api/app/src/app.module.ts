import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './typeorm.config';
import { AchievementsModule } from './achievements/achievements.module';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './users/users.module';
import { AchievementsCodeModule } from './achievements_code/achievements_code.module';
// import { GameRepository } from './game/repository/game.repository';
import { GameModule } from './game/game.module';
// import { TestModule } from './test/test.module';



@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    // TestappModule,
    GameModule,
    AchievementsModule,
    FriendsModule,
    UsersModule,
    AchievementsCodeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
