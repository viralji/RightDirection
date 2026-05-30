import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './lib/config/env.config';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

if (env.SENTRY_DSN) {
  Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(cookieParser());
  app.use(helmet());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = [env.FRONTEND_URL, `https://app.${env.BASE_DOMAIN}`];
      if (allowed.includes(origin) || origin.includes('139.59.87.174')) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api/v1');

  // Swagger (dev only)
  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('RightDirection API')
      .setDescription('AI-powered Global Admissions Exchange')
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(env.PORT);
  Logger.log(`API running on http://localhost:${env.PORT}/api/v1`, 'Bootstrap');
  if (env.NODE_ENV !== 'production') {
    Logger.log(`Swagger docs: http://localhost:${env.PORT}/api/docs`, 'Bootstrap');
  }
}

bootstrap();
