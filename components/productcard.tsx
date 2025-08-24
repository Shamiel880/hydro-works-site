"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import type { WooCommerceProduct, WooCommerceCategory } from "@/types/woocommerce";
import { useCart } from "@/lib/cartContext";

interface ProductCardProps {
  product: WooCommerceProduct;
  index: number;
  allCategories: WooCommerceCategory[]; // full category list
}

export default function ProductCard({ product, index, allCategories }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.src ?? "/placeholder.png";
  const inStock = product.stock_status === "instock";
  const isPurchasable = product.type === "simple" && product.purchasable && inStock;

  const { addToCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const productUrl = `/product/${product.slug}`;

  useEffect(() => {
    router.prefetch(productUrl);
  }, [router, productUrl]);

  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push(productUrl);
  };

  // --- Compute first parent category only ---
const mainCategory = (() => {
  for (const cat of product.categories || []) {
    const parent = cat.parentId ? allCategories.find(c => c.id === cat.parentId) : cat;
    if (parent) return parent;
  }
  return null;
})();

  return (
    <motion.div
      className="w-full h-full relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <a href={productUrl} onClick={handleNavigation} className="group block h-full">
        <Card className="rounded-2xl overflow-hidden shadow-sm hover:bg-white relative h-full border-0">
          {/* Image Section */}
          <div className="aspect-square bg-white relative overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />

            {product.on_sale && (
              <Badge className="absolute top-3 left-3 bg-red-500 text-white hover:bg-red-600">
                Sale
              </Badge>
            )}

            {/* Main parent category badge */}
            {mainCategory && (
              <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                <Badge className="bg-hydro-mint/70 text-hydro-green">
                  {mainCategory.name}
                </Badge>
              </div>
            )}

            {/* Stock Badge */}
            <Badge
              className={`absolute bottom-3 left-3 ${
                inStock ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>

          {/* Product Info */}
          <CardContent className="p-3 text-center rounded-t-none rounded-2xl bg-gradient-to-t from-hydro-mint/50 to-white shadow-md">
            <div className="min-h-[3rem] mb-1">
              <h3 className="text-sm font-medium text-onyx line-clamp-2">{product.name}</h3>
            </div>
            <p className="text-xs text-hydro-onyx/70 mb-1">From</p>
            <p className="text-palatanite_blue font-semibold text-base">
              R {product.price.toLocaleString()}
            </p>
          </CardContent>

          {/* Add-to-Cart Hover Button */}
          {isPurchasable && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white text-black border border-gray-200 hover:bg-gray-100 shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(product, 1);
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
              <div className="w-6 h-6 border-2 border-hydro-green border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </Card>
      </a>
    </motion.div>
  );
}
