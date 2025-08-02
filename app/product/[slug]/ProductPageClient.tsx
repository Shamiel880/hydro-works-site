// app/product/[slug]/page.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, ArrowLeft, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { WooCommerceProduct, WooCommerceVariation } from "@/types/woocommerce";
import { AnimatedHeader } from "@/components/animated-header";
import { useCart } from "@/lib/cartContext";
import { toast } from "react-hot-toast"

interface Props {
  product: WooCommerceProduct;
}

function decodeHTMLEntities(text: string): string {
  if (typeof window === "undefined") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export default function ProductPageClient({ product }: Props) {
  const { addToCart } = useCart();
  const isVariable = product.type === "variable";
  const [selectedVariation, setSelectedVariation] = useState<WooCommerceVariation | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [mainImage, setMainImage] = useState(product.images?.[0]?.src || "/placeholder.svg");
  const [cleanPriceHtml, setCleanPriceHtml] = useState("");

  useEffect(() => {
    if (!isVariable || !product.variation_data) return;
    const match = product.variation_data.find((variation) =>
      variation.attributes.every(
        (attr) => selectedAttributes[attr.name] === attr.option
      )
    );
    setSelectedVariation(match || null);
  }, [selectedAttributes, product, isVariable]);

  useEffect(() => {
    if (!selectedVariation) {
      const plainText = product.price_html.replace(/<[^>]*>/g, "");
      setCleanPriceHtml(decodeHTMLEntities(plainText));
    }
  }, [selectedVariation, product.price_html]);

  const handleAttributeChange = (name: string, option: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [name]: option }));
  };

  return (
    <div className="min-h-screen bg-hydro-white">
      <AnimatedHeader />

      <div className="pt-24">
        <div className="container py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              asChild
              className="text-hydro-onyx hover:text-hydro-green"
            >
              <Link href="/store">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Link>
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl bg-hydro-mint/20">
                <Image
                  src={mainImage}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-auto object-cover rounded-2xl"
                  priority
                />
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 5).map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition"
                      onClick={() => setMainImage(img.src)}
                    >
                      <Image
                        src={img.src || "/placeholder.svg"}
                        alt={img.alt || `${product.name} ${i}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <Card className="border-hydro-green/10 rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                {/* Badge + Icons */}
                <div className="flex items-center justify-between">
                  {product.categories?.[0] && (
                    <Badge className="bg-hydro-mint/50 text-hydro-green">
                      {product.categories[0].name}
                    </Badge>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-hydro-onyx hover:text-hydro-green"
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-hydro-onyx hover:text-hydro-green"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-hydro-onyx">
                  {product.name}
                </h1>

                {/* Rating */}
                {product.average_rating &&
                  Number.parseFloat(product.average_rating) > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i <
                              Math.floor(Number.parseFloat(product.average_rating))
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-hydro-onyx/70">
                        {product.average_rating} ({product.rating_count} reviews)
                      </span>
                    </div>
                  )}

                {/* Price */}
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-hydro-green">
                    {selectedVariation
                      ? `R${selectedVariation.price}`
                      : cleanPriceHtml}
                  </div>
                  {product.on_sale && (
                    <Badge className="bg-red-500 text-white">Sale</Badge>
                  )}
                </div>

                {/* Variable Product Options */}
                {isVariable &&
                  product.attributes?.map((attr) => (
                    <div key={attr.id}>
                      <label className="block font-semibold mb-1 text-hydro-onyx">
                        {attr.name}
                      </label>
                      <select
                        className="border border-hydro-green/20 rounded-xl p-3 w-full text-hydro-onyx focus:outline-none focus:ring-2 focus:ring-hydro-green/30"
                        value={selectedAttributes[attr.name] || ""}
                        onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                      >
                        <option value="">Select {attr.name}</option>
                        {attr.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                {/* Description */}
                {product.short_description && (
                  <div
                    className="text-base text-hydro-onyx/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.short_description }}
                  />
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  {product.purchasable &&
                  product.stock_status === "instock" &&
                  (!isVariable || selectedVariation) ? (
                    <div className="flex gap-4">
                      <Button
                        size="lg"
                        className="flex-1 bg-hydro-green text-white"
                        onClick={() => {
                          addToCart(
                            selectedVariation || product,
                            1
                          );
                          toast.success("Product added to cart")
                        }}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </Button>

                      <Button
                        size="lg"
                        variant="outline"
                        className="border-hydro-green text-hydro-green hover:bg-hydro-green hover:text-white"
                      >
                        Buy Now
                      </Button>
                    </div>
                  ) : (
                    <Button size="lg" disabled className="flex-1">
                      Out of Stock
                    </Button>
                  )}
                </div>

                {/* Features */}
                {product.attributes?.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-semibold text-hydro-onyx mb-2">
                      Product Features
                    </h3>
                    <div className="space-y-2 text-sm">
                      {product.attributes.map((attribute, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-hydro-onyx/70">{attribute.name}:</span>
                          <span className="text-hydro-onyx font-medium">
                            {attribute.options.join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Long Description */}
          {product.description && (
            <div className="mt-16">
              <Card className="border-hydro-green/10 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-hydro-onyx mb-6">
                    Product Description
                  </h2>
                  <div
                    className="prose prose-lg max-w-none text-hydro-onyx/80"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
