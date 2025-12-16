import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
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
app.use(express.json());

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
    on: {
      proxyReq: fixRequestBody, // to pass body in post/put request -> avoid strange timeout in api call
    },
  })
);

// ===== PROTECTED ROUTES (with auth) =====

// Apply authentication to all /api/users routes
app.use("/api/users", authMiddleware);

// Proxy for /api/users/* (keep full path)
app.use(
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    logger: console,
    pathFilter: "/api/users/**",
    on: {
      proxyReq: fixRequestBody,
    },
  })
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📝 Proxying to User Service: ${process.env.USER_SERVICE_URL}`);
  console.log(`🔒 Protected routes require Bearer token`);
});
