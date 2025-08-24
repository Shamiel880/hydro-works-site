"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SmartSearch } from "@/components/smart-search";
import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  slug?: string;
}

interface SidebarFiltersProps {
  categories: Category[];
  selectedCategory: string;
  priceRange: string;
  sortBy: string;
  searchTerm: string;
  updateURLParams: (params: Record<string, string | null>) => void;
}

export default function SidebarFilters({
  categories,
  selectedCategory,
  priceRange,
  sortBy,
  searchTerm,
  updateURLParams,
}: SidebarFiltersProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handlePriceChange = (val: string) => {
    let minPrice: string | null = null;
    let maxPrice: string | null = null;

    switch (val) {
      case "under-500": maxPrice = "500"; break;
      case "500-2000": minPrice = "500"; maxPrice = "2000"; break;
      case "2000-10000": minPrice = "2000"; maxPrice = "10000"; break;
      case "over-10000": minPrice = "10000"; break;
    }

    updateURLParams({ page: "1", minPrice, maxPrice });
  };

  if (!isMounted) {
    // Skeleton loader with consistent dimensions
    return (
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-2 max-h-64 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="pt-4 border-t border-gray-200">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed filters section */}
      <div className="space-y-4 flex-shrink-0">
        {/* Quick Search */}
        <div>
          <label className="block text-hydro-onyx font-semibold mb-2 text-sm">
            Quick Search
          </label>
          <SmartSearch
            updateURLParams={(val) => updateURLParams({ search: val, page: "1" })}
            dropdownClassName="left-0 right-0"
            className="border-hydro-green/20 focus-within:border-hydro-green"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-hydro-onyx font-semibold mb-1 text-sm">
            Sort by
          </label>
          <Select
            value={sortBy}
            onValueChange={(val) => updateURLParams({ sort: val, page: "1" })}
          >
            <SelectTrigger className="text-sm border-hydro-green/20 focus:border-hydro-green">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Newest First</SelectItem>
              <SelectItem value="title">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-hydro-onyx font-semibold mb-1 text-sm">
            Price Range
          </label>
          <Select value={priceRange} onValueChange={handlePriceChange}>
            <SelectTrigger className="text-sm border-hydro-green/20 focus:border-hydro-green">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-500">Under R500</SelectItem>
              <SelectItem value="500-2000">R500 – R2,000</SelectItem>
              <SelectItem value="2000-10000">R2,000 – R10,000</SelectItem>
              <SelectItem value="over-10000">Over R10,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories header */}
        <div className="pt-2">
          <label className="block text-hydro-onyx font-semibold mb-2 text-sm">
            Categories
          </label>
        </div>
      </div>

      {/* Scrollable categories section */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1">
        <div className="space-y-1 pb-4">
          <button
            onClick={() => updateURLParams({ category: null, page: "1" })}
            className={`block w-full text-left py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
              selectedCategory === "all"
                ? "text-hydro-green font-semibold bg-hydro-green/8 border border-hydro-green/20"
                : "text-hydro-onyx/80 hover:bg-hydro-green/5 hover:text-hydro-green border border-transparent"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateURLParams({ category: cat.slug || null, page: "1" })}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                selectedCategory === (cat.slug || "")
                  ? "text-hydro-green font-semibold bg-hydro-green/8 border border-hydro-green/20"
                  : "text-hydro-onyx/80 hover:bg-hydro-green/5 hover:text-hydro-green border border-transparent"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Fixed bottom section */}
      <div className="flex-shrink-0 pt-4 border-t border-hydro-green/10">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            updateURLParams({
              search: null,
              category: null,
              sort: null,
              minPrice: null,
              maxPrice: null,
              page: "1",
            })
          }
          className="w-full border-hydro-green/20 hover:bg-hydro-green hover:text-white transition-colors duration-200"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}