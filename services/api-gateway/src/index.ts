import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createPublicProxy, createProtectedProxy } from "./utils/helpers";

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
    message: "BidWars API Gateway",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth/*",
      users: "/api/users/*",
      auctions: "/api/auctions/*",
    },
  });
});

// ===== PUBLIC ROUTES (no auth) =====

createPublicProxy(app, "/api/auth", process.env.USER_SERVICE_URL);

// ===== PROTECTED ROUTES (with auth) =====
createProtectedProxy(app, "/api/users", process.env.USER_SERVICE_URL);
createProtectedProxy(app, "/api/items", process.env.ITEM_SERVICE_URL);
createProtectedProxy(app, "/api/auctions", process.env.AUCTION_SERVICE_URL);

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Proxying to User Service: ${process.env.USER_SERVICE_URL}`);
  console.log(`Protected routes require Bearer token`);
});
