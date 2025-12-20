declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV: "development" | "production" | "test";

      MONGODB_URI: string;

      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;

      JWT_ACCESS_EXPIRES_IN: number;
      JWT_REFRESH_EXPIRES_IN: number;
    }
  }
}

export {};
