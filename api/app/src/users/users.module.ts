import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { UsersController } from './controller/users.controller';
import { UsersRepository } from './repository/users.repository';
import { UsersService } from './services/users.service';
import { AuthService } from "../auth/auth.service";
import { AuthRepository } from "../auth/auth.repository";

@Module({
  imports: [
    // TypeOrmModule.forFeature([Users, UsersRepository])
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, AuthService, AuthRepository]
})
export class UsersModule {}
