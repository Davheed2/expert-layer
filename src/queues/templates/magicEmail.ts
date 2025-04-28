import { baseTemplate } from './baseTemplate';

export const magicLinkEmail = (data: { name: string; otp: string }) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

    <p>Use the one-time password (OTP) below to log in to <strong>Expert Layer</strong>:</p>

    <div style="margin: 32px auto; text-align: center;">
      <div style="display: inline-block; padding: 16px 32px; font-size: 24px; letter-spacing: 8px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; font-weight: bold; color: #111827;">
        ${data.otp}
      </div>
    </div>

    <p>This OTP is valid for <strong>15 minutes</strong>.</p>

    <p>If you didn't request this, you can safely ignore this email.</p>

    <p>Thanks,<br/>The Expert Layer Team</p>`
	);
};
