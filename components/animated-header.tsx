"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SmartSearch } from "./smart-search";
import { MobileMenu } from "./mobile-menu";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cartContext";

export function AnimatedHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      } bg-hydro-white border-b border-hydro-green/10`}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-start gap-4">
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

        {/* Centered Navigation */}
        <nav className="absolute left-1/2 transform -translate-x-1/2 hidden lg:flex items-center space-x-8">
          {[
            { name: "Store", href: "/store" },
            { name: "Solutions", href: "/solutions" },
            { name: "Learning", href: "/learning" },
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

        {/* Right Side */}
        <div className="ml-auto flex items-center gap-4">
          {/* Desktop Search */}
          <div className="hidden md:block">
            <SmartSearch />
          </div>

          {/* Cart Icon with Counter */}
          <Link href="/cart" className="relative hidden md:inline-block">
            <ShoppingCart className="w-6 h-6 text-hydro-onyx hover:text-hydro-green" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-hydro-green text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
