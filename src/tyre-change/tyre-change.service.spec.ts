import { Test, TestingModule } from '@nestjs/testing';
import { TyreChangeService } from './tyre-change.service';

describe('TyreChangeService', () => {
  let service: TyreChangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TyreChangeService],
    }).compile();

    service = module.get<TyreChangeService>(TyreChangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
