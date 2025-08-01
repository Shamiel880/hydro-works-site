"use client"

import { useState, useEffect, useRef } from "react"
import { ShoppingCart, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { WooCommerceProduct } from "@/types/woocommerce"
import ProductCard from "@/components/productcard"

interface ProductGridProps {
  category: string
  categoryId?: string
  maxProducts?: number
}

export function ProductGrid({
  category,
  categoryId,
  maxProducts = 4,
}: ProductGridProps) {
  const [products, setProducts] = useState<WooCommerceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    // Cancel previous request if needed
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
      const params = new URLSearchParams({
        per_page: maxProducts.toString(),
        page: "1", // Ensures pagination works properly
      })

      if (category === "Featured Products") {
        params.append("featured", "true")
      }

      if (categoryId && categoryId !== "all") {
        params.append("category", categoryId)
      }

      // Debug log (optional in dev)
      if (process.env.NODE_ENV === "development") {
        console.log("Homepage fetch URL:", `/api/products?${params.toString()}`)
      }

      const response = await fetch(`/api/products?${params}`, {
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || "Failed to fetch products")
      }
    } catch (err) {
      let message = "Network error"
      if (err instanceof Error) {
        message = err.name === "AbortError" ? "Request timed out" : err.message
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    return () => abortControllerRef.current?.abort()
  }, [categoryId, maxProducts, retryCount])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12" role="status" aria-busy="true">
        <Loader2 className="h-8 w-8 animate-spin text-hydro-green" />
        <span className="ml-2 text-hydro-onyx/70">Loading {category.toLowerCase()}...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12" role="alert">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Connection Issue</h3>
          <p className="text-yellow-700 mb-4 text-sm">{error}</p>
          <Button
            onClick={() => setRetryCount(c => c + 1)}
            variant="outline"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="text-center py-12" role="alert">
        <div className="bg-hydro-mint/20 border border-hydro-green/20 rounded-2xl p-6 max-w-md mx-auto">
          <ShoppingCart className="h-12 w-12 text-hydro-green/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-hydro-onyx mb-2">No Products Available</h3>
          <p className="text-hydro-onyx/70">Check back soon for new {category.toLowerCase()}!</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4 py-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      <div className="text-center mt-8">
        <Button size="lg" className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white" asChild>
          <Link href="/store">
            View All {category} Products
            <ShoppingCart className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </>
  )
}
