"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { publishAuctionAction } from "@/app/actions/auction-actions";

interface PublishButtonProps {
  auctionId: string;
  auctionTitle: string;
}

export function PublishButton({ auctionId, auctionTitle }: PublishButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handlePublish = async () => {
    setLoading(true);

    try {
      await publishAuctionAction(auctionId);
      router.refresh();
      setOpen(false);
    } catch (error: any) {
      alert(`Failed to publish auction: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700"
        >
          Publish
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish Auction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to publish "{auctionTitle}"?

            Once published, the auction will automatically start at the scheduled time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePublish}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {loading ? "Publishing..." : "Publish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
