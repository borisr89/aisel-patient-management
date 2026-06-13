import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface NestErrorResponse {
  message?: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();

    const request = context.getRequest<Request>();

    const response = context.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message: string | string[] = 'Internal server error.';

    let error = 'Internal Server Error';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = exception instanceof Error ? exception.name : 'Error';
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      const body = exceptionResponse as NestErrorResponse;

      message =
        body.message ??
        (exception instanceof Error ? exception.message : message);

      error =
        body.error ?? (exception instanceof Error ? exception.name : error);
    }

    if (statusCode >= 500) {
      this.logger.error(
        JSON.stringify({
          method: request.method,
          path: request.originalUrl,
          statusCode,
          error,
        }),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }
}
