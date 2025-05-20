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

  private getColumnName(propertyKey: string): string {
    const column = this.columns.find(c => c.propertyKey === propertyKey);
    if (!column) {
      throw new Error(`Property ${propertyKey} not found in entity columns`);
    }
    return column.columnName;
  }

  private getFullTableName(): string {
    return `\`${this.projectId}.${this.datasetId}.${this.tableName}\``;
  }

  private async executeQuery(sql: string, params: Record<string, any> = {}, operation: string): Promise<any> {
    const startTime = Date.now();
    try {
      const [rows] = await this.bigQuery.query({
        query: sql,
        params,
        useLegacySql: false,
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `BigQuery ${operation} - ${duration}ms - TraceId: ${getTraceId()} - SQL: ${sql} - Table: ${this.tableName}`,
      );

      return rows;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Error executing ${operation} - ${duration}ms - TraceId: ${getTraceId()} - SQL: ${sql} - Table: ${this.tableName} - Error: ${error.stack}`,
      );
      throw error;
    }
  }

  private buildWhereConditions(where: Record<string, any>, paramPrefix: string = ''): { conditions: string; params: Record<string, any> } {
    const conditions = Object.entries(where)
      .map(([propertyKey, value]) => {
        const columnName = this.getColumnName(propertyKey);
        return `\`${columnName}\` = @${paramPrefix}${propertyKey}`;
      })
      .join(' AND ');

    const params = Object.entries(where).reduce((acc, [key, value]) => {
      acc[`${paramPrefix}${key}`] = value;
      return acc;
    }, {});

    return { conditions, params };
  }

  private mapToEntity(rows: any[]): T[] {
    return rows.map((row) => {
      const mappedRow = mapBigQueryRow<T>(row);
      const entity = new this.entityClass();
      Object.assign(entity, mappedRow);
      return entity;
    });
  }

  async getDataSet() {
    return `${this.projectId}.${this.datasetId}`;
  }

  async insert(entity: T): Promise<void> {
    const nonNullColumns = this.columns.filter(column => {
      if (column.propertyKey === 'createdAt') return true;
      const value = (entity as any)[column.propertyKey];
      return value !== null && value !== undefined;
    });

    const sql = `INSERT INTO ${this.getFullTableName()} (${nonNullColumns
      .map((c) => `\`${c.columnName}\``)
      .join(', ')}) VALUES (${nonNullColumns
      .map((c) =>
        c.propertyKey === 'createdAt' ? 'CURRENT_TIMESTAMP()' : `@${c.propertyKey}`
      )
      .join(', ')})`;

    const params = nonNullColumns.reduce((acc, column) => {
      if (column.propertyKey !== 'createdAt') {
        acc[column.propertyKey] = (entity as any)[column.propertyKey];
      }
      return acc;
    }, {});

    await this.executeQuery(sql, params, 'Insert');
  }

  async findAll(queryOptions?: QueryOptions): Promise<T[]> {
    let fields = '';

    if (queryOptions?.fields && queryOptions.fields.length > 0) {
      fields = queryOptions.fields.map((field) => `\`${this.getColumnName(field)}\``).join(', ');
    } else {
      fields = this.columns.map((c) => `\`${c.columnName}\``).join(', ');
    }

    let sql = `SELECT ${fields} FROM ${this.getFullTableName()}`;
    let params: Record<string, any> = {};

    if (queryOptions?.where) {
      const { conditions, params: whereParams } = this.buildWhereConditions(queryOptions.where);
      sql += ` WHERE ${conditions}`;
      params = { ...params, ...whereParams };
    }

    if (queryOptions?.orderBy) {
      const orderByConditions = Object.entries(queryOptions.orderBy)
        .map(([propertyKey, value]) => `\`${this.getColumnName(propertyKey)}\` ${value}`)
        .join(', ');
      sql += ` ORDER BY ${orderByConditions}`;
    }

    if (queryOptions?.limit) {
      sql += ` LIMIT ${queryOptions.limit}`;
    }

    const rows = await this.executeQuery(sql, params, 'Query');
    return this.mapToEntity(rows);
  }

  async findOne(where: Record<string, any>): Promise<T | null> {
    const fields = this.columns.map((c) => `\`${c.columnName}\``).join(', ');
    const { conditions, params } = this.buildWhereConditions(where);
    
    const sql = `SELECT ${fields} FROM ${this.getFullTableName()} WHERE ${conditions} LIMIT 1`;
    const rows = await this.executeQuery(sql, params, 'Query');

    if (rows.length === 0) {
      return null;
    }

    return this.mapToEntity(rows)[0];
  }

  async update(where: Record<string, any>, data: Partial<T>): Promise<void> {
    const setConditions = Object.entries(data)
      .map(([propertyKey, value]) => `\`${this.getColumnName(propertyKey)}\` = @set_${propertyKey}`)
      .join(', ');

    const { conditions: whereConditions, params: whereParams } = this.buildWhereConditions(where, 'where_');
    const setParams = Object.entries(data).reduce((acc, [key, value]) => {
      acc[`set_${key}`] = value;
      return acc;
    }, {});

    const sql = `UPDATE ${this.getFullTableName()} SET ${setConditions} WHERE ${whereConditions}`;
    await this.executeQuery(sql, { ...setParams, ...whereParams }, 'Update');
  }

  async nativeQuery(sql: string): Promise<T[]> {
    const rows = await this.executeQuery(sql, {}, 'Query');
    return this.mapToEntity(rows);
  }
}
