import { Injectable, Logger } from '@nestjs/common';
import { env } from './config/env.config';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromAddress = 'RightDirection <noreply@rightdirection.com>';

  async send(payload: EmailPayload): Promise<boolean> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: payload.from ?? this.fromAddress,
          to: Array.isArray(payload.to) ? payload.to : [payload.to],
          subject: payload.subject,
          html: payload.html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`Resend error: ${err}`);
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error('Email send failed', err);
      return false;
    }
  }

  async sendWelcome(to: string, agentName: string, subdomain: string) {
    return this.send({
      to,
      subject: 'Welcome to RightDirection — Your Agent Portal is Ready',
      html: welcomeTemplate(agentName, subdomain),
    });
  }

  async sendOtp(to: string, otp: string) {
    return this.send({
      to,
      subject: `${otp} — Your RightDirection OTP`,
      html: otpTemplate(otp),
    });
  }

  async sendApplicationUpdate(to: string, studentName: string, stage: string, universityName: string) {
    return this.send({
      to,
      subject: `Application Update — ${universityName}`,
      html: applicationUpdateTemplate(studentName, stage, universityName),
    });
  }

  async sendCommissionPaid(to: string, agentName: string, amount: number, studentName: string) {
    return this.send({
      to,
      subject: `Commission Paid — ₹${amount.toLocaleString()}`,
      html: commissionPaidTemplate(agentName, amount, studentName),
    });
  }

  async sendKycApproved(to: string, agentName: string) {
    return this.send({
      to,
      subject: 'Your KYC has been Approved — RightDirection',
      html: kycApprovedTemplate(agentName),
    });
  }

  async sendKycRejected(to: string, agentName: string, reason: string) {
    return this.send({
      to,
      subject: 'KYC Verification — Action Required',
      html: kycRejectedTemplate(agentName, reason),
    });
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function base(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .header { background: #0f1221; padding: 28px 32px; }
    .header h1 { color: #2b7cff; font-size: 20px; margin: 0; font-weight: 700; }
    .body { padding: 32px; color: #374151; line-height: 1.6; }
    .btn { display: inline-block; background: #2b7cff; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { background: #f9fafb; padding: 20px 32px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .otp { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2b7cff; padding: 24px; background: #eff6ff; border-radius: 8px; text-align: center; margin: 20px 0; }
    .badge { display: inline-block; background: #ecfdf5; color: #065f46; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>RightDirection</h1></div>
    <div class="body">${content}</div>
    <div class="footer">© 2026 RightDirection. Global Admissions Exchange.</div>
  </div>
</body>
</html>`;
}

function welcomeTemplate(agentName: string, subdomain: string) {
  return base(`
    <h2>Welcome, ${agentName}!</h2>
    <p>Your agent portal on RightDirection is live. Start adding students, exploring university partnerships, and tracking commissions.</p>
    <p>Your portal URL:<br/><strong>https://${subdomain}.rightdirection.com</strong></p>
    <a href="https://${subdomain}.rightdirection.com" class="btn">Open Your Portal</a>
    <p style="margin-top:24px; font-size:13px; color:#6b7280;">If you have any questions, reply to this email or visit our help centre.</p>
  `);
}

function otpTemplate(otp: string) {
  return base(`
    <h2>Your Verification Code</h2>
    <p>Use the code below to verify your phone number. This code expires in 10 minutes.</p>
    <div class="otp">${otp}</div>
    <p style="font-size:13px; color:#6b7280;">If you didn't request this, you can safely ignore this email.</p>
  `);
}

function applicationUpdateTemplate(studentName: string, stage: string, universityName: string) {
  const stageLabel = stage.replace(/_/g, ' ');
  return base(`
    <h2>Application Update</h2>
    <p>There's an update on <strong>${studentName}</strong>'s application to <strong>${universityName}</strong>.</p>
    <p>New status: <span class="badge">${stageLabel}</span></p>
    <p>Log in to your portal to review the next steps.</p>
    <a href="https://app.rightdirection.com" class="btn">View Application</a>
  `);
}

function commissionPaidTemplate(agentName: string, amount: number, studentName: string) {
  return base(`
    <h2>Commission Paid — ₹${amount.toLocaleString()}</h2>
    <p>Hi ${agentName},</p>
    <p>Your commission of <strong>₹${amount.toLocaleString()}</strong> for enrolling <strong>${studentName}</strong> has been processed.</p>
    <p>The amount has been credited to your linked bank account. Please allow 2-3 business days for the transfer to reflect.</p>
    <a href="https://app.rightdirection.com/commission" class="btn">View Wallet</a>
  `);
}

function kycApprovedTemplate(agentName: string) {
  return base(`
    <h2>KYC Approved</h2>
    <p>Hi ${agentName},</p>
    <p>Your KYC verification has been approved. You can now access all features of RightDirection including commission payouts.</p>
    <a href="https://app.rightdirection.com" class="btn">Get Started</a>
  `);
}

function kycRejectedTemplate(agentName: string, reason: string) {
  return base(`
    <h2>KYC Action Required</h2>
    <p>Hi ${agentName},</p>
    <p>Your KYC documents need attention:</p>
    <blockquote style="border-left: 3px solid #ef4444; padding-left:16px; color:#374151;">${reason}</blockquote>
    <p>Please re-upload the required documents to complete verification.</p>
    <a href="https://app.rightdirection.com/settings" class="btn">Update KYC Documents</a>
  `);
}
