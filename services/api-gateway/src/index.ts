import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "./middleware/authMiddleware";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // Max 100 req each IP
  message: "Too many requests from this IP, please try  again later.",
});

app.use(helmet());
app.use(cors());
app.use(limiter);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "AuctionAI API Gateway",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth/* (public)",
      users: "/api/users/* (protected)",
    },
  });
});

// ===== PUBLIC ROUTES (no auth) =====

// Proxy for /api/auth/*
app.use(
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    logger: console,
    pathFilter: "/api/auth/**",
  })
);

// ===== PROTECTED ROUTES (with auth) =====

// express.json() must be after proxymiddleware
app.use(express.json());

app.get("/api/users/profile", authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: "Protected profile endpoint",
    user: req.user,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📝 Proxying to User Service: ${process.env.USER_SERVICE_URL}`);
  console.log(`🔒 Protected routes require Bearer token`);
});
