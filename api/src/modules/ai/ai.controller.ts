import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser, Tenant } from '../../common/decorators';
import { env } from '../../lib/config/env.config';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('sop/stream')
  async streamSop(
    @Tenant() tenantId: string,
    @Body() dto: any,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await this.ai.streamSop({ ...dto, tenant_id: tenantId });
      const reader = (stream as any).getReader
        ? (stream as ReadableStream).getReader()
        : null;

      if (!reader) {
        res.write('data: [ERROR]\n\n');
        res.end();
        return;
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        res.write(chunk);
      }
    } catch (err: any) {
      res.write(`data: [ERROR] ${err.message}\n\n`);
    } finally {
      res.end();
    }
  }
}
