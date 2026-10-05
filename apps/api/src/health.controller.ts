import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('live')
  getLive(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  getReady(): { status: string; timestamp: string } {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }
}
