import { BigQuery } from '@google-cloud/bigquery';
import { Injectable } from '@nestjs/common';
import { mapBigQueryRows } from './utils/bigquery-mapper.util';

@Injectable()
export class BigqueryService {
    constructor(private readonly bigQuery: BigQuery) {}

    async query<T = any>(sql: string): Promise<T[]> {
        const [rows] = await this.bigQuery.query(sql);
        return mapBigQueryRows<T>(rows);
    }

}
