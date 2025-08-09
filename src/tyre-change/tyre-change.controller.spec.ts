import { Test, TestingModule } from '@nestjs/testing';
import { TyreChangeController } from './tyre-change.controller';

describe('TyreChangeController', () => {
  let controller: TyreChangeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TyreChangeController],
    }).compile();

    controller = module.get<TyreChangeController>(TyreChangeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
