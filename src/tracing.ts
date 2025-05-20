// tracing.ts
import tracer from 'dd-trace';

tracer.init({
  service: 'statspro-core-api',         // Nome do serviço que aparecerá no Datadog
  env: 'production',           // Ambiente (production, staging, etc.)
  version: '1.0.0',            // Versão da aplicação
  logInjection: true,          // Injeta traceId nos logs (útil com winston, pino, etc)
  runtimeMetrics: true         // (opcional) métricas de runtime (heap, event loop, etc)
  // Você pode configurar mais opções aqui, inclusive exporters personalizados
});

export default tracer;
