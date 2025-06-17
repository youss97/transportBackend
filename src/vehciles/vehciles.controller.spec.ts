import { Test, TestingModule } from '@nestjs/testing';
import { VehcilesController } from './vehciles.controller';

describe('VehcilesController', () => {
  let controller: VehcilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehcilesController],
    }).compile();

    controller = module.get<VehcilesController>(VehcilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
