import { Test, TestingModule } from '@nestjs/testing';
import { GazoilController } from './gazoil.controller';

describe('GazoilController', () => {
  let controller: GazoilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GazoilController],
    }).compile();

    controller = module.get<GazoilController>(GazoilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
