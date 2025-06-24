import { Test, TestingModule } from '@nestjs/testing';
import { ChargementDechargementService } from './chargement-dechargement.service';

describe('ChargementDechargementService', () => {
  let service: ChargementDechargementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChargementDechargementService],
    }).compile();

    service = module.get<ChargementDechargementService>(ChargementDechargementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
