import { getItemsAction } from "@/app/actions/auction-actions";
import type { Item } from "@/types/item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AuctionForm from "./auction-form";

interface PageProps {
  searchParams: { itemId?: string };
}

export default async function NewAuctionPage({ searchParams }: PageProps) {
  const { itemId } = await searchParams;

  const response = await getItemsAction();
  const availableItems = response.items.filter(
    (item: Item) => item.status === "available"
  );

  if (availableItems.length === 0) {
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
              asChild
              className="bg-primary hover:bg-[var(--navy-dark)] shadow-md hover:shadow-lg"
            >
              <Link href="/dashboard/items/new">Create New Item</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Create New Auction
        </h2>
        <p className="text-muted-foreground">Set up your auction details</p>
      </div>

      <AuctionForm items={availableItems} preselectedItemId={itemId ?? null} />
    </div>
  );
}
