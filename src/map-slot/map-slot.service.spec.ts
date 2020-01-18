import { Test, TestingModule } from '@nestjs/testing';
import { MapSlotService } from './map-slot.service';

describe('MapSlotService', () => {
  let service: MapSlotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MapSlotService],
    }).compile();

    service = module.get<MapSlotService>(MapSlotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
