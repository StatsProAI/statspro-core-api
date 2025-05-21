import { BigQueryColumn } from '../decorators/bigquery-column.decorator';
import { BigQueryTable } from '../decorators/bigquery-table.decorator';

@BigQueryTable('questions_cache')
export class QuestionCacheEntity {
  @BigQueryColumn('user_id')
  userId: string;

  @BigQueryColumn('created_at')
  createdAt?: Date;

  @BigQueryColumn('question')
  question: string;

  @BigQueryColumn('answer')
  answer: string;

  @BigQueryColumn('game_title')
  gameTitle: string;

  @BigQueryColumn('ref_source')
  refSource: string;
  
}
