import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './modules/queues/worker.module';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  logger.log('Starting GadgetBazar standalone async worker process...');

  const app = await NestFactory.createApplicationContext(WorkerModule);

  app.enableShutdownHooks();

  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Shutting down worker gracefully...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  logger.log('⚡ Async worker is actively listening to BullMQ queues.');
}

bootstrap().catch((err) => {
  console.error('Fatal error in worker process:', err);
  process.exit(1);
});
