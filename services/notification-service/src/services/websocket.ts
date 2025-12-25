import { WebSocket, WebSocketServer } from "ws";
import { NotificationPayload, WebSocketClient } from "../types/notifications";

const clients = new Map<string, WebSocketClient>();

let wss: WebSocketServer | null = null;

export const initWebSocketServer = (port: number) => {
  wss = new WebSocketServer({ port });

  wss.on("connection", (ws: WebSocket, req) => {
    const clientId = generateClientId();

    console.log(`🔌 Client connected: ${clientId}`);

    clients.set(clientId, { id: clientId, ws });

    // Handle authentication message
    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "AUTH" && data.userId) {
          const client = clients.get(clientId);
          if (client) {
            client.userId = data.userId;
            console.log(
              `✅ Client ${clientId} authenticated as user ${data.userId}`
            );
          }
        }
      } catch (error) {
        console.error("Error parsing client message:", error);
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      console.log(`❌ Client disconnected: ${clientId}`);
    });

    ws.send(
      JSON.stringify({
        type: "CONNECTED",
        clientId,
        message: "Connected to BidWars notifications",
      })
    );
  });

  console.log(`📡 WebSocket server running on port ${port}`);
};

export const sendNotification = (notification: NotificationPayload) => {
  const message = JSON.stringify(notification);

  if (notification.userId) {
    // Send to specific user
    let sent = 0;
    clients.forEach((client) => {
      if (
        client.userId === notification.userId &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(message);
        sent++;
      }
    });
    console.log(
      `📤 Notification sent to user ${notification.userId} (${sent} connections)`
    );
  } else {
    // or broadcast to all
    let sent = 0;
    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
        sent++;
      }
    });
    console.log(`📡 Notification broadcast to ${sent} clients`);
  }
};

const generateClientId = (): string => {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getConnectedClientsCount = (): number => {
  return clients.size;
};
