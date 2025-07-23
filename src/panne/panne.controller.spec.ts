import { Test, TestingModule } from '@nestjs/testing';
import { PanneController } from './panne.controller';

describe('PanneController', () => {
  let controller: PanneController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PanneController],
    }).compile();

    controller = module.get<PanneController>(PanneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
