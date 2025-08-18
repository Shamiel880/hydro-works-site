// app/layout.tsx

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cartContext";
import { Toaster } from "react-hot-toast";
import { Footer } from "@/components/footer";
import { AnimatedHeader } from "@/components/animated-header";
import { CookieBanner } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "Hydro Works Store – Hydroponics & Organic Growing Solutions",
  description:
    "Shop premium hydroponic systems, organic nutrients, and horticultural solutions at Hydro Works. Serving growers across Cape Town and South Africa.",
  generator: "Hydro Works",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head />
      <body className="font-sans bg-hydro-white text-hydro-onyx">
        <CartProvider>
          <AnimatedHeader /> {/* ✅ Header appears on all pages */}
          <main>{children}</main>
          <Footer /> {/* ✅ Footer appears on all pages */}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <SpeedInsights /> {/* ✅ Vercel performance tracking */}
          <CookieBanner /> {/* ✅ Hydro Works branded cookie banner */}
          <Analytics/>
        </CartProvider>
      </body>
    </html>
  );
}
