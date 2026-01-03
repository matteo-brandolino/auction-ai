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
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const ACHIEVEMENT_DEFINITIONS = [
  { id: "first_bid", name: "First Bid", description: "Place your first bid", icon: "🎯", tier: "bronze", points: 10 },
  { id: "first_win", name: "First Victory", description: "Win your first auction", icon: "🏆", tier: "bronze", points: 50 },
  { id: "first_auction", name: "Auctioneer", description: "Create your first auction", icon: "📢", tier: "bronze", points: 25 },
  { id: "bids_10", name: "Active Bidder", description: "Place 10 bids", icon: "🎲", tier: "bronze", points: 50 },
  { id: "bids_50", name: "Bid Enthusiast", description: "Place 50 bids", icon: "🎰", tier: "silver", points: 100 },
  { id: "bids_100", name: "Bid Master", description: "Place 100 bids", icon: "💎", tier: "gold", points: 250 },
  { id: "spend_100", name: "Starter Spender", description: "Spend $100 total", icon: "💰", tier: "bronze", points: 50 },
  { id: "spend_1000", name: "Big Spender", description: "Spend $1,000 total", icon: "💵", tier: "silver", points: 150 },
  { id: "spend_10000", name: "Whale", description: "Spend $10,000 total", icon: "🐋", tier: "platinum", points: 500 },
  { id: "wins_5", name: "Winner", description: "Win 5 auctions", icon: "🥇", tier: "silver", points: 100 },
  { id: "wins_10", name: "Champion", description: "Win 10 auctions", icon: "👑", tier: "gold", points: 250 },
  { id: "top_10", name: "Top 10", description: "Reach top 10 on leaderboard", icon: "⭐", tier: "gold", points: 200 },
  { id: "top_3", name: "Podium Finisher", description: "Reach top 3 on leaderboard", icon: "🌟", tier: "platinum", points: 500 },
  { id: "last_second_win", name: "Sniper", description: "Win auction in last 10 seconds", icon: "🎯", tier: "gold", points: 300 },
  { id: "popular_auction", name: "Trendsetter", description: "Create auction with 50+ bids", icon: "🔥", tier: "gold", points: 200 },
];

async function getProfileData(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const [userRes, achievementsRes, rankingRes] = await Promise.all([
      fetch(`${apiUrl}/api/users/me`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiUrl}/api/achievements/my`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiUrl}/api/leaderboard/my-ranking`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const [userData, achievementsData, rankingData] = await Promise.all([
      userRes.ok ? userRes.json() : { user: null },
      achievementsRes.ok ? achievementsRes.json() : { achievements: [], count: 0 },
      rankingRes.ok ? rankingRes.json() : null,
    ]);

    return {
      user: userData.user,
      achievements: achievementsData.achievements || [],
      count: achievementsData.count || 0,
      ranking: rankingData,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return {
      user: null,
      achievements: [],
      count: 0,
      ranking: null,
    };
  }
}

export default async function ProfilePage() {
  const session = await getServerSession();
  const token = await getServerAccessToken();

  if (!session || !token) {
    redirect("/login");
  }

  const { user, achievements, count, ranking } = await getProfileData(token);

  if (!user) {
    return <div>Error loading profile</div>;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const unlockedAchievementIds = new Set(
    achievements.map((a: any) => a.achievementId)
  );

  const totalPoints = achievements.reduce((sum: number, a: any) => {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.id === a.achievementId);
    return sum + (def?.points || 0);
  }, 0);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "bg-[var(--coral-accent)]/10 text-[var(--coral-accent)] border-[var(--coral-accent)]/30";
      case "silver":
        return "bg-muted text-muted-foreground border-border";
      case "gold":
        return "bg-[var(--gold-accent)]/10 text-[var(--gold-accent)] border-[var(--gold-accent)]/30";
      case "platinum":
        return "bg-primary/10 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          View your stats, achievements, and rankings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="outline" className="mt-1">
                  {user.role}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Credits</p>
                <p className="text-2xl font-bold">${user.credits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Bids</span>
                <span className="font-semibold">{ranking?.userStats?.totalBids || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Auctions Won</span>
                <span className="font-semibold">{ranking?.userStats?.auctionsWon || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="font-semibold">${ranking?.userStats?.totalSpent || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Auctions Created</span>
                <span className="font-semibold">{user.auctionsCreated || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {ranking && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>Your position on the leaderboards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border-2 border-border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Total Bids</p>
                <p className="text-3xl font-bold text-primary">#{ranking.ranks?.totalBidsRank || "-"}</p>
              </div>
              <div className="text-center p-4 border-2 border-border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Auctions Won</p>
                <p className="text-3xl font-bold text-secondary">#{ranking.ranks?.auctionsWonRank || "-"}</p>
              </div>
              <div className="text-center p-4 border-2 border-border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-3xl font-bold text-[var(--gold-accent)]">#{ranking.ranks?.totalSpentRank || "-"}</p>
              </div>
              <div className="text-center p-4 border-2 border-border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Today's Bids</p>
                <p className="text-3xl font-bold text-[var(--coral-accent)]">#{ranking.ranks?.bidsTodayRank || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            {count} of {ACHIEVEMENT_DEFINITIONS.length} unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
              const isUnlocked = unlockedAchievementIds.has(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 border rounded-lg ${
                    isUnlocked ? "bg-card" : "bg-muted/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {achievement.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getTierColor(achievement.tier)}`}
                        >
                          {achievement.tier}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                      <p className="text-xs font-semibold mt-1">
                        {achievement.points} pts
                      </p>
                    </div>
                  </div>
                  {isUnlocked && (
                    <div className="mt-2 text-xs text-secondary font-medium">
                      ✓ Unlocked
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
