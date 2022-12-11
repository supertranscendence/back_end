import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthRepository } from '../auth/auth.repository';
import { AuthService } from '../auth/auth.service';
import { FtStrategy } from '../auth/ft.strategy';
import { UsersRepository } from '../users/repository/users.repository';
import { UsersService } from '../users/services/users.service';
import { MyGateway } from './gateway';
import { RoomService } from './room.service';
import { SUserService } from './socketUser.service';

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
    SUserService,
  ],
})
export class GatewayModule {}
