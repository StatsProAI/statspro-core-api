import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BigqueryModule } from './bigquery/bigquery.module';
import { UsersModule } from './users/users.module';
import { LoggerModule } from 'nestjs-pino';
import { TraceMiddleware } from './common/middleware/trace.middleware';
import { getTraceId } from './common/utils/trace-context';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Disponível globalmente sem precisar importar sempre
      envFilePath: ['.env'], // Carrega .env e .env.{NODE_ENV}
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
            levelFirst: true,
            translateTime: 'SYS:standard',
          },
        },
        mixin: () => {
          const traceId = getTraceId();
          return {
            traceId,
            context: 'HTTP',
          };
        },
        autoLogging: true,
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            traceId: req.traceId,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
    BigqueryModule,
    UsersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TraceMiddleware)
      .forRoutes('*');
  }
}
