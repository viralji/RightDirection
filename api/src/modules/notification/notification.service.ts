import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { NotificationChannel } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    userId: string;
    tenantId: string;
    title: string;
    body: string;
    channel?: NotificationChannel;
    metadata?: object;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        tenantId: dto.tenantId,
        title: dto.title,
        body: dto.body,
        channel: dto.channel ?? NotificationChannel.IN_APP,
        metadata: dto.metadata as any,
      },
    });
  }

  async list(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly && { isRead: false }) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }
}
