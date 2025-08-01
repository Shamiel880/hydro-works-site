"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Loader2, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import type { WooCommerceProduct } from "@/types/woocommerce"

interface SmartSearchProps {
  onClose?: () => void
}

export function SmartSearch({ onClose }: SmartSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<WooCommerceProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch(searchTerm)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const performSearch = async (query: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&per_page=5`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.products || [])
        setShowResults(true)
      }
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = () => {
    setShowResults(false)
    setSearchTerm("")
    onClose?.()
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hydro-onyx/50 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 border-hydro-green/20 focus:border-hydro-green bg-hydro-white"
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-hydro-green h-4 w-4 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-hydro-white border border-hydro-green/20 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={handleResultClick}
                    className="block"
                  >
                    <Card className="mb-2 last:mb-0 border-0 hover:bg-hydro-mint/10 transition-colors cursor-pointer">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-hydro-mint/20 flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0].src || "/placeholder.svg"}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-hydro-green/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-hydro-onyx text-sm line-clamp-1">{product.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <div
                                className="text-hydro-green font-semibold text-sm"
                                dangerouslySetInnerHTML={{ __html: product.price_html }}
                              />
                              {product.categories && product.categories.length > 0 && (
                                <span className="text-xs text-hydro-onyx/60">{product.categories[0].name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                <div className="text-center p-2 border-t border-hydro-green/10">
                  <Link href={`/store?search=${encodeURIComponent(searchTerm)}`} onClick={handleResultClick}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-hydro-green hover:text-hydro-green hover:bg-hydro-mint/20"
                    >
                      View all results for "{searchTerm}"
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-hydro-onyx/60">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-hydro-green/30" />
                <p>No products found for "{searchTerm}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
