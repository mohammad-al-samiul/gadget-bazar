import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { QueuesModule } from '../queues/queues.module';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './services/media.service';
import { S3StorageService } from './services/s3-storage.service';

@Module({
  imports: [ConfigModule, QueuesModule],
  controllers: [MediaController],
  providers: [MediaService, S3StorageService],
  exports: [MediaService, S3StorageService],
})
export class MediaModule {}
