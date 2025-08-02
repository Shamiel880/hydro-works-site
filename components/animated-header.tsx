"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { SmartSearch } from "./smart-search"
import { MobileMenu } from "./mobile-menu"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cartContext"

export function AnimatedHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { totalItems } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      } bg-hydro-white border-b border-hydro-green/10`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/hydro-works-new-logo.png"
            alt="Hydro Works Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </Link>

        {/* Desktop Search + Navigation */}
        <div className="hidden lg:flex items-center flex-1 justify-end gap-6">
          <SmartSearch />
          <nav className="flex items-center space-x-6">
            {[
              { name: "Store", href: "/store" },
              { name: "Solutions", href: "/solutions" },
              { name: "About", href: "/about" },
              { name: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-hydro-onyx hover:text-hydro-green font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Cart + Menu */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-hydro-onyx" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-hydro-green text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
