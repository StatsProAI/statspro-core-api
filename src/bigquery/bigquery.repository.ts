import { Injectable, Logger } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';
import { getBigQueryColumns } from './decorators/bigquery-column.decorator';
import { getBigQueryTable } from './utils/bigquery-table.util';
import { mapBigQueryRow } from './utils/bigquery-mapper.util';
import { getTraceId } from '../common/utils/trace-context';

type QueryOptions = {
  fields?: string[];
  where?: Record<string, any>;
  limit?: number;
  orderBy?: Record<string, any>;
};

@Injectable()
export class BigQueryRepository<T> {
  private readonly tableName: string;
  private readonly columns: { propertyKey: string; columnName: string }[];
  private readonly logger = new Logger(BigQueryRepository.name);
  private readonly projectId: string;
  private readonly datasetId: string;

  constructor(
    private readonly bigQuery: BigQuery,
    private readonly entityClass: { new (): T },
  ) {
    this.tableName = getBigQueryTable(entityClass);
    this.columns = getBigQueryColumns(entityClass);
    this.projectId = process.env.BIGQUERY_PROJECT_ID;
    this.datasetId = process.env.BIGQUERY_DATASET_ID;
  }

  async insert(entity: T): Promise<void> {
  }


  async findAll(queryOptions: QueryOptions): Promise<T[]> {
    let fiels = '';

    if (queryOptions.fields && queryOptions.fields.length > 0) {
      fiels = queryOptions.fields.map((field) => `\`${field}\``).join(', ');
    } else {
      fiels = this.columns.map((c) => c.columnName).join(', ');
    }

    const sql = `SELECT ${fiels} FROM \`${this.projectId}.${this.datasetId}.${this.tableName}\``;

    const startTime = Date.now();
    try {
      const [rows] = await this.bigQuery.query(sql);

      const duration = Date.now() - startTime;

      this.logger.log(
        `BigQuery Query - ${duration}ms - TraceId: ${getTraceId()} - SQL: ${sql} - Table: ${this.tableName}`,
      );

      return rows.map((row) => {
        const mappedRow = mapBigQueryRow<T>(row);
        const entity = new this.entityClass();
        Object.assign(entity, mappedRow);
        return entity;
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Error executing query - ${duration}ms - TraceId: ${getTraceId()} - SQL: ${sql} - Table: ${this.tableName} - Error: ${error.stack}`,
      );
      throw error;
    }
  }
}
