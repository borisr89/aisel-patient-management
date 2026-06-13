import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GlobalExceptionFilter } from './common/filters/global-exception/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging/logging.interceptor';

export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.getOrThrow<string>('FRONTEND_URL'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalInterceptors(new LoggingInterceptor());
}
