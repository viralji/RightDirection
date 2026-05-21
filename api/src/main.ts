import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { env } from './lib/config/env.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(cookieParser());
  app.use(helmet());

  app.enableCors({
    origin: [env.FRONTEND_URL, `https://*.${env.BASE_DOMAIN}`],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api/v1');

  // Global JWT guard — use @Public() to bypass
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector));

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
