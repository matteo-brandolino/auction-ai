import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/database";
import { validateEnv } from "./config/env";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import achievementRoutes from "./routes/achievementRoutes";
import {
  initKafkaProducer,
  disconnectKafkaProducer,
} from "./services/kafka-producer";
import { createTopics } from "./services/kafka-admin";

dotenv.config();
validateEnv();

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "user-service",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "AuctionAI User Service API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      refresh: "POST /api/auth/refresh",
      me: "GET /api/users/me (protected)",
      credits: "POST /api/users/credits (protected)",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/achievements", achievementRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await createTopics();
    await initKafkaProducer();

    app.listen(PORT, () => {
      console.log(`User Service running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await disconnectKafkaProducer();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await disconnectKafkaProducer();
  process.exit(0);
});

startServer();
