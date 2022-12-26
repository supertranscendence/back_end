import { Logger, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthRepository } from '../auth/auth.repository';
import { AuthService } from '../auth/auth.service';
import { FtStrategy } from '../auth/ft.strategy';
import { UsersRepository } from '../users/repository/users.repository';
import { UsersService } from '../users/services/users.service';
import { MyGateway } from './gateway';
import { RoomService } from './room.service';
import { SUserService } from './socketUser.service';
import { SGameService } from './sgame.service';
import { GameroomService } from './gameroom.service';
import { FriendsRepository } from '../friends/repository/friends.repository';
import { GameService } from '../game/services/game.service';
import { GameRepository } from '../game/repository/game.repository';
import { AchievementsRepository } from '../achievements/repository/achievements.repository';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [
    MyGateway,
    UsersService,
    UsersRepository,
    AuthService,
    AuthRepository,
    FtStrategy,
    RoomService,
    GameroomService,
    SUserService,
    SGameService,
    Logger,
    FriendsRepository,
    GameRepository,
    GameService,
    AchievementsRepository
  ],
})
export class GatewayModule {}
