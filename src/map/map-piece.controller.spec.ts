import { Test, TestingModule } from '@nestjs/testing';
import { MapPieceController } from './map-piece.controller';

describe('MapPiece Controller', () => {
  let controller: MapPieceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapPieceController],
    }).compile();

    controller = module.get<MapPieceController>(MapPieceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
