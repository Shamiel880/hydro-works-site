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
  updateURLParams?: (params: { search: string | null; page: string }) => void
  dropdownClassName?: string
  className?: string
}

// Match the structure from your store page
interface ProductsResponse {
  items: WooCommerceProduct[]
  products?: WooCommerceProduct[] // Fallback for different API structures
  pagination?: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

function formatPrice(priceHtml: string): string {
  if (!priceHtml) return ""
  // Create a temporary div to extract text content from HTML
  const temp = document.createElement('div')
  temp.innerHTML = priceHtml
  return temp.textContent || temp.innerText || ""
}

export function SmartSearch({ 
  onClose, 
  updateURLParams, 
  dropdownClassName = "",
  className = ""
}: SmartSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<WooCommerceProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch(searchTerm.trim())
      } else {
        setResults([])
        setShowResults(false)
        setError(null)
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
    setError(null)
    
    try {
      // Use the same API structure as your store page
      const params = new URLSearchParams({
        search: query,
        per_page: "5",
        page: "1"
      })
      
      const response = await fetch(`/api/products?${params}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }
      
      const data: ProductsResponse = await response.json()
      
      // Handle both possible response structures
      const products = data.items || data.products || []
      
      console.log('Search API Response:', data) // Debug log
      console.log('Extracted products:', products) // Debug log
      
      setResults(products)
      setShowResults(true)
    } catch (error) {
      console.error("Search error:", error)
      setError(error instanceof Error ? error.message : "Search failed")
      setResults([])
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = () => {
    setShowResults(false)
    setSearchTerm("")
    onClose?.()
  }

  const handleViewAllResults = () => {
    if (updateURLParams) {
      // If we're in the sidebar, update the URL params
      updateURLParams({ search: searchTerm.trim(), page: "1" })
      setShowResults(false)
      setSearchTerm("")
    } else {
      // If we're in the header, navigate to store page
      window.location.href = `/store?search=${encodeURIComponent(searchTerm.trim())}`
    }
    onClose?.()
  }

  return (
    <div ref={searchRef} className={`relative w-full max-w-md ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hydro-onyx/50 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 border-hydro-green/20 focus:border-hydro-green bg-hydro-white"
          onFocus={() => searchTerm.trim().length >= 2 && setShowResults(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchTerm.trim()) {
              handleViewAllResults()
            }
          }}
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
            className={`absolute top-full mt-2 bg-hydro-white border border-hydro-green/20 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto ${dropdownClassName}`}
          >
            {error ? (
              <div className="p-6 text-center text-red-500">
                <p>Search error: {error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => performSearch(searchTerm.trim())}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : results.length > 0 ? (
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
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg"
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-hydro-green/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-hydro-onyx text-sm line-clamp-1">
                              {product.name}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-hydro-green font-semibold text-sm">
                                {product.price_html ? 
                                  formatPrice(product.price_html) : 
                                  product.price ? 
                                    `R ${product.price}` : 
                                    'Price unavailable'
                                }
                              </div>
                              {product.categories && product.categories.length > 0 && (
                                <span className="text-xs text-hydro-onyx/60 truncate ml-2">
                                  {product.categories[0].name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                <div className="text-center p-2 border-t border-hydro-green/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-hydro-green hover:text-hydro-green hover:bg-hydro-mint/20"
                    onClick={handleViewAllResults}
                  >
                    View all results for "{searchTerm}"
                  </Button>
                </div>
              </div>
            ) : searchTerm.trim().length >= 2 && !loading ? (
              <div className="p-6 text-center text-hydro-onyx/60">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-hydro-green/30" />
                <p>No products found for "{searchTerm}"</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-hydro-green hover:text-hydro-green hover:bg-hydro-mint/20"
                  onClick={handleViewAllResults}
                >
                  Search in store anyway
                </Button>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}