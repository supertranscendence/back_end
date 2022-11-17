import { Module } from '@nestjs/common';
import { FriendsService } from './services/friends.service';
import { FriendsController } from './controller/friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friends } from 'src/entities/Friends';
import { FriendsRepository } from './repository/friends.repository';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Friends])
  ],
  providers: [FriendsService, FriendsRepository],
  controllers: [FriendsController]
})
export class FriendsModule {}
