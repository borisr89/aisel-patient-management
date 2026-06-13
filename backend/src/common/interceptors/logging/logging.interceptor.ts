import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();

    const request = httpContext.getRequest<Request>();

    const response = httpContext.getResponse<Response>();

    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            JSON.stringify({
              method: request.method,
              path: request.originalUrl,
              statusCode: response.statusCode,
              durationMs: Date.now() - startedAt,
            }),
          );
        },
        error: (error: unknown) => {
          const statusCode =
            error instanceof HttpException
              ? error.getStatus()
              : HttpStatus.INTERNAL_SERVER_ERROR;

          this.logger.warn(
            JSON.stringify({
              method: request.method,
              path: request.originalUrl,
              statusCode,
              durationMs: Date.now() - startedAt,
            }),
          );
        },
      }),
    );
  }
}
