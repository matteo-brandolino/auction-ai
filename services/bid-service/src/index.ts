import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/database";
import { validateEnv } from "./config/env";
import bidRoutes from "./routes/bidRoutes";
import { initKafkaProducer, disconnectKafkaProducer } from "./services/kafka";
import { createTopics } from "./services/kafka-admin";

dotenv.config();
validateEnv();

const app: Application = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "bid-service",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "BidWars Bid Service API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      placeBid: "POST /api/bids",
      listMyBids: "GET /api/bids",
      getBidsForAuction: "GET /api/bids/auction/:auctionId",
    },
  });
});

app.use("/api/bids", bidRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await createTopics(); // Create Kafka topics BEFORE producer - fix {"level":"ERROR","timestamp":"2025-12-23T20:12:11.999Z","logger":"kafkajs","message":"[Connection] Response Metadata(key: 3, version: 6)","broker":"localhost:9092","clientId":"bid-service","error":"There is no leader for this topic-partition as we are in the middle of a leadership election","correlationId":1,"size":78}
    await initKafkaProducer();

    app.listen(PORT, () => {
      console.log(`💰 Bid Service running on http://localhost:${PORT}`);
      console.log(`📦 Database: bidwars-bids`);
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
