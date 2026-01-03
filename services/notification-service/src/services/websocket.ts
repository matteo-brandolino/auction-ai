import { Server, Socket } from "socket.io";
import { NotificationPayload } from "../types/notifications";
import http from "http";
import jwt from "jsonwebtoken";

let io: Server | null = null;

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const initWebSocketServer = (port: number) => {
  const httpServer = http.createServer();

  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3001", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    try {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        return next(new Error("Server configuration error"));
      }

      const decoded = jwt.verify(token, secret) as {
        userId: string;
        email: string;
        role: string;
      };

      socket.user = decoded;
      console.log(`✅ Authenticated user: ${decoded.userId} (${decoded.email})`);
      next();
    } catch (error) {
      console.error("❌ JWT verification failed:", error);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`🔌 Client connected: ${socket.id} (User: ${socket.user?.userId})`);

    socket.on("join-auction", (auctionId: string) => {
      socket.join(`auction-${auctionId}`);
      console.log(
        `✅ User ${socket.user?.userId} joined auction ${auctionId}`
      );
    });

    socket.on("leave-auction", (auctionId: string) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`❌ User ${socket.user?.userId} left auction ${auctionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id} (User: ${socket.user?.userId})`);
    });
  });

  httpServer.listen(port);
  console.log(`📡 WebSocket server running on port ${port}`);
};
export const sendNotification = (notification: NotificationPayload) => {
  if (!io) return;

  const auctionId = notification.data.auctionId;

  if (auctionId) {
    // Send to specific auction room
    io.to(`auction-${auctionId}`).emit(
      notification.type.toLowerCase(),
      notification
    );
    console.log(`Notification sent to auction ${auctionId}`);
  } else {
    // Broadcast to all
    io.emit(notification.type.toLowerCase(), notification);
    console.log(`Notification broadcast`);
  }
};
