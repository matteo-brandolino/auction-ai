import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import { initKafkaConsumer, disconnectKafkaConsumer } from "./services/kafka-consumer";
import leaderboardRoutes from "./routes/leaderboardRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.use("/api/leaderboard", leaderboardRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "leaderboard-service" });
});

const startServer = async () => {
  try {
    await connectDB();
    await initKafkaConsumer();

    app.listen(PORT, () => {
      console.log(`Leaderboard Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await disconnectKafkaConsumer();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
