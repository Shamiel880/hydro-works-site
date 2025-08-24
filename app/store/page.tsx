"use client";

import Head from "next/head";
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Menu } from "lucide-react";

import ProductCard from "@/components/productcard";
import SidebarFilters from "@/components/sidebarfilters";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AnimatedHeader } from "@/components/animated-header";

interface ProductImage { src: string; alt?: string }
interface Category { id: number; name: string; slug: string }

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  images: ProductImage[];
  categories: Category[];
}

interface ProductsResponse {
  items: Product[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export default function StorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const searchTerm = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const sortBy = searchParams.get("sort") || "newest";
  const priceRange = searchParams.get("price") || "all";

  const updateURLParams = useCallback((params: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== "") current.set(key, value);
      else current.delete(key);
    });
    router.push(`/store?${current.toString()}`, { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Reset products when filters change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setInitialLoad(true);
    setError(null);
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  const fetchProducts = useCallback(async (pageToFetch: number, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: pageToFetch.toString(),
        per_page: "12",
        sort: sortBy,
        category: selectedCategory !== "all" ? selectedCategory : "",
        search: searchTerm,
        price: priceRange,
      });

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data: ProductsResponse = await res.json();

      if (isLoadMore) {
        // Append new products to existing ones
        setProducts(prev => [...prev, ...(data.items || [])]);
      } else {
        // Replace products (initial load or filter change)
        setProducts(data.items || []);
      }
      
      setHasMore(pageToFetch < data.pagination.totalPages);
      setPage(pageToFetch + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoad(false);
    }
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  // Initial load
  useEffect(() => {
    if (initialLoad) {
      fetchProducts(1, false);
    }
  }, [initialLoad, fetchProducts]);

  // Load more handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page, true);
    }
  };

  return (
    <>
      <Head>
        <title>Hydroponics Store | Hydro Works</title>
        <meta name="description" content="Browse our complete range of hydroponic systems, organic inputs, and growing solutions" />
      </Head>

      <div className="min-h-screen bg-hydro-white">
        {/* Sticky header */}
        <div className="sticky top-0 z-50">
          <AnimatedHeader />
        </div>

        {/* Page hero section */}
        <div className="pt-24 container py-8">
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
              Discover our complete range of hydroponic systems, organic inputs,
              and growing solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
            {/* Mobile Filters */}
            <div className="block lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="text-hydro-onyx/80 border-hydro-green/20">
                    <Menu className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-4 overflow-y-auto">
                  <SidebarFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    priceRange={priceRange}
                    sortBy={sortBy}
                    searchTerm={searchTerm}
                    updateURLParams={updateURLParams}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Filters */}
            <aside className="hidden lg:block sticky top-[6rem] self-start bg-white border border-hydro-green/20 rounded-xl shadow-sm">
              <div className="p-5 h-[calc(100vh-8rem)] overflow-hidden">
                <SidebarFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  priceRange={priceRange}
                  sortBy={sortBy}
                  searchTerm={searchTerm}
                  updateURLParams={updateURLParams}
                />
              </div>
            </aside>

            {/* Products Grid */}
            <div>
              {error ? (
                <div className="text-center py-20">
                  <p className="text-red-500 mb-4">Error: {error}</p>
                  <Button 
                    onClick={() => {
                      setError(null);
                      fetchProducts(1, false);
                    }}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              ) : initialLoad && loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-hydro-green" />
                  <span className="ml-2 text-hydro-onyx/70">Loading products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-hydro-onyx/70 text-lg mb-4">No products found</p>
                  <Button 
                    onClick={() => updateURLParams({
                      search: null,
                      category: null,
                      sort: null,
                      minPrice: null,
                      maxPrice: null,
                      page: "1",
                    })}
                    variant="outline"
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  {/* Products Grid */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
                    {products.map(product => (
                      <ProductCard
                        key={`${product.id}-${product.slug}`}
                        product={product}
                        allCategories={categories}
                      />
                    ))}
                  </div>

                  {/* Load More Section */}
                  <div className="flex flex-col items-center space-y-4 py-8">
                    {hasMore ? (
                      <>
                        <Button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          size="lg"
                          className="bg-hydro-green hover:bg-hydro-green/90 text-white px-8 py-3 rounded-full transition-all duration-200"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              Loading More...
                            </>
                          ) : (
                            "Load More Products"
                          )}
                        </Button>
                        <p className="text-sm text-hydro-onyx/60 text-center">
                          Showing {products.length} products
                        </p>
                      </>
                    ) : (
                      <div className="text-center space-y-2">
                        <p className="text-hydro-onyx/70">
                          You've reached the end! 🎉
                        </p>
                        <p className="text-sm text-hydro-onyx/60">
                          Showing all {products.length} products
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}