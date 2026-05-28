import { Injectable, Logger } from '@nestjs/common';
import { env } from './config/env.config';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private client: any;
  readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(
      env.TWILIO_ACCOUNT_SID &&
      env.TWILIO_AUTH_TOKEN &&
      env.TWILIO_PHONE_NUMBER
    );

    if (this.isConfigured) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const twilio = require('twilio');
      this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    }
  }

  async sendSms(to: string, body: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(`Twilio not configured — SMS not sent to ${to}`);
      return;
    }

    // Ensure E.164 format — prepend +91 for Indian numbers missing country code
    const formattedTo = to.startsWith('+') ? to : `+91${to.replace(/^0+/, '')}`;

    await this.client.messages.create({
      body,
      from: env.TWILIO_PHONE_NUMBER,
      to: formattedTo,
    });

    this.logger.log(`SMS sent to ${formattedTo}`);
  }

  async sendOtp(phone: string, otp: string): Promise<void> {
    await this.sendSms(phone, `Your RightDirection OTP is ${otp}. Valid for 10 minutes. Do not share.`);
  }
}
