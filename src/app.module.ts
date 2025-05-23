import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BigqueryModule } from './bigquery/bigquery.module';
import { UsersModule } from './users/users.module';
import { LoggerModule } from 'nestjs-pino';
import { TraceMiddleware } from './common/middleware/trace.middleware';
import { getTraceId } from './common/utils/trace-context';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AuthenticationModule } from './authentication/authentication.module';
import { ClerkClientProvider } from './authentication/providers/clerk-client.provider';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './authentication/clerk-auth.guard';
import { SportMonksModule } from './sportmonks/sportmonks.module';
import { TwilioModule } from './twilio/twilio.module';
import { WhatsappTwilioSessionModule } from './whatsapp-twilio-session/whatsapp-twilio-session.module';
import { WhatsappMessageModule } from './whatsapp-message/whatsapp-message.module';
import { ScheduleModule } from '@nestjs/schedule';
import { QuestionCacheModule } from './question-cache/question-cache.module';
import { QuestionModule } from './question/question.module';
import { AuroraModule } from './aurora/aurora.module';
import { ApiTokenAuthGuard } from './authentication/api-token-auth.guard';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Disponível globalmente sem precisar importar sempre
      envFilePath: ['.env'], // Carrega .env e .env.{NODE_ENV}
    }),
    PrometheusModule.register(),
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
    AuthenticationModule,
    SportMonksModule,
    TwilioModule,
    WhatsappTwilioSessionModule,
    WhatsappMessageModule,
    ScheduleModule.forRoot(),
    QuestionCacheModule,
    QuestionModule,
    AuroraModule,
  ],
  providers: [
    ClerkClientProvider,
    {
      provide: APP_GUARD,
      useClass: ApiTokenAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
