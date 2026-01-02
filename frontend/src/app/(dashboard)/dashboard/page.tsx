import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerAccessToken, getServerSession } from "@/lib/auth-helpers";

async function getUserStats(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const [userRes, rankingRes, auctionsRes] = await Promise.all([
      fetch(`${apiUrl}/api/users/me`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiUrl}/api/leaderboard/my-ranking`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiUrl}/api/auctions?status=active`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const [userData, rankingData, auctionsData] = await Promise.all([
      userRes.ok ? userRes.json() : { user: null },
      rankingRes.ok ? rankingRes.json() : null,
      auctionsRes.ok ? auctionsRes.json() : { auctions: [] },
    ]);

    return {
      credits: userData.user?.credits || 0,
      activeBids: rankingData?.userStats?.activeAuctions?.length || 0,
      auctionsWon: rankingData?.userStats?.auctionsWon || 0,
      liveAuctions: auctionsData.auctions?.length || 0,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      credits: 0,
      activeBids: 0,
      auctionsWon: 0,
      liveAuctions: 0,
    };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession();
  const token = await getServerAccessToken();

  if (!session || !token) {
    redirect("/login");
  }

  const stats = await getUserStats(token);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome, {session?.user.name}!
          </h2>
          <p className="text-gray-500">Your BidWars dashboard</p>
        </div>
        <Link href="/dashboard/auctions">
          <Button className="bg-violet-600 hover:bg-violet-700">
            Browse Live Auctions
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Credits</CardTitle>
            <CardDescription>Your balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-600">
              {stats.credits.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Bids</CardTitle>
            <CardDescription>Currently bidding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeBids}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auctions Won</CardTitle>
            <CardDescription>Total victories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.auctionsWon}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Auctions</CardTitle>
            <CardDescription>Active now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.liveAuctions}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>What would you like to do?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/items/new">
              <Button variant="outline" className="w-full justify-start">
                Create New Item
              </Button>
            </Link>
            <Link href="/dashboard/auctions/new">
              <Button variant="outline" className="w-full justify-start">
                Create New Auction
              </Button>
            </Link>
            <Link href="/dashboard/auctions">
              <Button variant="outline" className="w-full justify-start">
                Browse Live Auctions
              </Button>
            </Link>
            <Link href="/dashboard/leaderboard">
              <Button variant="outline" className="w-full justify-start">
                View Leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest bids</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 text-center py-8">
              No recent activity. Start bidding!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
