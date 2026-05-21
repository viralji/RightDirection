import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../common/decorators';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplace: MarketplaceService) {}

  @Get('leads')
  listLeads(
    @Tenant() tenantId: string,
    @Query('intent') intent?: string,
    @Query('destination') destination?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.marketplace.listLeads(tenantId, {
      intent,
      destination,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }

  @Post('leads/:id/unlock')
  unlockLead(@Tenant() tenantId: string, @Param('id') leadId: string) {
    return this.marketplace.unlockLead(tenantId, leadId);
  }

  @Get('leads/my-unlocked')
  myUnlockedLeads(@Tenant() tenantId: string) {
    return this.marketplace.getMyUnlockedLeads(tenantId);
  }
}
