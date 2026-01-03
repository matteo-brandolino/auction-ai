import { Request, Response, NextFunction } from "express";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const email = req.headers["x-user-email"] as string;
    const name = req.headers["x-user-name"] as string;
    const role = req.headers["x-user-role"] as string;

    if (!userId || !email || !role) {
      res.status(401).json({
        error: "Unauthorized - Missing user headers from gateway",
      });
      return;
    }

    req.user = {
      userId,
      email,
      name: name || "",
      role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
  }
};
