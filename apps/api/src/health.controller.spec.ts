import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe('root', () => {
    it('should return live status ok', () => {
      expect(healthController.getLive().status).toBe('ok');
    });

    it('should return ready status ready', () => {
      expect(healthController.getReady().status).toBe('ready');
    });
  });
});
