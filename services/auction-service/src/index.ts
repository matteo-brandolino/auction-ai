import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/database";
import { validateEnv } from "./config/env";
import auctionRoutes from "./routes/auctionRoutes";
import {
  initKafkaConsumer,
  disconnectKafkaConsumer,
} from "./services/kafka-consumer";

dotenv.config();
validateEnv();

const app: Application = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "auction-service",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "BidWars Auction Service API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      createAuction: "POST /api/auctions",
      listAuctions: "GET /api/auctions",
      activeAuctions: "GET /api/auctions/active",
      upcomingAuctions: "GET /api/auctions/upcoming",
      endedAuctions: "GET /api/auctions/ended",
      getAuction: "GET /api/auctions/:id",
      updateAuction: "PATCH /api/auctions/:id",
      deleteAuction: "DELETE /api/auctions/:id",
      publishAuction: "POST /api/auctions/:id/publish",
      startAuction: "POST /api/auctions/:id/start",
    },
  });
});

app.use("/api/auctions", auctionRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await initKafkaConsumer();

    app.listen(PORT, () => {
      console.log(`Auction Service running on http://localhost:${PORT}`);
      console.log(`Database: bidwars-auctions`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown per Kafka Consumer
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await disconnectKafkaConsumer();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await disconnectKafkaConsumer();
  process.exit(0);
});

startServer();
