import { Request, Response, NextFunction } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.headers["x-user-id"];
  const userEmail = req.headers["x-user-email"];
  const userName = req.headers["x-user-name"];
  const userRole = req.headers["x-user-role"];

  if (!userId || !userEmail) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.user = {
    userId: userId as string,
    email: userEmail as string,
    name: (userName as string) || "",
    role: (userRole as string) || "user",
  };

  next();
};
