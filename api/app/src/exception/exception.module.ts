import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JWTExceptionFilter } from './jwt.filter';
import { AuthService } from '../auth/auth.service';
import { AuthRepository } from '../auth/auth.repository';

@Module({
  providers: [
    AuthService,
    AuthRepository,
    { provide: APP_FILTER, useClass: JWTExceptionFilter },
  ],
})
export class ExceptionModule {}
