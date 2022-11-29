import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './typeorm.config';
import { AchievementsModule } from './achievements/achievements.module';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './users/users.module';
import { AchievementsCodeModule } from './achievements_code/achievements_code.module';
import { GameModule } from './game/game.module';
import {AuthModule} from "./auth/auth.module";
import {ConfigModule} from "@nestjs/config";
import {validate} from "./env.validation";
import {ConfigService} from "@nestjs/config";
// import { TestModule } from './test/test.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : process.env.NODE_ENV === 'prod' ? '.env' : '.env.test',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      inject: [ConfigService]
    }),
    // TestappModule,
    GameModule,
    AchievementsModule,
    FriendsModule,
    UsersModule,
    AchievementsCodeModule,
      AuthModule
  ],
  controllers: [],
})
export class AppModule {}
