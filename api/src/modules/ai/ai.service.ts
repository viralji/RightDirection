import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { env } from '../../lib/config/env.config';
import { AIJobType, AIJobStatus } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {}

  async enqueueJob(tenantId: string, type: AIJobType, entityId: string, input: object) {
    return this.prisma.aIJob.create({
      data: { tenantId, type, entityId, input, status: AIJobStatus.QUEUED },
    });
  }

  async processJob(jobId: string) {
    const job = await this.prisma.aIJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    await this.prisma.aIJob.update({
      where: { id: jobId },
      data: { status: AIJobStatus.PROCESSING, startedAt: new Date() },
    });

    try {
      let output: any;

      if (job.type === AIJobType.SOP_WRITING) {
        output = await this.callFastApi('/ai/sop', job.input as object);
      } else if (job.type === AIJobType.PROPOSAL_GENERATION) {
        output = await this.callFastApi('/ai/proposal', job.input as object);
      } else if (job.type === AIJobType.DOCUMENT_FRAUD_CHECK) {
        output = await this.callFastApi('/ai/document/fraud-check', job.input as object);
      }

      await this.prisma.aIJob.update({
        where: { id: jobId },
        data: { status: AIJobStatus.COMPLETED, output, completedAt: new Date() },
      });

      return { success: true, output };
    } catch (err: any) {
      this.logger.error(`AI job ${jobId} failed: ${err.message}`);
      await this.prisma.aIJob.update({
        where: { id: jobId },
        data: { status: AIJobStatus.FAILED, error: err.message },
      });
      return { success: false, error: err.message };
    }
  }

  private async callFastApi(path: string, body: object) {
    const response = await fetch(`${env.AI_SERVICE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': env.INTERNAL_API_KEY,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`FastAPI error ${response.status}: ${err}`);
    }
    return response.json();
  }

  async streamSop(input: object): Promise<ReadableStream> {
    const response = await fetch(`${env.AI_SERVICE_URL}/ai/sop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': env.INTERNAL_API_KEY,
      },
      body: JSON.stringify({ ...input, stream: true }),
    });
    if (!response.ok) throw new Error('FastAPI SOP stream failed');
    return response.body!;
  }
}
