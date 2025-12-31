import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

//  Express Request extension to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({ error: "Token format invalid" });
      return;
    }

    const token = parts[1];

    const decodedUser = jwt.verify(token, process.env.JWT_ACCESS_SECRET!, {
      issuer: "auctionai-platform",
      audience: "auctionai-users",
      algorithms: ["HS256"],
    }) as { userId: string; name: string; email: string; role: string };

    req.user = decodedUser;

    //custom headers for services
    req.headers["x-user-id"] = decodedUser.userId;
    req.headers["x-user-name"] = decodedUser.name;
    req.headers["x-user-email"] = decodedUser.email;
    req.headers["x-user-role"] = decodedUser.role;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
