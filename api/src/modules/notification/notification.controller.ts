import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notifications: NotificationService) {}

  @Get()
  async list(@CurrentUser() user: any, @Query('unread') unread?: string) {
    const data = await this.notifications.list(user.sub, unread === 'true');
    return { data };
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: any) {
    const count = await this.notifications.unreadCount(user.sub);
    return { data: { count } };
  }

  @Patch(':id/read')
  async markRead(@CurrentUser() user: any, @Param('id') id: string) {
    await this.notifications.markRead(user.sub, id);
    return { data: { success: true } };
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: any) {
    await this.notifications.markAllRead(user.sub);
    return { data: { success: true } };
  }
}
