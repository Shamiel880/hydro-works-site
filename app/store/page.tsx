"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Menu } from "lucide-react";

import ProductCard from "@/components/productcard";
import SidebarFilters from "@/components/sidebarfilters";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AnimatedHeader } from "@/components/animated-header";

interface WooCommerceProduct {
  id: number;
  name: string;
  price: string;
  images: Array<{ src: string }>;
  slug: string;
}

interface WooCommerceCategory {
  id: number;
  name: string;
}

interface ProductsResponse {
  products: WooCommerceProduct[];
  error?: string;
}

export default function StorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [categories, setCategories] = useState<WooCommerceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const loadingRef = useRef(false);

  // Get current filter params
  const searchTerm = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const sortBy = searchParams.get("sort") || "date";
  const priceRange = searchParams.get("price") || "all";

  // Update URL params without page reload
  const updateURLParams = useCallback((params: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== "") current.set(key, value);
      else current.delete(key);
    });
    router.push(`/store?${current.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Reset products and page when filters change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setInitialLoad(true);
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  // Infinite scroll fetch function
  const fetchProducts = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "12",
        orderby: sortBy.includes("price") ? "price" : sortBy,
        order: sortBy === "price-high" ? "desc" : "asc",
      });

      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data: ProductsResponse = await response.json();
      const newProducts = data.products || [];

      // Filter by price range
      let filteredProducts = newProducts;
      if (priceRange !== "all") {
        filteredProducts = filteredProducts.filter((product) => {
          const price = parseFloat(product.price) || 0;
          switch (priceRange) {
            case "under-500": return price < 500;
            case "500-2000": return price >= 500 && price <= 2000;
            case "2000-10000": return price >= 2000 && price <= 10000;
            case "over-10000": return price > 10000;
            default: return true;
          }
        });
      }

      setProducts(prev => [...prev, ...filteredProducts]);
      setHasMore(newProducts.length > 0);
      setPage(prev => prev + 1);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setLoading(false);
      loadingRef.current = false;
      setInitialLoad(false);
    }
  }, [page, searchTerm, selectedCategory, sortBy, priceRange, hasMore]);

  // Initial load and filter changes
  useEffect(() => {
    if (initialLoad) {
      fetchProducts();
    }
  }, [initialLoad, fetchProducts]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById("sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [loading, hasMore, fetchProducts]);

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
              Discover our complete range of hydroponic systems, organic inputs,
              and growing solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Mobile filters */}
            <div className="block lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-hydro-onyx/80 border-hydro-green/20"
                  >
                    <Menu className="mr-2 h-4 w-4" />
                    Filters
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

            {/* Desktop filters */}
            <aside className="hidden lg:block sticky top-24 self-start bg-white border border-hydro-green/20 rounded-xl shadow p-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <SidebarFilters
                categories={categories}
                selectedCategory={selectedCategory}
                priceRange={priceRange}
                sortBy={sortBy}
                searchTerm={searchTerm}
                updateURLParams={updateURLParams}
              />
            </aside>

            {/* Main content */}
            <div>
              {initialLoad && loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-hydro-green" />
                  <span className="ml-2 text-hydro-onyx/70">
                    Loading products...
                  </span>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Unable to Load Products
                    </h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    {products.length > 0 ? (
                      <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
                          {products.map((product) => (
                            <ProductCard key={`${product.id}-${product.slug}`} product={product} />
                          ))}
                        </div>
                        
                        {/* Infinite scroll sentinel */}
                        <div id="sentinel" className="h-10 flex justify-center">
                          {loading && (
                            <Loader2 className="h-6 w-6 animate-spin text-hydro-green" />
                          )}
                          {!hasMore && products.length > 0 && (
                            <p className="text-hydro-onyx/70 text-sm">
                              No more products to load
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-20">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 max-w-md mx-auto">
                          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                            No Products Found
                          </h3>
                          <p className="text-yellow-600 mb-4">
                            Try adjusting your search or filter criteria
                          </p>
                          <Button
                            onClick={() => updateURLParams({
                              search: null,
                              category: null,
                              sort: null,
                              price: null,
                              page: "1",
                            })}
                            variant="outline"
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                          >
                            Clear Filters
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}