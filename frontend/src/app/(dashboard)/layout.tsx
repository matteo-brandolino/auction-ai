import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/logout-button";
import { AuthSessionProvider } from "@/components/session-provider";
import { Toaster } from "sonner";
import { AchievementListener } from "@/components/achievement-listener";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <AuthSessionProvider>
      <Toaster richColors position="top-right" />
      <AchievementListener />
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link
                  href="/dashboard"
                  className="text-foreground hover:text-primary hover:bg-muted px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--navy-primary)] to-[var(--sage-green)] bg-clip-text text-transparent">
                    BidWars
                  </h1>
                </Link>
                <nav className="flex space-x-1">
                  <Link
                    href="/dashboard/items"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    My Items
                  </Link>
                  <Link
                    href="/dashboard/my-auctions"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    My Auctions
                  </Link>
                  <Link
                    href="/dashboard/auctions"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Live Auctions
                  </Link>
                  <Link
                    href="/dashboard/leaderboard"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Leaderboard
                  </Link>
                </nav>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {session.user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-card border-border"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    asChild
                    className="text-foreground hover:bg-muted"
                  >
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="text-foreground hover:bg-muted"
                  >
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">{children}</main>
      </div>
    </AuthSessionProvider>
  );
}
