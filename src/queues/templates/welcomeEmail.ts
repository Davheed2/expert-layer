import { baseTemplate } from './baseTemplate';

export const welcomeEmail = (data: { name: string }) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

        <p>
            Welcome to <strong>Expert Layer</strong> — where talents, clients, and project managers come together to deliver exceptional results.
        </p>

        <p>
            Whether you're here to offer your skills, manage high-impact projects, or bring your ideas to life, you've just joined a powerful network built for efficient, high-quality gig delivery.
        </p>

        <p>
            <strong>What makes Expert Layer different?</strong><br/>
            👉 A streamlined ecosystem where collaboration, speed, and clarity drive outcomes.
        </p>

        <h3>🚀 Here’s what you can expect:</h3>
        <ul>
            <li>Connect with <strong>verified talents and trusted clients</strong></li>
            <li>Access <strong>project tools</strong> that keep timelines tight and deliverables clear</li>
            <li>Get <strong>support from dedicated project managers</strong> to help keep things on track</li>
        </ul>

        <p>
            Whether you're starting your first gig or scaling your operations, Expert Layer gives you everything you need to thrive in a fast-moving world of work.
        </p>

        <p>
            Collaboration, accountability, and excellence — it's all here, and it starts now.
        </p>

        <hr style="margin: 24px 0;" />

        <h3>🔐 We take your privacy seriously:</h3>
        <ul>
            <li>All communication and files are secured within the platform</li>
            <li>Your data is protected by enterprise-grade security protocols</li>
            <li>We never share your information without your consent</li>
        </ul>

        <p>Need more info?</p>
        <p>
            <a href="https://app.100-minds.com/privacy-policy" style="color: #bd531e; font-weight: bold;">Read our full privacy policy →</a>
        </p>

        <hr style="margin: 24px 0;" />

        <p>
            We’re thrilled to have you with us.<br />
            <strong>Let’s build something incredible.</strong><br />
            The Expert Layer Team
        </p>`
	);
};
