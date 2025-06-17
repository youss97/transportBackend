import { Test, TestingModule } from '@nestjs/testing';
import { VehcilesService } from './vehciles.service';

describe('VehcilesService', () => {
  let service: VehcilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehcilesService],
    }).compile();

    service = module.get<VehcilesService>(VehcilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
