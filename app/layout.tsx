// app/layout.tsx

import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

import { CartProvider } from "@/lib/cartContext"
import { Toaster } from "react-hot-toast"
import { Footer } from "@/components/footer"         // ✅ Import Footer
import { AnimatedHeader } from "@/components/animated-header" // ✅ Import Header

export const metadata: Metadata = {
  title: "Hydro Works Store",
  description: "Smart horticultural shopping powered by Next.js and WooCommerce.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head />
      <body className="font-sans bg-hydro-white text-hydro-onyx">
        <CartProvider>
          <AnimatedHeader /> {/* ✅ Header appears on all pages */}
          <main>{children}</main>
          <Footer />         {/* ✅ Footer appears on all pages */}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </CartProvider>
      </body>
    </html>
  )
}
