import { auth } from "@/auth";
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
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/login");
  }

  const items = await getItems(session.accessToken);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Items</h2>
          <p className="text-gray-500">Manage your items and create auctions</p>
        </div>
        <Link href="/dashboard/items/new">
          <Button className="bg-violet-600 hover:bg-violet-700">
            Create New Item
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500">No items yet. Create your first item!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Condition:</span>
                    <span className="font-medium">{item.condition}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        item.status === "available"
                          ? "bg-green-100 text-green-800"
                          : item.status === "in_auction"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
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
