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
          <h2 className="font-display text-4xl font-bold tracking-tight text-white mb-2">
            Welcome back, {session?.user.name}
          </h2>
          <p className="text-slate-400">Dashboard Overview</p>
        </div>
        <Link href="/dashboard/auctions">
          <Button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded flex items-center gap-2">
            <Flame className="w-4 h-4" />
            View Auctions
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <Coins className="w-8 h-8 text-amber-500" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Balance</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.credits.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400">Credits Available</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Active</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.activeBids}
          </div>
          <div className="text-sm text-slate-400">Currently Bidding</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-8 h-8 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Victories</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.auctionsWon}
          </div>
          <div className="text-sm text-slate-400">Auctions Won</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-rose-500" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span className="text-xs font-semibold text-slate-400 uppercase">Live</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.liveAuctions}
          </div>
          <div className="text-sm text-slate-400">Active Auctions</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">Quick Actions</h3>
            <p className="text-sm text-slate-400">Common tasks</p>
          </div>
          <div className="space-y-2">
            <Link href="/dashboard/items/new">
              <div className="flex items-center gap-3 p-3 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
                <Package className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">Create New Item</div>
                  <div className="text-xs text-slate-400">Add an item to auction</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/auctions/new">
              <div className="flex items-center gap-3 p-3 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
                <Gavel className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">Create New Auction</div>
                  <div className="text-xs text-slate-400">Start a new auction</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/auctions">
              <div className="flex items-center gap-3 p-3 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
                <Flame className="w-5 h-5 text-rose-500" />
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">Browse Live Auctions</div>
                  <div className="text-xs text-slate-400">Join active auctions</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/leaderboard">
              <div className="flex items-center gap-3 p-3 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">View Leaderboard</div>
                  <div className="text-xs text-slate-400">Check your ranking</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">Recent Activity</h3>
            <p className="text-sm text-slate-400">Your latest bids</p>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <Inbox className="w-12 h-12 mb-3 opacity-20 text-slate-600" />
            <p className="text-sm text-slate-400 text-center">
              No recent activity yet.<br />
              <span className="text-slate-300">Start bidding to see your history</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
