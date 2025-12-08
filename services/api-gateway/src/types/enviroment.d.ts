declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV: "development" | "production" | "test";
      USER_SERVICE_URL: string;
      JWT_ACCESS_SECRET: string;
    }
  }
}

export {};
