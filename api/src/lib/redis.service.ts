import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { env } from './config/env.config';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super(env.REDIS_URL, { lazyConnect: true });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.quit();
  }

  async getTenantBranding(subdomain: string) {
    const key = `tenant:branding:${subdomain}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setTenantBranding(subdomain: string, data: object) {
    const key = `tenant:branding:${subdomain}`;
    await this.set(key, JSON.stringify(data), 'EX', 3600);
  }

  async invalidateTenantBranding(subdomain: string) {
    await this.del(`tenant:branding:${subdomain}`);
  }
}
