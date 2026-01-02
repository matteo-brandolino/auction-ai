import { redirect } from "next/navigation";
import { getServerAccessToken, getServerSession } from "@/lib/auth-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

async function getLeaderboardData(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const [topBidders, mostActive, biggestWins, myRanking] = await Promise.all([
      fetch(`${apiUrl}/api/leaderboard/top-bidders?limit=5`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiUrl}/api/leaderboard/most-active-today?limit=5`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiUrl}/api/leaderboard/biggest-wins?limit=5`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiUrl}/api/leaderboard/my-ranking`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const [topBiddersData, mostActiveData, biggestWinsData, myRankingData] =
      await Promise.all([
        topBidders.ok ? topBidders.json() : { leaderboard: [] },
        mostActive.ok ? mostActive.json() : { leaderboard: [] },
        biggestWins.ok ? biggestWins.json() : { leaderboard: [] },
        myRanking.ok ? myRanking.json() : null,
      ]);

    return {
      topBidders: topBiddersData.leaderboard || [],
      mostActive: mostActiveData.leaderboard || [],
      biggestWins: biggestWinsData.leaderboard || [],
      myRanking: myRankingData,
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return {
      topBidders: [],
      mostActive: [],
      biggestWins: [],
      myRanking: null,
    };
  }
}

export default async function LeaderboardPage() {
  const session = await getServerSession();
  const token = await getServerAccessToken();

  if (!session || !token) {
    redirect("/login");
  }

  const { topBidders, mostActive, biggestWins, myRanking } =
    await getLeaderboardData(token);

  const getMedalIcon = (position: number) => {
    return `#${position + 1}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Leaderboard</h2>
        <p className="text-slate-400">Top performers in BidWars</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Bidders */}
        <Card className="lg:col-span-1 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Top Bidders</CardTitle>
            <CardDescription className="text-slate-400">Most bids placed</CardDescription>
          </CardHeader>
          <CardContent>
            {topBidders.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                No bidders yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4">
                {topBidders.map((user: any, index: number) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index < 3
                        ? "bg-indigo-500/10 border border-indigo-500/20"
                        : "bg-slate-800 border border-slate-700"
                    }`}
                  >
                    <div className="text-lg w-8 text-center font-bold text-indigo-400">
                      {getMedalIcon(index)}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-slate-700 text-white">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">
                        {user.totalBids} total bids
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-400">
                        ${user.credits.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">spent</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Active Today */}
        <Card className="lg:col-span-1 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Most Active Today</CardTitle>
            <CardDescription className="text-slate-400">Bidding champions</CardDescription>
          </CardHeader>
          <CardContent>
            {mostActive.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                No activity today yet
              </p>
            ) : (
              <div className="space-y-4">
                {mostActive.map((user: any, index: number) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index < 3
                        ? "bg-amber-500/10 border border-amber-500/20"
                        : "bg-slate-800 border border-slate-700"
                    }`}
                  >
                    <div className="text-lg w-8 text-center font-bold text-amber-400">
                      {getMedalIcon(index)}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-slate-700 text-white">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">
                        {user.activeAuctions} active auctions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">
                        {user.bidsToday}
                      </p>
                      <p className="text-xs text-slate-400">bids today</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Biggest Wins */}
        <Card className="lg:col-span-1 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Biggest Wins</CardTitle>
            <CardDescription className="text-slate-400">Highest winning bids</CardDescription>
          </CardHeader>
          <CardContent>
            {biggestWins.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                No wins recorded yet
              </p>
            ) : (
              <div className="space-y-4">
                {biggestWins.map((win: any, index: number) => (
                  <div
                    key={win.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index < 3
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "bg-slate-800 border border-slate-700"
                    }`}
                  >
                    <div className="text-lg w-8 text-center font-bold text-emerald-400">
                      {getMedalIcon(index)}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-slate-700 text-white">{getInitials(win.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-white">{win.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {win.auctionTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">
                        ${win.winAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">won</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Your Stats */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Your Ranking</CardTitle>
          <CardDescription className="text-slate-400">See where you stand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <p className="text-3xl font-bold text-indigo-400">
                {myRanking?.totalBidsRank
                  ? `#${myRanking.totalBidsRank}`
                  : "-"}
              </p>
              <p className="text-sm text-slate-300 mt-1">Total Bids Rank</p>
              {myRanking?.stats && (
                <p className="text-xs text-slate-400 mt-1">
                  {myRanking.stats.totalBids} bids
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-3xl font-bold text-amber-400">
                {myRanking?.activityRank ? `#${myRanking.activityRank}` : "-"}
              </p>
              <p className="text-sm text-slate-300 mt-1">Activity Rank</p>
              {myRanking?.stats && (
                <p className="text-xs text-slate-400 mt-1">
                  {myRanking.stats.bidsToday} today
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-3xl font-bold text-emerald-400">
                {myRanking?.biggestWin
                  ? `$${myRanking.biggestWin.amount.toLocaleString()}`
                  : "-"}
              </p>
              <p className="text-sm text-slate-300 mt-1">Biggest Win</p>
              {myRanking?.biggestWin && (
                <p className="text-xs text-slate-400 mt-1 truncate">
                  {myRanking.biggestWin.auctionTitle}
                </p>
              )}
            </div>
          </div>
          {!myRanking?.stats?.totalBids && (
            <p className="text-center text-sm text-slate-400 mt-4">
              Start bidding to appear on the leaderboard!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
