"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, Store, Users, Phone, ShoppingCart, Wrench } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { SmartSearch } from "./smart-search"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Solutions", href: "/solutions", icon: Wrench },
    { name: "Store", href: "/store", icon: Store },
    { name: "About", href: "/about", icon: Users },
    { name: "Contact", href: "/contact", icon: Phone },
  ]

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-hydro-onyx hover:text-hydro-green"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={closeMenu}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-hydro-white shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-hydro-green/10">
                  <div className="flex items-center space-x-3">
                    <Image
                      src="/images/hydro-works-new-logo.png"
                      alt="Hydro Works Logo"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                    <span className="font-semibold text-hydro-onyx">Hydro Works</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={closeMenu} className="text-hydro-onyx">
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-hydro-green/10">
                  <SmartSearch onClose={closeMenu} />
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6">
                  <ul className="space-y-2">
                    {menuItems.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={closeMenu}
                          className="flex items-center space-x-3 p-3 rounded-xl text-hydro-onyx hover:bg-hydro-mint/20 hover:text-hydro-green transition-colors"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-hydro-green/10">
                  <Button className="w-full bg-hydro-green hover:bg-hydro-green/90 text-hydro-white">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Cart
                  </Button>
                  <p className="text-center text-sm text-hydro-onyx/60 mt-4">Cape Town, South Africa</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
