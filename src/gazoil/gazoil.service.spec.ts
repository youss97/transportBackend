import { Test, TestingModule } from '@nestjs/testing';
import { GazoilService } from './gazoil.service';

describe('GazoilService', () => {
  let service: GazoilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GazoilService],
    }).compile();

    service = module.get<GazoilService>(GazoilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
