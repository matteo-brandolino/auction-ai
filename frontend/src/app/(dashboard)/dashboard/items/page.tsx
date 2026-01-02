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
          <h2 className="text-3xl font-bold text-white">My Items</h2>
          <p className="text-slate-400">Manage your items and create auctions</p>
        </div>
        <Link href="/dashboard/items/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Create New Item
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-10 text-center">
            <p className="text-slate-400">No items yet. Create your first item!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-slate-400">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-medium text-white">{item.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Condition:</span>
                    <span className="font-medium text-white">{item.condition}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status:</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${
                        item.status === "available"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : item.status === "in_auction"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-slate-800 text-slate-300 border-slate-700"
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
