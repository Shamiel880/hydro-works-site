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
import { useEffect, useState, useRef } from "react";

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
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Fixed top section */}
      <div className="space-y-6 pb-6">
        {/* Smart Search */}
        <div>
          <label className="block text-hydro-onyx font-semibold mb-2">
            Quick Search
          </label>
          <SmartSearch 
            updateURLParams={updateURLParams}
            dropdownClassName="left-0 right-0"
            className="border-hydro-green/20 focus-within:border-hydro-green"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-hydro-onyx font-semibold mb-1">
            Sort by
          </label>
          <Select
            value={sortBy}
            onValueChange={(val) => updateURLParams({ sort: val })}
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

        {/* Price Range */}
        <div>
          <label className="block text-hydro-onyx font-semibold mb-1">
            Price Range
          </label>
          <Select
            value={priceRange}
            onValueChange={(val) => updateURLParams({ price: val, page: "1" })}
          >
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
      </div>

      {/* Scrollable categories section */}
      <div 
        ref={categoriesRef}
        className="flex-1 overflow-y-auto pb-4"
        style={{
          maxHeight: 'calc(100vh - 400px)', // Adjust based on your header height
        }}
      >
        <div>
          <label className="block text-hydro-onyx font-semibold mb-1">
            Categories
          </label>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateURLParams({ category: "all", page: "1" })}
                className={`block w-full text-left ${
                  selectedCategory === "all"
                    ? "text-hydro-green font-semibold"
                    : "text-hydro-onyx/80"
                } hover:text-hydro-green`}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() =>
                    updateURLParams({ category: cat.id.toString(), page: "1" })
                  }
                  className={`block w-full text-left ${
                    selectedCategory === cat.id.toString()
                      ? "text-hydro-green font-semibold"
                      : "text-hydro-onyx/80"
                  } hover:text-hydro-green`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Fixed bottom section */}
      <div className="pt-4 border-t border-hydro-green/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            updateURLParams({
              search: null,
              category: null,
              sort: null,
              price: null,
              page: "1",
            })
          }
          className="w-full border-hydro-green/20 hover:bg-hydro-green hover:text-white"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}