import { Module } from '@nestjs/common';
import { QuestionCacheService } from './question-cache.service';
import { BigQuery } from '@google-cloud/bigquery';
import { QuestionCacheEntity } from '../bigquery/entities/QuestionCacheEntity';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { ConfigService } from '@nestjs/config';
import { QuestionCacheController } from './question-cache.controller';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
  imports: [
    MongoModule,
  ],
  providers: [
    QuestionCacheService,
    {
      provide: 'QuestionCacheRepository',
      useFactory: (bigQuery: BigQuery) => {
        return new BigQueryRepository<QuestionCacheEntity>(
          bigQuery,
          QuestionCacheEntity,
        );
      },
      inject: [BigQuery, ConfigService],
    },
  ],
  exports: [QuestionCacheService, 'QuestionCacheRepository'],
  controllers: [QuestionCacheController],
})
export class QuestionCacheModule {}
