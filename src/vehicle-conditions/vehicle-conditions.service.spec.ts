import { Test, TestingModule } from '@nestjs/testing';
import { VehicleConditionsService } from './vehicle-conditions.service';

describe('VehicleConditionsService', () => {
  let service: VehicleConditionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleConditionsService],
    }).compile();

    service = module.get<VehicleConditionsService>(VehicleConditionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
