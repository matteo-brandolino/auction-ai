import type { Metadata } from "next";
import { Exo_2, Outfit } from "next/font/google";
import "./globals.css";

const exo2 = Exo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BidWars - Real-Time Auction Platform",
  description: "Experience the thrill of live auctions. Compete, bid, and win in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${exo2.variable} ${outfit.variable} antialiased font-body`}
      >
        {children}
      </body>
    </html>
  );
}
