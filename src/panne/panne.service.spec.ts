import { Test, TestingModule } from '@nestjs/testing';
import { PanneService } from './panne.service';

describe('PanneService', () => {
  let service: PanneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PanneService],
    }).compile();

    service = module.get<PanneService>(PanneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
