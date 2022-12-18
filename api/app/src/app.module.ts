import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './typeorm.config';
import { AchievementsModule } from './achievements/achievements.module';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './users/users.module';
import { AchievementsCodeModule } from './achievements_code/achievements_code.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { ConfigService } from '@nestjs/config';
// import { TestModule } from './test/test.module';
import { GatewayModule } from './gateway/gateway.module';
import { ExceptionModule } from './exception/exception.module';
import { LoggerMiddleware } from './logger.middleware';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PW,
          },
        },
        defaults: {
          from: '"no-reply" <abc@def.com>',
        },
        preview: true,
      }),
    }),
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'dev'
          ? '.env.dev'
          : process.env.NODE_ENV === 'prod'
          ? '.env'
          : '.env.test',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      inject: [ConfigService],
    }),
    // TestappModule,
    GameModule,
    AchievementsModule,
    FriendsModule,
    UsersModule,
    AchievementsCodeModule,
    AuthModule,
    GatewayModule,
    ExceptionModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
