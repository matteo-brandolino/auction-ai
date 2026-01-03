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
        <h2 className="text-3xl font-bold text-foreground">Leaderboard</h2>
        <p className="text-muted-foreground">Top performers in BidWars</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Bidders */}
        <Card className="lg:col-span-1 bg-card border-2 border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-foreground">Top Bidders</CardTitle>
            <CardDescription>Most bids placed</CardDescription>
          </CardHeader>
          <CardContent>
            {topBidders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No bidders yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4">
                {topBidders.map((user: any, index: number) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      index < 3
                        ? "bg-primary/10 border-2 border-primary/30 shadow-sm"
                        : "bg-muted border border-border"
                    }`}
                  >
                    <div className="text-lg w-8 text-center font-bold text-primary">
                      {getMedalIcon(index)}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-secondary text-primary-foreground">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.totalBids} total bids
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">
                        ${user.credits.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">spent</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Active Today */}
        <Card className="lg:col-span-1 bg-card border-2 border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-foreground">Most Active Today</CardTitle>
            <CardDescription>Bidding champions</CardDescription>
          </CardHeader>
          <CardContent>
            {mostActive.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No activity today yet
              </p>
            ) : (
              <div className="space-y-4">
                {mostActive.map((user: any, index: number) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      index < 3
                        ? "bg-[var(--gold-accent)]/10 border-2 border-[var(--gold-accent)]/30 shadow-sm"
                        : "bg-muted border border-border"
                    }`}
                  >
                    <div className="text-lg w-8 text-center font-bold text-[var(--gold-accent)]">
                      {getMedalIcon(index)}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-secondary text-primary-foreground">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.activeAuctions} active auctions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--gold-accent)]">
                        {user.bidsToday}
                      </p>
                      <p className="text-xs text-muted-foreground">bids today</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Biggest Wins */}
        <Card className="lg:col-span-1 bg-card border-2 border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-foreground">Biggest Wins</CardTitle>
            <CardDescription>Highest winning bids</CardDescription>
          </CardHeader>
          <CardContent>
            {biggestWins.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No wins recorded yet
              </p>
            ) : (
              <div className="space-y-4">
                {biggestWins.map((win: any, index: number) => (
                  <div
                    key={win.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      index < 3
                        ? "bg-secondary/10 border-2 border-secondary/30 shadow-sm"
                        : "bg-muted border border-border"
                    }`}
                  >
                    <div className="text-lg w-8 text-center font-bold text-secondary">
                      {getMedalIcon(index)}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-secondary text-primary-foreground">{getInitials(win.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{win.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {win.auctionTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-secondary">
                        ${win.winAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">won</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Your Stats */}
      <Card className="bg-card border-2 border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-foreground">Your Ranking</CardTitle>
          <CardDescription>See where you stand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-primary/10 border-2 border-primary/30 rounded-lg shadow-sm">
              <p className="text-3xl font-bold text-primary">
                {myRanking?.totalBidsRank
                  ? `#${myRanking.totalBidsRank}`
                  : "-"}
              </p>
              <p className="text-sm text-foreground mt-1 font-medium">Total Bids Rank</p>
              {myRanking?.stats && (
                <p className="text-xs text-muted-foreground mt-1">
                  {myRanking.stats.totalBids} bids
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-[var(--gold-accent)]/10 border-2 border-[var(--gold-accent)]/30 rounded-lg shadow-sm">
              <p className="text-3xl font-bold text-[var(--gold-accent)]">
                {myRanking?.activityRank ? `#${myRanking.activityRank}` : "-"}
              </p>
              <p className="text-sm text-foreground mt-1 font-medium">Activity Rank</p>
              {myRanking?.stats && (
                <p className="text-xs text-muted-foreground mt-1">
                  {myRanking.stats.bidsToday} today
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-secondary/10 border-2 border-secondary/30 rounded-lg shadow-sm">
              <p className="text-3xl font-bold text-secondary">
                {myRanking?.biggestWin
                  ? `$${myRanking.biggestWin.amount.toLocaleString()}`
                  : "-"}
              </p>
              <p className="text-sm text-foreground mt-1 font-medium">Biggest Win</p>
              {myRanking?.biggestWin && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {myRanking.biggestWin.auctionTitle}
                </p>
              )}
            </div>
          </div>
          {!myRanking?.stats?.totalBids && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Start bidding to appear on the leaderboard!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
