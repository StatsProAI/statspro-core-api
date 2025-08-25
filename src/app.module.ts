import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { SitemapModule } from './sitemap/sitemap.module';
import { MongoModule } from './mongo/mongo.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SeoPagesModule } from './seo-pages/seo-pages.module';

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
    SitemapModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>('MONGO_USER');
        const pass = config.get<string>('MONGO_PASS');
        const host = config.get<string>('MONGO_HOST');
        const db = config.get<string>('MONGO_DB');

        return {
          uri: `mongodb+srv://${user}:${pass}@${host}/${db}`,
        };
      },
      inject: [ConfigService],
    }),
    MongoModule,
    SeoPagesModule,
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>('MONGO_USER');
        const pass = config.get<string>('MONGO_PASS');
        const host = config.get<string>('MONGO_HOST');
        const db = config.get<string>('MONGO_CORE_DB');

        return {
          uri: `mongodb+srv://${user}:${pass}@${host}/${db}`,
        };
      },
      inject: [ConfigService],
      connectionName: 'CoreConnection',
    }),
  ],
  providers: [
    ClerkClientProvider,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
