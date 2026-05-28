import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '../../lib/config/env.config';

@WebSocketGateway({
  cors: {
    origin: [env.FRONTEND_URL, new RegExp(`https://.+\\.${env.BASE_DOMAIN.replace('.', '\\.')}$`)],
    credentials: true,
  },
  namespace: '/',
})
export class AiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AiGateway.name);

  constructor(private jwt: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.cookie?.split('access_token=')[1]?.split(';')[0];

      if (!token) { client.disconnect(); return; }

      const payload = this.jwt.verify(token, { secret: env.JWT_ACCESS_SECRET });
      client.data.user = payload;
      client.join(`tenant:${payload.tenantId}`);
      client.join(`user:${payload.sub}`);
      this.logger.log(`Client connected: ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Emit helpers used by other services
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  notifyNewNotification(userId: string, notification: any) {
    this.emitToUser(userId, 'notification:new', notification);
  }

  notifyStageChanged(tenantId: string, data: { applicationId: string; stage: string; studentName: string }) {
    this.emitToTenant(tenantId, 'application:stage_changed', data);
  }

  notifyAiJobComplete(userId: string, data: { jobId: string; type: string; entityId: string }) {
    this.emitToUser(userId, 'ai:job_completed', data);
  }

  notifyDocumentVerified(tenantId: string, data: { documentId: string; studentId: string }) {
    this.emitToTenant(tenantId, 'document:verified', data);
  }
}
