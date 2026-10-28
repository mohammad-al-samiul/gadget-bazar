import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { ConfigModule } from '../../modules/config/config.module';
import { ConfigService } from '../../modules/config/config.service';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.isProduction;

        return {
          pinoHttp: {
            level: isProd ? 'info' : 'debug',
            transport: !isProd
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:standard',
                  },
                }
              : undefined,
            genReqId: (req, res) => {
              const existingId = req.headers['x-correlation-id'] as string;
              const id = existingId || randomUUID();
              res.setHeader('x-correlation-id', id);
              return id;
            },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers["set-cookie"]',
                'req.body.password',
                'req.body.passwordHash',
                'req.body.currentPassword',
                'req.body.newPassword',
              ],
              remove: true,
            },
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
