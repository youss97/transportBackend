import { Test, TestingModule } from '@nestjs/testing';
import { VehicleConditionsController } from './vehicle-conditions.controller';

describe('VehicleConditionsController', () => {
  let controller: VehicleConditionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleConditionsController],
    }).compile();

    controller = module.get<VehicleConditionsController>(VehicleConditionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
