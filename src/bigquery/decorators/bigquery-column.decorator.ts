import 'reflect-metadata';

const BIGQUERY_COLUMNS_KEY = 'BIGQUERY_COLUMNS';

type Constructor<T = any> = new (...args: any[]) => T;

export function BigQueryColumn(columnName: string): PropertyDecorator {
  return (target, propertyKey) => {
    const existingColumns =
      Reflect.getMetadata(BIGQUERY_COLUMNS_KEY, target.constructor) || [];

    existingColumns.push({
      propertyKey: propertyKey.toString(),
      columnName,
    });

    Reflect.defineMetadata(
      BIGQUERY_COLUMNS_KEY,
      existingColumns,
      target.constructor,
    );
  };
}

export function getBigQueryColumns(
  target: Constructor,
): { propertyKey: string; columnName: string }[] {
  return Reflect.getMetadata(BIGQUERY_COLUMNS_KEY, target) || [];
}
