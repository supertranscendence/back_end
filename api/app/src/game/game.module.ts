import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameController } from './controller/game.controller';
import { GameRepository } from './repository/game.repository';
import { AuthService } from '../auth/auth.service';
import { AuthRepository } from '../auth/auth.repository';

@Module({
  // imports: [],
  // providers: [GameService, GameRepository, AuthService, AuthRepository], // GameService >> + GameRepository GameRepository는 어디있어애 될까?
  // controllers: [GameController],
})
export class GameModule {}
