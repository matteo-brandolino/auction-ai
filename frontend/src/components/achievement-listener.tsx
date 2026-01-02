"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { Trophy } from "lucide-react";

export function AchievementListener() {
  const { data: session } = useSession();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Fetch WebSocket token from secure API endpoint
    fetch("/api/ws-token")
      .then((res) => res.json())
      .then((data) => setToken(data.token))
      .catch((err) => console.error("Failed to get WS token:", err));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!token || !session?.user?.id) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3006";

    const socket: Socket = io(wsUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Connected to notification service");
    });

    socket.on("achievement_unlocked", (notification: any) => {
      try {
        if (notification.data.userId === session.user.id) {
          const { icon, name, description, points } = notification.data;

          toast.success(
            <div className="flex items-start gap-3">
              <Trophy className="w-8 h-8 text-amber-500" />
              <div className="flex-1">
                <div className="font-semibold text-white">Achievement Unlocked!</div>
                <div className="text-sm text-white">{name}</div>
                <div className="text-xs text-slate-300">
                  {description} (+{points} pts)
                </div>
              </div>
            </div>,
            {
              duration: 5000,
            }
          );
        }
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from notification service");
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, session?.user?.id]);

  return null;
}
