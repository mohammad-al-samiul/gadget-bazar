import { Global, Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { OutboxPublisherService } from './outbox-publisher.service';
import { QueuesModule } from '../queues/queues.module';

@Global()
@Module({
  imports: [QueuesModule],
  providers: [OutboxService, OutboxPublisherService],
  exports: [OutboxService, OutboxPublisherService],
})
export class OutboxModule {}
