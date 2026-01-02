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
      <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">
                BidWars
              </h1>
              <nav className="ml-10 flex space-x-1">
                <Link
                  href="/dashboard"
                  className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/items"
                  className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  My Items
                </Link>
                <Link
                  href="/dashboard/my-auctions"
                  className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  My Auctions
                </Link>
                <Link
                  href="/dashboard/auctions"
                  className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Live Auctions
                </Link>
                <Link
                  href="/dashboard/leaderboard"
                  className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Leaderboard
                </Link>
              </nav>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 hover:opacity-80">
                  <Avatar>
                    <AvatarFallback className="bg-slate-800 text-white">{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white">
                    {session.user.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem asChild className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
    </AuthSessionProvider>
  );
}
