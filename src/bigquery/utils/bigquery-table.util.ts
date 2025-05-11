import { BIGQUERY_TABLE_KEY } from "../decorators/bigquery-table.decorator";

export function getBigQueryTable(target: Function): string | undefined {
  return Reflect.getMetadata(BIGQUERY_TABLE_KEY, target);
}
