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
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white border-b border-gray-200
   sticky top-0 z-10"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 
  lg:px-8"
        >
          <div
            className="flex justify-between 
  items-center h-16"
          >
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                BidWars
              </h1>
              <nav className="ml-10 flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/items"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Items
                </Link>
                <Link
                  href="/dashboard/my-auctions"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Auctions
                </Link>
                <Link
                  href="/dashboard/auctions"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Live Auctions
                </Link>
                <Link
                  href="/dashboard/leaderboard"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Leaderboard
                </Link>
              </nav>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center 
  space-x-2 hover:opacity-80"
                >
                  <Avatar>
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {session.user.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div
                    className="flex flex-col 
  space-y-1"
                  >
                    <p
                      className="text-sm 
  font-medium"
                    >
                      {session.user.name}
                    </p>
                    <p
                      className="text-xs 
  text-gray-500"
                    >
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 
  lg:px-8 py-8"
      >
        {children}
      </main>
    </div>
    </AuthSessionProvider>
  );
}
