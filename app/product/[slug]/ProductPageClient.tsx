"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Star,
  Heart,
  Share2,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
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
  /** Optional: if provided, we render these; otherwise we try fetch */
  relatedProducts?: WooCommerceProduct[];
}

/** --- Utilities --- */
function formatZAR(value: string | number | null | undefined) {
  if (value == null) return "";
  const num = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return `R ${new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)}`;
}

function extractPricesFromHtml(priceHtml?: string) {
  if (!priceHtml) return "";
  const tmp = typeof document !== "undefined" ? document.createElement("div") : null;
  const plain = tmp ? ((tmp.innerHTML = priceHtml), tmp.textContent || "") : priceHtml;
  const matches = plain.match(/R\s?[\d.,]+/g);
  if (!matches) return plain.trim();
  const unique = Array.from(new Set(matches.map((m) => m.replace(/[^0-9.,]/g, ""))));
  if (unique.length === 1) return `R ${unique[0]}`;
  // Range
  return `R ${unique[0]} – R ${unique[unique.length - 1]}`;
}

export default function ProductPageClient({ product, relatedProducts }: Props) {
  const { addToCart } = useCart();
  const isVariable = product.type === "variable";

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [mainImage, setMainImage] = useState(product.images?.[0]?.src || "/placeholder.svg");
  const [imageLoading, setImageLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const currentCategory = product.categories?.[0]?.name;
  const currentCategoryId = product.categories?.[0]?.id;
  const currentCategoryLink = currentCategoryId ? `/store?category=${currentCategoryId}` : "/store";

  /** Compute selected variation efficiently */
  const selectedVariation: WooCommerceVariation | null = useMemo(() => {
    if (!isVariable || !product.variation_data) return null;
    return (
      product.variation_data.find((variation) =>
        variation.attributes.every(({ name, option }) => selectedAttributes[name] === option)
      ) || null
    );
  }, [isVariable, product.variation_data, selectedAttributes]);

  /** Compute display price safely (handles string prices + ranges) */
  const displayPrice = useMemo(() => {
    if (isVariable) {
      if (selectedVariation?.price) return formatZAR(selectedVariation.price);
      const prices = (product.variation_data || [])
        .map((v) => parseFloat(v.price))
        .filter((n) => !Number.isNaN(n));
      if (prices.length) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max ? formatZAR(min) : `${formatZAR(min)} – ${formatZAR(max)}`;
      }
      // Fallback to product.price_html if present
      return extractPricesFromHtml(product.price_html);
    }
    // Simple product
    if (product.price) return formatZAR(product.price);
    return extractPricesFromHtml(product.price_html);
  }, [isVariable, selectedVariation, product.variation_data, product.price, product.price_html]);

  const handleAttributeChange = (name: string, option: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [name]: option }));
  };

  // Internally respect purchasable/stock status but don't show counts
  const isPurchasable = useMemo(() => {
    if (!product.purchasable) return false;
    if (isVariable) {
      if (!selectedVariation) return false;
      return selectedVariation.stock_status === "instock";
    }
    return product.stock_status === "instock";
  }, [product.purchasable, product.stock_status, isVariable, selectedVariation]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(selectedVariation || product, quantity);
      // toast handled in context (success). Only handle error here.
    } catch {
      toast.error("Failed to add to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQty = () => setQuantity((q) => Math.min(q + 1, 99));
  const decrementQty = () => setQuantity((q) => Math.max(q - 1, 1));

  /** Related products: prefer prop, else try fetch */
  const [related, setRelated] = useState<WooCommerceProduct[]>(relatedProducts || []);
  useEffect(() => {
    if (relatedProducts?.length) return;
    const fetchRelated = async () => {
      try {
        const params = new URLSearchParams();
        params.set("productId", String(product.id));
        if (currentCategoryId) params.set("categoryId", String(currentCategoryId));
        const res = await fetch(`/api/related-products?${params.toString()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setRelated(Array.isArray(data?.products) ? data.products : []);
        }
      } catch {
        // swallow; show no related items
      }
    };
    fetchRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, currentCategoryId]);

  // Basic Product JSON-LD (SEO)
  const productSchema = useMemo(() => {
    const images = (product.images || []).map((i) => i.src).filter(Boolean);
    const priceNum =
      (selectedVariation?.price && parseFloat(String(selectedVariation.price))) ||
      (product.price && parseFloat(String(product.price))) ||
      undefined;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: images,
      description: product.short_description || product.description || "",
      sku: product.sku,
      brand: { "@type": "Brand", name: "Hydro Works" },
      offers: priceNum
        ? {
            "@type": "Offer",
            priceCurrency: "ZAR",
            price: priceNum,
            availability: isPurchasable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: typeof window !== "undefined" ? window.location.href : "",
          }
        : undefined,
    };
  }, [product, selectedVariation, isPurchasable]);

  return (
    <div className="min-h-screen bg-hydro-white">
      <AnimatedHeader />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <div className="pt-24">
        <div className="container py-8">
          {/* Breadcrumbs */}
          <div className="mb-8 flex items-center gap-2 text-sm text-hydro-onyx/60 flex-wrap">
            <Link href="/" className="hover:text-hydro-green transition">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/store" className="hover:text-hydro-green transition">
              Store
            </Link>
            {currentCategory && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link href={currentCategoryLink} className="hover:text-hydro-green transition">
                  {currentCategory}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-hydro-onyx font-medium truncate">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image(s) */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-white aspect-square flex items-center justify-center">
                {/* Skeleton while the main image (or a changed image) loads */}
                {imageLoading && <div className="absolute inset-0 animate-pulse bg-gray-100" />}
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className={`object-contain p-2 rounded-2xl transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                  priority
                  onLoadingComplete={() => setImageLoading(false)}
                />
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 8).map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      className="aspect-square overflow-hidden rounded-lg hover:opacity-80 transition relative"
                      onClick={() => {
                        setImageLoading(true);
                        setMainImage(img.src || "/placeholder.svg");
                      }}
                    >
                      <Image
                        src={img.src || "/placeholder.svg"}
                        alt={img.alt || `${product.name} ${i + 1}`}
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <Card className="border-hydro-green/10 rounded-2xl shadow-sm bg-hydro-mint/25">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  {product.categories?.[0] && (
                    <Badge className="bg-hydro-mint/50 text-hydro-green">{product.categories[0].name}</Badge>
                  )}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-hydro-onyx hover:text-hydro-green" aria-label="Save">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-hydro-onyx hover:text-hydro-green" aria-label="Share">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-hydro-onyx">{product.name}</h1>

                {product.average_rating && Number(product.average_rating) > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(Number(product.average_rating)) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-hydro-onyx/70">
                      {product.average_rating} ({product.rating_count} reviews)
                    </span>
                  </div>
                )}

                <div className="text-3xl font-bold text-hydro-green">{displayPrice}</div>

                {isVariable &&
                  product.attributes?.map((attr) => (
                    <div key={attr.id}>
                      <label className="block font-semibold mb-1 text-hydro-onyx">{attr.name}</label>
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

                {product.short_description && (
                  <div
                    className="text-base text-hydro-onyx/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.short_description }}
                  />
                )}

                {/* Quantity and Add to Cart */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-hydro-onyx">Qty:</span>
                    <div className="flex items-center rounded-lg overflow-hidden border border-hydro-green/30">
                      <button type="button" onClick={decrementQty} className="p-2 hover:bg-hydro-green/10" aria-label="Decrease quantity">
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        min={1}
                        max={99}
                        onChange={(e) => {
                          const v = Math.max(1, Math.min(99, Number(e.target.value) || 1));
                          setQuantity(v);
                        }}
                        className="w-12 text-center bg-transparent text-hydro-onyx outline-none"
                      />
                      <button type="button" onClick={incrementQty} className="p-2 hover:bg-hydro-green/10" aria-label="Increase quantity">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    disabled={!isPurchasable || isAdding}
                    className="w-full bg-hydro-green text-white hover:bg-hydro-green/90"
                    onClick={handleAddToCart}
                  >
                    {isAdding ? (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-hydro-onyx/60">
                    Stock is confirmed with suppliers after order (typically within 1–2 working hours).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Product Description */}
          {product.description && (
            <div className="mt-12 prose prose-hydro max-w-none">
              <h2 className="text-2xl font-semibold text-hydro-onyx mb-4">Product Description</h2>
              <div className="text-hydro-onyx/90" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-hydro-onyx mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {related.map((rp) => {
                  const img = rp.images?.[0]?.src || "/placeholder.svg";
                  const priceText =
                    rp.type === "variable"
                      ? extractPricesFromHtml(rp.price_html)
                      : rp.price
                      ? formatZAR(rp.price)
                      : extractPricesFromHtml(rp.price_html);

                  return (
                    <Card key={rp.id} className="rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
                      <Link href={`/product/${rp.slug}`} className="block">
                        <div className="relative w-full aspect-square">
                          <Image src={img} alt={rp.name} fill className="object-contain p-2 bg-white" loading="lazy" />
                        </div>
                      </Link>
                      <CardContent className="p-4">
                        <Link href={`/product/${rp.slug}`}>
                          <h3 className="font-semibold text-lg line-clamp-2">{rp.name}</h3>
                        </Link>
                        <p className="text-hydro-green font-medium mt-1">{priceText}</p>
                        <div className="mt-3">
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => addToCart(rp, 1)}
                          >
                            Quick Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
