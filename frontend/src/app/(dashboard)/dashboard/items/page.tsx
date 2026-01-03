import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Item } from "@/types/item";
import { getServerAccessToken, getServerSession } from "@/lib/auth-helpers";

async function getItems(token: string): Promise<Item[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${apiUrl}/api/items`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch items: ${res.status}`);
    }

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
}

export default async function ItemsPage() {
  const session = await getServerSession();
  const token = await getServerAccessToken();

  if (!session || !token) {
    redirect("/login");
  }

  const items = await getItems(token);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">My Items</h2>
          <p className="text-muted-foreground">Manage your items and create auctions</p>
        </div>
        <Link href="/dashboard/items/new">
          <Button className="bg-primary hover:bg-[var(--navy-dark)] shadow-md hover:shadow-lg">
            Create New Item
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="bg-card border-2 border-border">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No items yet. Create your first item!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="bg-card border-2 border-border hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">{item.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium text-foreground">{item.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="font-medium text-foreground">{item.condition}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${
                        item.status === "available"
                          ? "bg-secondary/10 text-secondary border-secondary/30"
                          : item.status === "in_auction"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  {item.status === "available" && (
                    <Link href={`/dashboard/auctions/new?itemId=${item.id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        Create Auction
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
