import { Test, TestingModule } from '@nestjs/testing';
import { MapPieceService } from './map-piece.service';

describe('MapPieceService', () => {
  let service: MapPieceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MapPieceService],
    }).compile();

    service = module.get<MapPieceService>(MapPieceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
