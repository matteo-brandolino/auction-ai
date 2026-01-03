declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      email: string;
      name: string;
      role: string;
    };
  }
}
