import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameController } from './controller/game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../entities/Game';
import { GameRepository } from './repository/game.repository';


@Module({
  imports: [
    // TypeOrmModule.forFeature([Game]), // Game >> + GameRepository >> + Game , GameRepository
  ],
  providers: [GameService, GameRepository], // GameService >> + GameRepository GameRepository는 어디있어애 될까?
  controllers: [GameController]
})
export class GameModule {}
