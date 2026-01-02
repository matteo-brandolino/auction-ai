"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { publishAuctionAction } from "@/app/actions/auction-actions";

interface PublishButtonProps {
  auctionId: string;
  auctionTitle: string;
}

export function PublishButton({ auctionId, auctionTitle }: PublishButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    const confirmed = confirm(
      `Publish "${auctionTitle}"?\n\nOnce published, the auction will automatically start at the scheduled time.`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      await publishAuctionAction(auctionId);
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
