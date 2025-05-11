import { camelCase } from 'lodash';

export function mapBigQueryRow<T>(row: Record<string, any>): T {
  const mapped: any = {};
  for (const key in row) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const value = row[key];
      // Se o valor for um objeto com propriedade value (caso de datas do BigQuery)
      if (value && typeof value === 'object' && 'value' in value) {
        mapped[camelCase(key)] = new Date(value.value);
      } else {
        mapped[camelCase(key)] = value;
      }
    }
  }
  return mapped as T;
}

export function mapBigQueryRows<T>(rows: Record<string, any>[]): T[] {
  return rows.map(row => mapBigQueryRow<T>(row));
}
