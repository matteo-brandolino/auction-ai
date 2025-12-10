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
              <h1
                className="text-2xl font-bold 
  text-gray-900"
              >
                AuctionAI
              </h1>
              <nav className="ml-10 flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 
  hover:text-gray-900 px-3 py-2 rounded-md text-sm 
  font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/immobili"
                  className="text-gray-700 
  hover:text-gray-900 px-3 py-2 rounded-md text-sm 
  font-medium"
                >
                  Immobili
                </Link>
                <Link
                  href="/dashboard/preferiti"
                  className="text-gray-700 
  hover:text-gray-900 px-3 py-2 rounded-md text-sm 
  font-medium"
                >
                  Preferiti
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
                  <Link href="/dashboard/profilo">Profilo</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/impostazioni">Impostazioni</Link>
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
  );
}
