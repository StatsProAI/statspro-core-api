import { BigQueryColumn } from '../decorators/bigquery-column.decorator';
import { BigQueryTable } from '../decorators/bigquery-table.decorator';

@BigQueryTable('user')
export class UserEntity {
  @BigQueryColumn('user_id')
  userId: string;

  @BigQueryColumn('email')
  email: string;

  @BigQueryColumn('first_name')
  firstName: string;

  @BigQueryColumn('full_name')
  fullName: string;

  @BigQueryColumn('created_at')
  createdAt: Date;

  @BigQueryColumn('plan')
  plan: string;

  @BigQueryColumn('credits')
  credits: number;

  @BigQueryColumn('is_admin')
  isAdmin: boolean;

  @BigQueryColumn('qtd_stats')
  qtdStats: number;

  @BigQueryColumn('qtd_compare')
  qtdCompare: number;

  @BigQueryColumn('qtd_imagem')
  qtdImagem: number;

  @BigQueryColumn('terms')
  terms: boolean;

  @BigQueryColumn('status')
  status: string;

  @BigQueryColumn('phone_number')
  phoneNumber: string;
}
