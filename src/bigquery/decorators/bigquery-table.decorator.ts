import 'reflect-metadata';

export const BIGQUERY_TABLE_KEY = 'BIGQUERY_TABLE';

export function BigQueryTable(tableName: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(BIGQUERY_TABLE_KEY, tableName, target);
  };
}
