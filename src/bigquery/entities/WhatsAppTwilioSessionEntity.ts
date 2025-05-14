import { BigQueryColumn } from '../decorators/bigquery-column.decorator';
import { BigQueryTable } from '../decorators/bigquery-table.decorator';

@BigQueryTable('whatsapp_twilio_session')
export class WhatsAppTwilioSessionEntity {
  @BigQueryColumn('user_id')
  userId: string;

  @BigQueryColumn('created_at')
  createdAt: Date;

  @BigQueryColumn('status')
  status: string;

  @BigQueryColumn('completed_by')
  completedBy: string;
}
