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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
        <p className="text-gray-500">Top performers in BidWars</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Bidders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Bidders</CardTitle>
            <CardDescription>Most bids placed</CardDescription>
          </CardHeader>
          <CardContent>
            {topBidders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No bidders yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4">
                {topBidders.map((user: any, index: number) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index < 3
                        ? "bg-gradient-to-r from-violet-50 to-pink-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="text-lg w-8 text-center font-bold text-violet-600">
                      {getMedalIcon(index)}
                    </div>
                    <Avatar>
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.totalBids} total bids
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-violet-600">
                        ${user.credits.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">spent</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Active Today */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Most Active Today</CardTitle>
            <CardDescription>Bidding champions</CardDescription>
          </CardHeader>
          <CardContent>
            {mostActive.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No activity today yet
              </p>
            ) : (
              <div className="space-y-4">
                {mostActive.map((user: any, index: number) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index < 3
                        ? "bg-gradient-to-r from-orange-50 to-yellow-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="text-lg w-8 text-center font-bold text-violet-600">
                      {getMedalIcon(index)}
                    </div>
                    <Avatar>
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.activeAuctions} active auctions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">
                        {user.bidsToday}
                      </p>
                      <p className="text-xs text-gray-500">bids today</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Biggest Wins */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Biggest Wins</CardTitle>
            <CardDescription>Highest winning bids</CardDescription>
          </CardHeader>
          <CardContent>
            {biggestWins.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No wins recorded yet
              </p>
            ) : (
              <div className="space-y-4">
                {biggestWins.map((win: any, index: number) => (
                  <div
                    key={win.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index < 3
                        ? "bg-gradient-to-r from-green-50 to-emerald-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="text-lg w-8 text-center font-bold text-violet-600">
                      {getMedalIcon(index)}
                    </div>
                    <Avatar>
                      <AvatarFallback>{getInitials(win.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{win.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {win.auctionTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        ${win.winAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">won</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Your Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Your Ranking</CardTitle>
          <CardDescription>See where you stand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-violet-50 rounded-lg">
              <p className="text-3xl font-bold text-violet-600">
                {myRanking?.totalBidsRank
                  ? `#${myRanking.totalBidsRank}`
                  : "-"}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Bids Rank</p>
              {myRanking?.stats && (
                <p className="text-xs text-gray-500 mt-1">
                  {myRanking.stats.totalBids} bids
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">
                {myRanking?.activityRank ? `#${myRanking.activityRank}` : "-"}
              </p>
              <p className="text-sm text-gray-600 mt-1">Activity Rank</p>
              {myRanking?.stats && (
                <p className="text-xs text-gray-500 mt-1">
                  {myRanking.stats.bidsToday} today
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {myRanking?.biggestWin
                  ? `$${myRanking.biggestWin.amount.toLocaleString()}`
                  : "-"}
              </p>
              <p className="text-sm text-gray-600 mt-1">Biggest Win</p>
              {myRanking?.biggestWin && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {myRanking.biggestWin.auctionTitle}
                </p>
              )}
            </div>
          </div>
          {!myRanking?.stats?.totalBids && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Start bidding to appear on the leaderboard!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
