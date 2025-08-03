"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, ArrowLeft, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type {
  WooCommerceProduct,
  WooCommerceVariation,
} from "@/types/woocommerce";
import { AnimatedHeader } from "@/components/animated-header";
import { useCart } from "@/lib/cartContext";
import { toast } from "react-hot-toast";

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
  const [selectedVariation, setSelectedVariation] =
    useState<WooCommerceVariation | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [mainImage, setMainImage] = useState(
    product.images?.[0]?.src || "/placeholder.svg"
  );
  const [cleanPriceHtml, setCleanPriceHtml] = useState("");

  useEffect(() => {
    if (!isVariable || !product.variation_data) return;

    const match = product.variation_data.find((variation) => {
      return variation.attributes.every(({ name, option }) => {
        return selectedAttributes[name] === option;
      });
    });

    setSelectedVariation(match || null);
  }, [selectedAttributes, product, isVariable]);

  useEffect(() => {
    function decode(text: string) {
      const el =
        typeof window !== "undefined"
          ? document.createElement("textarea")
          : null;
      if (!el) return text;
      el.innerHTML = text;
      return el.value;
    }

    function extractPrices(html: string): string {
      const plain = decode(html.replace(/<[^>]+>/g, " ")).trim();
      const prices = plain.match(/R[\d,.]+/g);

      if (prices) {
        const uniquePrices = [
          ...new Set(prices.map((p) => p.replace(/R/, "").trim())),
        ];
        const [first, second] = uniquePrices.map((p) => `R${p}`);
        if (uniquePrices.length > 1) return `${first} → ${second}`;
        return first;
      }

      return decode(plain);
    }

    if (isVariable) {
      if (selectedVariation) {
        setCleanPriceHtml(`R${selectedVariation.price}`);
      } else if (product.variation_data?.length) {
        const prices = product.variation_data
          .map((v) => parseFloat(v.price))
          .filter((p) => !isNaN(p));
        if (prices.length) {
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setCleanPriceHtml(min === max ? `R${min}` : `R${min} – R${max}`);
        }
      }
    } else {
      setCleanPriceHtml(extractPrices(product.price_html || ""));
    }
  }, [selectedVariation, product, isVariable]);

  const handleAttributeChange = (name: string, option: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [name]: option }));
  };

  const isInStock = () => {
    if (!product.purchasable) return false;

    if (isVariable) {
      return selectedVariation?.stock_status === "instock";
    }

    return product.stock_status === "instock";
  };

  return (
    <div className="min-h-screen bg-hydro-white">
      <AnimatedHeader />

      <div className="pt-24">
        <div className="container py-8">
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
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl bg-white aspect-square flex items-center justify-center">
                <Image
                  src={mainImage}
                  alt={product.name}
                  width={700}
                  height={700}
                  className="w-full h-full object-contain rounded-2xl"
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

            <Card className="border-hydro-green/10 rounded-2xl shadow-sm bg-hydro-mint/25">
              <CardContent className="p-6 space-y-6">
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

                <h1 className="text-3xl lg:text-4xl font-bold text-hydro-onyx">
                  {product.name}
                </h1>

                {product.average_rating &&
                  Number.parseFloat(product.average_rating) > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i <
                              Math.floor(
                                Number.parseFloat(product.average_rating)
                              )
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-hydro-onyx/70">
                        {product.average_rating} ({product.rating_count}{" "}
                        reviews)
                      </span>
                    </div>
                  )}

                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-hydro-green">
                    {cleanPriceHtml}
                  </div>
                  {product.on_sale && !isVariable && (
                    <Badge className="bg-red-500 text-white">Sale</Badge>
                  )}
                </div>

                {isVariable &&
                  product.attributes?.map((attr) => (
                    <div key={attr.id}>
                      <label className="block font-semibold mb-1 text-hydro-onyx">
                        {attr.name}
                      </label>
                      <select
                        className="border border-hydro-green/20 rounded-xl p-3 w-full text-hydro-onyx focus:outline-none focus:ring-2 focus:ring-hydro-green/30"
                        value={selectedAttributes[attr.name] || ""}
                        onChange={(e) =>
                          handleAttributeChange(attr.name, e.target.value)
                        }
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

                {product.short_description && (
                  <div
                    className="text-base text-hydro-onyx/80 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: product.short_description,
                    }}
                  />
                )}

                <div className="space-y-4">
                  {product.purchasable &&
                  product.stock_status === "instock" &&
                  (!isVariable || selectedVariation) ? (
                    <Button
                      size="lg"
                      className="w-full bg-hydro-green text-white hover:bg-hydro-green/90"
                      onClick={() => {
                        addToCart(selectedVariation || product, 1);
                      }}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <Button size="lg" disabled className="w-full">
                      Out of Stock
                    </Button>
                  )}
                </div>

                {product.attributes?.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-semibold text-hydro-onyx mb-2">
                      Product Features
                    </h3>
                    <div className="space-y-2 text-sm">
                      {product.attributes.map((attribute, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-hydro-onyx/70">
                            {attribute.name}:
                          </span>
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

          {product.description && (
            <div className="mt-16">
              <Card className="border-hydro-green/10 rounded-2xl shadow-sm bg-hydro-mint/25">
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
