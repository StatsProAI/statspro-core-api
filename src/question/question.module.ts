import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { BigQuery } from '@google-cloud/bigquery';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { QuestionEntity } from '../bigquery/entities/QuestionEntity';
import { ConfigService } from '@nestjs/config';
@Module({
  providers: [
    QuestionService,
    {
      provide: 'QuestionRepository',
      useFactory: (bigQuery: BigQuery) => {
        return new BigQueryRepository<QuestionEntity>(bigQuery, QuestionEntity);
      },
      inject: [BigQuery, ConfigService],
    },
  ],
  exports: [QuestionService, 'QuestionRepository'],
})
export class QuestionModule {}
