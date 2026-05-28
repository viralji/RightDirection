import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      error = typeof res === 'string' ? res : (res as any).message || error;
      code = (res as any).code || exception.name.toUpperCase().replace('EXCEPTION', '');
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation failed';
      code = 'VALIDATION_ERROR';
      details = exception.flatten().fieldErrors;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        error = 'Record already exists';
        code = 'DUPLICATE_RECORD';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        error = 'Record not found';
        code = 'NOT_FOUND';
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      Sentry.captureException(exception);
    }

    response.status(status).json({
      error,
      code,
      ...(details && { details }),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
