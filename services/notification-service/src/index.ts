import dotenv from "dotenv";
import { initWebSocketServer } from "./services/websocket";
import {
  initKafkaConsumer,
  disconnectKafkaConsumer,
} from "./services/kafka-consumer";
import { connectDB } from "./config/database";

dotenv.config();

const WS_PORT = parseInt(process.env.PORT || "3006");

const startServer = async () => {
  try {
    await connectDB();

    initWebSocketServer(WS_PORT);

    await initKafkaConsumer();

    console.log("Notification Service running");
    console.log(`WebSocket: ws://localhost:${WS_PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

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
