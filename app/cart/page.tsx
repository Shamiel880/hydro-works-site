"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cartContext";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  const getProductImage = (product: any) => {
    if (product.images?.length > 0) return product.images[0].src;
    if (product.parent_data?.images?.length > 0)
      return product.parent_data.images[0].src;
    return "/placeholder.png";
  };

  const getProductTitle = (product: any) => {
    return product.displayName || product.parent_data?.name || product.name;
  };

  const getVariationAttributes = (product: any) => {
    if (!product.attributes) return null;

    if (Array.isArray(product.attributes)) {
      return product.attributes
        .map((attr) => attr?.option)
        .filter(Boolean)
        .join(", ");
    }

    if (typeof product.attributes === "object" && product.attributes !== null) {
      return Object.values(product.attributes)
        .filter((val) => val !== null && val !== undefined)
        .join(", ");
    }

    return null;
  };

  const handleQuantityChange = (productId: number, qty: number) => {
    if (qty < 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }
    updateQuantity(productId, qty);
  };

  return (
    <div className="min-h-screen bg-[rgba(201,255,191,0.25)] pt-20">
      <div className="container mx-auto py-12 px-4">
        <Button
          variant="ghost"
          asChild
          className="text-hydro-onyx hover:text-hydro-green mb-6"
        >
          <Link href="/store" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </Button>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-hydro-onyx mb-8">Your Cart</h1>

          {cart.length === 0 ? (
            <div className="text-center py-20 text-hydro-onyx/70">
              <ShoppingCart className="mx-auto mb-4 w-12 h-12 text-hydro-green/50" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="mb-6">
                Explore our smart horticultural products to add to your cart.
              </p>
              <Button
                asChild
                className="bg-hydro-green hover:bg-hydro-green/90 text-white px-6 py-2 rounded"
              >
                <Link href="/store">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <Card className="border border-hydro-green/30 rounded-2xl min-h-[500px] flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex-1 space-y-6 overflow-y-auto pb-8">
                  {cart.map(({ product, quantity }) => {
                    const variationAttributes =
                      product.type === "variation"
                        ? getVariationAttributes(product)
                        : null;

                    return (
                      <div key={product.id} className="flex items-center gap-4">
                        <Image
                          src={getProductImage(product)}
                          alt={getProductTitle(product)}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <Link
                            href={`/product/${
                              product.slug || product.parent_data?.slug || ""
                            }`}
                            className="text-lg font-semibold text-hydro-onyx hover:text-hydro-green"
                          >
                            {getProductTitle(product)}
                          </Link>

                          {variationAttributes && (
                            <p className="text-sm text-hydro-onyx/60 mt-1">
                              {variationAttributes}
                            </p>
                          )}

                          <div className="text-hydro-green font-bold mt-1">
                            R {Number(product.price).toFixed(2)}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <label
                              htmlFor={`qty-${product.id}`}
                              className="text-sm text-hydro-onyx/70"
                            >
                              Qty:
                            </label>
                            <input
                              id={`qty-${product.id}`}
                              type="number"
                              min={1}
                              value={quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  product.id,
                                  Number(e.target.value)
                                )
                              }
                              className="w-16 border border-hydro-green/40 rounded px-2 py-1"
                            />
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            removeFromCart(product.id);
                            toast.success(
                              `${getProductTitle(product)} removed from cart`
                            );
                          }}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-8 border-t border-hydro-green/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-hydro-onyx text-lg font-semibold">
                      Subtotal
                    </span>
                    <span className="text-hydro-green text-xl font-bold">
                      R{totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-sm text-hydro-onyx/70 text-center italic">
                    Shipping fee will be calculated at checkout
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-hydro-green text-white hover:bg-hydro-green/90"
                    onClick={() => router.push("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
