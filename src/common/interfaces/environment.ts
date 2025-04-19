export interface IEnvironment {
	APP: {
		NAME?: string;
		PORT: number;
		ENV?: string;
		CLIENT: string;
	};
	DB: {
		HOST: string;
		USER: string;
		PASSWORD: string;
		DATABASE: string;
		PORT: string;
	};
	JWT: {
		AUTH_SECRET: string;
		ACCESS_SECRET: string;
		REFRESH_SECRET: string;
	};
	JWT_EXPIRES_IN: {
		ACCESS: string;
		REFRESH: string;
	};
	EMAIL: {
		GMAIL_USER: string;
		GMAIL_PASSWORD: string;
	};
	FRONTEND_URL: string;
	R2: {
		ACCOUNT_ID: string;
		REGION: string;
		ACCESS_KEY_ID: string;
		SECRET_ACCESS_KEY: string;
		BUCKET_NAME: string;
		CDN_URL: string;
		PUBLIC_URL: string;
	};
	REDIS: {
		URL: string;
		PORT: number;
		PASSWORD: string;
	};
}
