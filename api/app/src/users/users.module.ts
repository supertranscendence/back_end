import { Module } from '@nestjs/common';
import { UsersController } from './controller/users.controller';
import { UsersRepository } from './repository/users.repository';
import { UsersService } from './services/users.service';
import { AuthService } from '../auth/auth.service';
import { AuthRepository } from '../auth/auth.repository';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, AuthService, AuthRepository],
})
export class UsersModule {}
