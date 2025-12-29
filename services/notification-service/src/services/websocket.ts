import { Server } from "socket.io";
import { NotificationPayload } from "../types/notifications";
import http from "http";

let io: Server | null = null;

export const initWebSocketServer = (port: number) => {
  const httpServer = http.createServer();

  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3001", "http://localhost:3000"], // 👈 CORS fix
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join auction room
    socket.on("join-auction", (auctionId: string) => {
      socket.join(`auction-${auctionId}`);
      console.log(`✅ Client ${socket.id} joined auction ${auctionId}`);
    });

    // Leave auction room
    socket.on("leave-auction", (auctionId: string) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`❌ Client ${socket.id} left auction ${auctionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port);
  console.log(`📡 WebSocket server running on port ${port}`);
};
export const sendNotification = (notification: NotificationPayload) => {
  if (!io) return;

  const auctionId = notification.data.auctionId; // 👈 Dentro data!

  if (auctionId) {
    // Send to specific auction room
    io.to(`auction-${auctionId}`).emit(
      notification.type.toLowerCase(),
      notification
    );
    console.log(`📤 Notification sent to auction ${auctionId}`);
  } else {
    // Broadcast to all
    io.emit(notification.type.toLowerCase(), notification);
    console.log(`📡 Notification broadcast`);
  }
};
