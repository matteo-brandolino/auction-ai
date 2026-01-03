"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getItemsAction, createAuctionAction } from "@/app/actions/auction-actions";
import type { Item } from "@/types/item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewAuctionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState("");

  const preselectedItemId = searchParams.get("itemId");

  useEffect(() => {
    const fetchItems = async () => {
      if (!session) return;

      try {
        const response = await getItemsAction();
        const availableItems = response.items.filter(
          (item: Item) => item.status === "available"
        );
        setItems(availableItems);
      } catch (err) {
        console.error("Failed to fetch items:", err);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const startTime = new Date(formData.get("startTime") as string);
    const endTime = new Date(formData.get("endTime") as string);

    if (endTime <= startTime) {
      setError("End time must be after start time");
      setLoading(false);
      return;
    }

    try {
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      await createAuctionAction({
        itemId: formData.get("itemId") as string,
        startingPrice: Number(formData.get("startingPrice")),
        minIncrement: Number(formData.get("minIncrement")) || 10,
        startTime: startTime.toISOString(),
        duration,
      });

      router.push("/dashboard/auctions");
    } catch (err: any) {
      setError(err.message || "Failed to create auction");
      setLoading(false);
    }
  };

  if (loadingItems) {
    return <div className="text-center py-10 text-muted-foreground">Loading items...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>No Available Items</CardTitle>
            <CardDescription>
              You need to create an item before creating an auction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/dashboard/items/new")}
              className="bg-primary hover:bg-[var(--navy-dark)] shadow-md hover:shadow-lg"
            >
              Create New Item
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const minStartTime = new Date(now.getTime() + 60000)
    .toISOString()
    .slice(0, 16);
  const minEndTime = new Date(now.getTime() + 3600000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Create New Auction
        </h2>
        <p className="text-muted-foreground">Set up your auction details</p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Auction Details</CardTitle>
          <CardDescription>Configure your auction settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border-2 border-destructive/30 text-destructive px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Select Item *
              </label>
              <select
                name="itemId"
                required
                defaultValue={preselectedItemId || ""}
                className="w-full px-3 py-2 border-2 border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              >
                <option value="">Choose an item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Auction Title *
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-3 py-2 border-2 border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="e.g. Vintage Watch Auction"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={3}
                className="w-full px-3 py-2 border-2 border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="Auction details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category *
              </label>
              <select
                name="category"
                required
                className="w-full px-3 py-2 border-2 border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              >
                <option value="">Select category</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home</option>
                <option value="sports">Sports</option>
                <option value="toys">Toys</option>
                <option value="books">Books</option>
                <option value="art">Art</option>
                <option value="collectibles">Collectibles</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Starting Price *
                </label>
                <input
                  type="number"
                  name="startingPrice"
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border-2 border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Min Increment
                </label>
                <input
                  type="number"
                  name="minIncrement"
                  min="1"
                  defaultValue="10"
                  className="w-full px-3 py-2 border-2 border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  required
                  min={minStartTime}
                  className="w-full px-3 py-2 border-2 border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  required
                  min={minEndTime}
                  className="w-full px-3 py-2 border-2 border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-[var(--navy-dark)] flex-1 shadow-md hover:shadow-lg"
              >
                {loading ? "Creating..." : "Create Auction"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
