import { auth } from "@/auth";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();

  // TODO: Fetch real stats from backend
  const stats = {
    credits: 10000,
    activeBids: 0,
    auctionsWon: 0,
    liveAuctions: 0,
  };

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
