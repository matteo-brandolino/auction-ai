"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function AchievementListener() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3006";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to notification service");
    };

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);

        if (
          notification.type === "ACHIEVEMENT_UNLOCKED" &&
          notification.data.userId === session.user.id
        ) {
          const { icon, name, description, points } = notification.data;

          toast.success(
            <div className="flex items-start gap-3">
              <span className="text-3xl">{icon}</span>
              <div className="flex-1">
                <div className="font-semibold">Achievement Unlocked!</div>
                <div className="text-sm">{name}</div>
                <div className="text-xs text-muted-foreground">
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
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Disconnected from notification service");
    };

    return () => {
      ws.close();
    };
  }, [session?.user?.id]);

  return null;
}
