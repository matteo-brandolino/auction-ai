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
      console.log(`Authenticated user: ${decoded.userId} (${decoded.email})`);
      next();
    } catch (error) {
      console.error("JWT verification failed:", error);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`Client connected: ${socket.id} (User: ${socket.user?.userId})`);

    socket.on("join-auction", (auctionId: string) => {
      socket.join(`auction-${auctionId}`);
      console.log(
        `User ${socket.user?.userId} joined auction ${auctionId}`
      );
    });

    socket.on("leave-auction", (auctionId: string) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`User ${socket.user?.userId} left auction ${auctionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id} (User: ${socket.user?.userId})`);
    });
  });

  httpServer.listen(port);
  console.log(`WebSocket server running on port ${port}`);
};
export const sendNotification = (notification: NotificationPayload) => {
  if (!io) return;

  const auctionId = notification.data.auctionId;

  // Map notification types to WebSocket event names
  const EVENT_NAME_MAP: Record<string, string> = {
    BID_PLACED: "bid_placed",
    AUCTION_ENDED: "auction-ended",
    ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
    AUCTION_STARTED: "auction-started",
    AUCTION_ENDING: "auction-ending",
    OUTBID: "outbid",
  };

  const eventName = EVENT_NAME_MAP[notification.type] || notification.type.toLowerCase();

  if (auctionId) {
    if (eventName === 'auction-started') {
      // Broadcast AUCTION_STARTED to all clients (for auction list updates)
      io.emit(eventName, notification);
      console.log(`Notification broadcast to all: ${eventName}`);
    } else {
      // Send to specific auction room (for bid updates, etc.)
      io.to(`auction-${auctionId}`).emit(eventName, notification);
      console.log(`Notification sent to auction ${auctionId}: ${eventName}`);
    }
  } else {
    // Broadcast to all
    io.emit(eventName, notification);
    console.log(`Notification broadcast: ${eventName}`);
  }
};
