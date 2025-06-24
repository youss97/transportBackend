import { Test, TestingModule } from '@nestjs/testing';
import { ChargementDechargementController } from './chargement-dechargement.controller';

describe('ChargementDechargementController', () => {
  let controller: ChargementDechargementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargementDechargementController],
    }).compile();

    controller = module.get<ChargementDechargementController>(ChargementDechargementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
