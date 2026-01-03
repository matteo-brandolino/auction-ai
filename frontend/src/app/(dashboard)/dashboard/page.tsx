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
import { Coins, Target, Trophy, Zap, Package, Gavel, Flame, TrendingUp, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

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
    <div className="space-y-8 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground mb-2">
            Welcome back, {session?.user.name}
          </h2>
          <p className="text-muted-foreground">Dashboard Overview</p>
        </div>
        <Link href="/dashboard/auctions">
          <Button className="px-6 py-3 bg-primary hover:bg-[var(--navy-dark)] font-semibold rounded flex items-center gap-2 shadow-md">
            <Flame className="w-4 h-4" />
            View Auctions
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border-2 border-border rounded-lg p-6 hover:border-[var(--gold-accent)] hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <Coins className="w-8 h-8 text-[var(--gold-accent)]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Balance</span>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {stats.credits.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Credits Available</div>
        </div>

        <div className="bg-card border-2 border-border rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active</span>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {stats.activeBids}
          </div>
          <div className="text-sm text-muted-foreground">Currently Bidding</div>
        </div>

        <div className="bg-card border-2 border-border rounded-lg p-6 hover:border-secondary hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-8 h-8 text-secondary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Victories</span>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {stats.auctionsWon}
          </div>
          <div className="text-sm text-muted-foreground">Auctions Won</div>
        </div>

        <div className="bg-card border-2 border-border rounded-lg p-6 hover:border-[var(--coral-accent)] hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-[var(--coral-accent)]" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Live</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {stats.liveAuctions}
          </div>
          <div className="text-sm text-muted-foreground">Active Auctions</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card border-2 border-border rounded-lg p-6 shadow-md">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-1">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Common tasks</p>
          </div>
          <div className="space-y-2">
            <Link href="/dashboard/items/new">
              <div className="flex items-center gap-3 p-3 rounded bg-muted hover:bg-[var(--gold-light)] hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-[var(--gold-accent)]">
                <Package className="w-5 h-5 text-[var(--gold-accent)]" />
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-sm">Create New Item</div>
                  <div className="text-xs text-muted-foreground">Add an item to auction</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/auctions/new">
              <div className="flex items-center gap-3 p-3 rounded bg-muted hover:bg-blue-50 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary">
                <Gavel className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-sm">Create New Auction</div>
                  <div className="text-xs text-muted-foreground">Start a new auction</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/auctions">
              <div className="flex items-center gap-3 p-3 rounded bg-muted hover:bg-orange-50 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-[var(--coral-accent)]">
                <Flame className="w-5 h-5 text-[var(--coral-accent)]" />
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-sm">Browse Live Auctions</div>
                  <div className="text-xs text-muted-foreground">Join active auctions</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/leaderboard">
              <div className="flex items-center gap-3 p-3 rounded bg-muted hover:bg-green-50 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-secondary">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-sm">View Leaderboard</div>
                  <div className="text-xs text-muted-foreground">Check your ranking</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-lg p-6 shadow-md">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-1">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Your latest bids</p>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <Inbox className="w-12 h-12 mb-3 opacity-20 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              No recent activity yet.<br />
              <span className="text-foreground font-medium">Start bidding to see your history</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
