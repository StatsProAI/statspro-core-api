import { BIGQUERY_TABLE_KEY } from '../decorators/bigquery-table.decorator';

type Constructor<T = any> = new (...args: any[]) => T;

export function getBigQueryTable(target: Constructor): string | undefined {
  return Reflect.getMetadata(BIGQUERY_TABLE_KEY, target);
}
