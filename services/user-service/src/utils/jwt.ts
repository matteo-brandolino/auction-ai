import * as jwt from "jsonwebtoken";
import type { VerifyOptions, SignOptions } from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    issuer: "auctionai-platform",
    audience: "auctionai-users",
    algorithm: "HS256",
  } as SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: "auctionai-platform",
    audience: "auctionai-users",
    algorithm: "HS256",
  } as SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const options: VerifyOptions = {
    issuer: "auctionai-platform",
    audience: "auctionai-users",
    algorithms: ["HS256"],
  };

  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!, options) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const options: VerifyOptions = {
    issuer: "auctionai-platform",
    audience: "auctionai-users",
    algorithms: ["HS256"],
  };

  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!, options) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};
