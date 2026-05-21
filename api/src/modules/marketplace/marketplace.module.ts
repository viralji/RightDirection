import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { PrismaService } from '../../lib/prisma.service';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, PrismaService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
