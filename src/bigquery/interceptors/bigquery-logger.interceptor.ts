import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getTraceId } from '../../common/utils/trace-context';

@Injectable()
export class BigQueryLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(BigQueryLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${method}] ${url} - ${duration}ms - TraceId: ${getTraceId()} - Body: ${JSON.stringify(request.body)}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${method}] ${url} - Error - ${duration}ms - TraceId: ${getTraceId()} - Body: ${JSON.stringify(request.body)} - ${error.stack}`,
          );
        },
      }),
    );
  }
}
