import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { FtStrategy } from './ft.strategy';
import { UsersService } from '../users/services/users.service';
import { UsersRepository } from '../users/repository/users.repository';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    FtStrategy,
    UsersService,
    UsersRepository,
  ],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
