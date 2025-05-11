import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  traceId: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getTraceId(): string {
  const store = asyncLocalStorage.getStore();
  return store?.traceId || 'no-trace-id';
} 