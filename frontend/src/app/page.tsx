import { auth } from "@/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-6">
        <nav className="py-6 flex justify-between items-center border-b border-slate-800">
          <div className="font-display text-xl font-bold text-white">
            BidWars
          </div>
          <div className="flex gap-3">
            {session?.user ? (
              <Link href="/dashboard">
                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold transition-colors duration-200">
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-6 py-2 text-slate-300 hover:text-white font-semibold transition-colors duration-200">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold transition-colors duration-200">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-20">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span className="text-sm font-medium text-slate-300">Live Auction Platform</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight text-white">
              Professional Auction Platform
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Participate in real-time auctions with competitive bidding. Secure, transparent, and efficient.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-6">
              <Link href={session?.user ? "/dashboard/auctions" : "/register"}>
                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold transition-colors duration-200">
                  {session?.user ? "View Auctions" : "Get Started"}
                </button>
              </Link>
              {!session?.user && (
                <Link href="/login">
                  <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded font-semibold transition-colors duration-200">
                    Sign In
                  </button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-800 mt-12">
              <div>
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-sm text-slate-400">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-slate-400">Live Auctions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">50K+</div>
                <div className="text-sm text-slate-400">Items Sold</div>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-6 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>&copy; 2026 BidWars. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
