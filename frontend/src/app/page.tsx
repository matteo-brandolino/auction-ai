import { auth } from "@/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6">
        <nav className="py-6 flex justify-between items-center border-b border-border">
          <div className="font-display text-xl font-bold bg-gradient-to-r from-[var(--navy-primary)] to-[var(--sage-green)] bg-clip-text text-transparent">
            BidWars
          </div>
          <div className="flex gap-3">
            {session?.user ? (
              <Link href="/dashboard">
                <button className="px-6 py-2 bg-primary text-primary-foreground hover:bg-[var(--navy-dark)] rounded font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-6 py-2 text-muted-foreground hover:text-foreground font-semibold transition-colors duration-200">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-6 py-2 bg-primary text-primary-foreground hover:bg-[var(--navy-dark)] rounded font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-20">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border-2 border-border shadow-sm">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-foreground tracking-wide">
                Live Auction Platform
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-br from-[var(--navy-primary)] via-[var(--sage-green)] to-[var(--gold-accent)] bg-clip-text text-transparent">
              Professional Auction Platform
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Participate in real-time auctions with competitive bidding.
              Secure, transparent, and efficient.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link href={session?.user ? "/dashboard/auctions" : "/register"}>
                <button className="px-8 py-3 bg-primary text-primary-foreground hover:bg-[var(--navy-dark)] rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                  {session?.user ? "View Auctions" : "Get Started"}
                </button>
              </Link>
              {!session?.user && (
                <Link href="/login">
                  <button className="px-8 py-3 bg-card border-2 border-border hover:border-primary hover:bg-muted text-foreground rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </main>

        <footer className="py-6 border-t border-border text-center text-muted-foreground text-sm">
          <p>&copy; 2026 BidWars. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
