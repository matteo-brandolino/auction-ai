import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/database";
import { validateEnv } from "./config/env";
import itemRoutes from "./routes/itemRoutes";

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
    service: "item-service",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "BidWars Item Service API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      createItem: "POST /api/items (protected)",
      listItems: "GET /api/items (protected)",
      getItem: "GET /api/items/:id (protected)",
      updateItem: "PATCH /api/items/:id (protected)",
      deleteItem: "DELETE /api/items/:id (protected)",
    },
  });
});
app.use("/api/items", itemRoutes);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Item Service running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
