"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Loader2,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react"
import Link from "next/link"
import ProductCard from "@/components/productcard"
import type { WooCommerceProduct, WooCommerceCategory, ProductsResponse } from "@/types/woocommerce"
import { AnimatedHeader } from "@/components/animated-header"

function decodeHTMLEntities(text: string): string {
  if (typeof window === "undefined") return text
  const textarea = document.createElement("textarea")
  textarea.innerHTML = text
  return textarea.value
}

export default function StorePage() {
  const [products, setProducts] = useState<WooCommerceProduct[]>([])
  const [categories, setCategories] = useState<WooCommerceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [sortBy, setSortBy] = useState("date")
  const [priceRange, setPriceRange] = useState("all")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const searchParam = urlParams.get("search")
    if (searchParam) setSearchTerm(searchParam)
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        if (response.ok) setCategories(data.categories)
        else console.error("Failed to fetch categories:", data.error)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          per_page: "24",
          orderby: sortBy === "price-low" ? "price" : sortBy === "price-high" ? "price" : sortBy,
          order: sortBy === "price-high" ? "desc" : "asc",
        })

        if (selectedCategory && selectedCategory !== "all") {
          params.append("category", selectedCategory)
        }

        if (searchTerm) {
          params.append("search", searchTerm)
        }

        const response = await fetch(`/api/products?${params}`)
        const data: ProductsResponse = await response.json()

        if (response.ok) {
          let filteredProducts = data.products

          if (priceRange !== "all") {
            filteredProducts = filteredProducts.filter((product) => {
              const price = Number.parseFloat(product.price) || 0
              switch (priceRange) {
                case "under-500":
                  return price < 500
                case "500-2000":
                  return price >= 500 && price <= 2000
                case "2000-10000":
                  return price >= 2000 && price <= 10000
                case "over-10000":
                  return price > 10000
                default:
                  return true
              }
            })
          }

          setProducts(filteredProducts)
          setTotalPages(data.pagination.total_pages)
          setTotalProducts(data.pagination.total_products)
        } else {
          setError(data.error || "Failed to fetch products")
        }
      } catch (error) {
        setError("Network error: Unable to fetch products")
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, selectedCategory, searchTerm, sortBy, priceRange])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-hydro-white">
      <AnimatedHeader />
      <div className="pt-24">
        <div className="container py-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-hydro-onyx mb-4">
              <span className="bg-gradient-to-r from-hydro-green to-hydro-onyx bg-clip-text text-transparent">
                Hydro Works
              </span>{" "}
              Store
            </h1>
            <p className="text-lg text-hydro-onyx/70 max-w-2xl mx-auto">
              Discover our complete range of hydroponic systems, organic inputs, and growing solutions
            </p>
          </motion.div>

          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-hydro-green/20">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hydro-onyx/50 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-hydro-green/20 focus:border-hydro-green"
                    />
                  </div>
                  <Button type="submit" className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white">
                    Search
                  </Button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="text-hydro-onyx/50 h-4 w-4" />
                    <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setCurrentPage(1) }}>
                      <SelectTrigger className="border-hydro-green/20 focus:border-hydro-green">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name} ({cat.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="text-hydro-onyx/50 h-4 w-4" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="border-hydro-green/20 focus:border-hydro-green">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Newest First</SelectItem>
                        <SelectItem value="title">Name A-Z</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="popularity">Most Popular</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="text-hydro-onyx/50 h-4 w-4" />
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger className="border-hydro-green/20 focus:border-hydro-green">
                        <SelectValue placeholder="Price Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="under-500">Under R500</SelectItem>
                        <SelectItem value="500-2000">R500 - R2,000</SelectItem>
                        <SelectItem value="2000-10000">R2,000 - R10,000</SelectItem>
                        <SelectItem value="over-10000">Over R10,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCategory("all")
                        setSortBy("date")
                        setPriceRange("all")
                        setCurrentPage(1)
                      }}
                      className="border-hydro-green/20 text-hydro-onyx hover:bg-hydro-green hover:text-hydro-white"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Product Grid */}
          {!loading && !error && products.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-hydro-green" />
              <span className="ml-2 text-hydro-onyx/70">Loading products...</span>
            </div>
          )}

          {error && (
            <motion.div className="text-center py-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Products</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}

          {!loading && !error && products.length === 0 && (
            <motion.div className="text-center py-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-hydro-mint/20 border border-hydro-green/20 rounded-2xl p-8 max-w-md mx-auto">
                <ShoppingCart className="h-12 w-12 text-hydro-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-hydro-onyx mb-2">No Products Found</h3>
                <p className="text-hydro-onyx/70 mb-4">Try adjusting your search or filter criteria</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSortBy("date")
                    setPriceRange("all")
                    setCurrentPage(1)
                  }}
                  className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white"
                >
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <motion.div
              className="flex justify-center items-center gap-2 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-hydro-green/20 text-hydro-onyx hover:bg-hydro-green hover:text-hydro-white"
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-hydro-green hover:bg-hydro-green/90 text-hydro-white"
                          : "border-hydro-green/20 text-hydro-onyx hover:bg-hydro-green hover:text-hydro-white"
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-hydro-green/20 text-hydro-onyx hover:bg-hydro-green hover:text-hydro-white"
              >
                Next
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
