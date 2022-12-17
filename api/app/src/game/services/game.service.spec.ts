import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../../entities/Game';
import { GameRepository } from '../repository/game.repository';
import { GameService } from './game.service';

// describe('GameService', () => {
//   let service: GameService;
//   // let gameRepository : Repository<Game>;
//   let gameRepository: GameRepository;
//
//   // const USER_REPOSITORY_TOKEN = getRepositoryToken(Game);
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         GameService,
//         {
//           // provide: USER_REPOSITORY_TOKEN,
//           provide: GameRepository,
//           useValue: {
//             create: jest.fn(),
//             save: jest.fn(),
//             findOne: jest.fn(),
//           },
//         },
//       ],
//     }).compile();
//
//     service = module.get<GameService>(GameService);
//     // gameRepository = module.get<Repository<Game>>(USER_REPOSITORY_TOKEN);
//     gameRepository = module.get(GameRepository);
//   });
//
//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
//
//   describe('findAll', () => {
//     it('should return an array', () => {
//       const result = service.findAll();
//       expect(result).toBeInstanceOf(Array);
//     });
//   });
//
//   describe('findOne', () => {
//     // service.create({
//     //   id : 1,
//     //   player : 'jji',
//     //   score : '98765',
//     // });
//
//     it('should return an array', () => {
//       const result = service.findOne(1);
//       expect(result).toBeDefined();
//     });
//   });
// });
