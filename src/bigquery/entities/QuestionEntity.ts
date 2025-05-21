import { BigQueryColumn } from '../decorators/bigquery-column.decorator';
import { BigQueryTable } from '../decorators/bigquery-table.decorator';

@BigQueryTable('question')
export class QuestionEntity {
  @BigQueryColumn('user_id')
  userId: string;

  @BigQueryColumn('created_at')
  createdAt?: Date;

  @BigQueryColumn('type')
  type: string;

  @BigQueryColumn('question')
  question: string;

  @BigQueryColumn('answer')
  answer: string;

  @BigQueryColumn('match_date')
  matchDate: string;

  @BigQueryColumn('ref_source')
  refSource: string;
}
