import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function LeaderboardPage() {
  const session = await auth();

  // TODO: Fetch from Leaderboard Service (FASE 8)
  const topBidders = [
    { id: "1", name: "Alice Johnson", totalBids: 156, credits: 45000 },
    { id: "2", name: "Bob Smith", totalBids: 142, credits: 38500 },
    { id: "3", name: "Carol White", totalBids: 128, credits: 32000 },
    { id: "4", name: "David Brown", totalBids: 115, credits: 28000 },
    { id: "5", name: "Eve Davis", totalBids: 98, credits: 24500 },
  ];

  const mostActiveToday = [
    { id: "1", name: "Frank Miller", bidsToday: 42, activeAuctions: 8 },
    { id: "2", name: "Grace Lee", bidsToday: 38, activeAuctions: 6 },
    { id: "3", name: "Henry Wilson", bidsToday: 35, activeAuctions: 7 },
    { id: "4", name: "Ivy Martinez", bidsToday: 31, activeAuctions: 5 },
    { id: "5", name: "Jack Anderson", bidsToday: 28, activeAuctions: 4 },
  ];

  const biggestWins = [
    { id: "1", name: "Kate Taylor", auctionTitle: "Vintage Watch", winAmount: 15000 },
    { id: "2", name: "Leo Garcia", auctionTitle: "Rare Comic Book", winAmount: 12500 },
    { id: "3", name: "Mia Rodriguez", auctionTitle: "Antique Vase", winAmount: 11000 },
    { id: "4", name: "Noah Thomas", auctionTitle: "Gaming Console", winAmount: 8500 },
    { id: "5", name: "Olivia Moore", auctionTitle: "Designer Bag", winAmount: 7200 },
  ];

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
            <div className="space-y-4">
              {topBidders.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    index < 3 ? "bg-gradient-to-r from-violet-50 to-pink-50" : "bg-gray-50"
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
                    <p className="text-xs text-gray-500">{user.totalBids} total bids</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-violet-600">
                      {user.credits.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">credits</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Active Today */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Most Active Today</CardTitle>
            <CardDescription>Bidding champions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostActiveToday.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    index < 3 ? "bg-gradient-to-r from-orange-50 to-yellow-50" : "bg-gray-50"
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
                    <p className="text-sm font-bold text-orange-600">{user.bidsToday}</p>
                    <p className="text-xs text-gray-500">bids today</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Biggest Wins */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Biggest Wins</CardTitle>
            <CardDescription>Highest winning bids</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {biggestWins.map((win, index) => (
                <div
                  key={win.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    index < 3 ? "bg-gradient-to-r from-green-50 to-emerald-50" : "bg-gray-50"
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
                    <p className="text-xs text-gray-500 truncate">{win.auctionTitle}</p>
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
              <p className="text-3xl font-bold text-violet-600">-</p>
              <p className="text-sm text-gray-600 mt-1">Total Bids Rank</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">-</p>
              <p className="text-sm text-gray-600 mt-1">Activity Rank</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">-</p>
              <p className="text-sm text-gray-600 mt-1">Biggest Win</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Start bidding to appear on the leaderboard!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
