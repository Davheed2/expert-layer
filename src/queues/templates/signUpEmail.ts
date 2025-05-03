import { baseTemplate } from './baseTemplate';

export const signUpEmail = (data: { name: string; otp: string }) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

        <p>
            Welcome to <strong>Expert Layer</strong> — we’re excited to have you on board!
        </p>

        <p>
            To complete your registration, please verify your email address by entering the one-time password (OTP) below on the Expert Layer verification page:
        </p>

        <div style="margin: 32px auto; text-align: center;">
            <div style="display: inline-block; padding: 16px 32px; font-size: 24px; letter-spacing: 8px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; font-weight: bold; color: #111827;">
                ${data.otp}
            </div>
        </div>

        <p>
            This OTP is valid for <strong>1 day</strong>.
        </p>

        <p>
            If you didn’t sign up for Expert Layer or have trouble verifying, please contact us at support@expertlayer.com.
        </p>

        <p>Thanks,<br/>The Expert Layer Team</p>`
	);
};
