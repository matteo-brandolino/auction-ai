"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

interface PublishButtonProps {
  auctionId: string;
  auctionTitle: string;
}

export function PublishButton({ auctionId, auctionTitle }: PublishButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!session?.accessToken) return;

    const confirmed = confirm(
      `Publish "${auctionTitle}"?\n\nOnce published, the auction will automatically start at the scheduled time.`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      await apiClient.publishAuction(auctionId, session.accessToken);
      router.refresh();
    } catch (error: any) {
      alert(`Failed to publish auction: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handlePublish}
      disabled={loading}
      className="bg-violet-600 hover:bg-violet-700"
    >
      {loading ? "Publishing..." : "Publish"}
    </Button>
  );
}
