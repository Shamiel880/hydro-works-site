"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, X, Package, Trash2, Plus, Minus, Shield, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cartContext";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  const getProductImage = (product: any) => {
    // Check for product images first
    if (product.images?.length > 0) {
      return product.images[0].src;
    }
    
    // Check parent data images
    if (product.parent_data?.images?.length > 0) {
      return product.parent_data.images[0].src;
    }
    
    return null;
  };

  const getProductTitle = (product: any) => {
    if (product.displayName && product.displayName !== "undefined" && product.displayName.trim() !== "") {
      return product.displayName;
    }
  
    if (product.name && product.name !== "undefined" && product.name.trim() !== "") {
      return product.name;
    }
  
    return "Unnamed Product";
  };

  const getStockStatus = (product: any) => {
    if (product.stock_status === 'instock') return { status: 'In Stock', color: 'text-green-600 bg-green-50' };
    if (product.stock_status === 'onbackorder') return { status: 'Available on Order', color: 'text-orange-600 bg-orange-50' };
    return { status: 'Stock to Confirm', color: 'text-blue-600 bg-blue-50' };
  };

  const getEstimatedLeadTime = (product: any) => {
    if (product.stock_status === 'instock') return '2-3 days';
    if (product.stock_status === 'onbackorder') return '5-7 days';
    return '3-7 days';
  };
  
  const getProductPrice = (product: any) => {
    const price = Number(product.price || 0);
    return price;
  };

  const getProductSlug = (product: any) => {
    if (product.slug) return product.slug;
    if (product.parent_data?.slug) return product.parent_data.slug;
    return "#";
  };

  const handleQuantityChange = (cartId: string, qty: number) => {
    if (qty < 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }
    updateQuantity(cartId, qty);
  };

  const handleRemoveItem = (product: any) => {
    removeFromCart(product.cartId || product.id);
    const productName = getProductTitle(product);
    toast.success(`${productName} removed from cart`);
  };

  return (
    <div className="min-h-screen bg-[rgba(201,255,191,0.25)] pt-20 pb-32">
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          asChild
          className="text-hydro-onyx hover:text-hydro-green mb-8"
        >
          <Link href="/store" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </Button>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-white border border-hydro-green/20 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-around text-sm">
                <div className="flex items-center gap-2 text-hydro-onyx">
                  <Shield className="w-4 h-4 text-hydro-green" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-hydro-onyx">
                  <Clock className="w-4 h-4 text-hydro-green" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-hydro-onyx">
                  <Users className="w-4 h-4 text-hydro-green" />
                  <span>Expert Support</span>
                </div>
                <div className="flex items-center gap-2 text-hydro-onyx">
                  <Package className="w-4 h-4 text-hydro-green" />
                  <span>Quality Products</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-hydro-onyx mb-2">Your Cart</h1>
          <p className="text-hydro-onyx/70 mb-8">Review your items before requesting a quote</p>

          {cart.length === 0 ? (
            <Card className="border border-hydro-green/30 rounded-2xl shadow-lg">
              <CardContent className="p-12">
                <div className="text-center py-12 text-hydro-onyx/70">
                  <div className="bg-hydro-mint/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-12 h-12 text-hydro-green/50" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4 text-hydro-onyx">Your cart is empty</h2>
                  <p className="text-lg mb-8 max-w-md mx-auto">
                    Discover our premium hydroponic equipment and supplies to get your project started.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-hydro-green hover:bg-hydro-green/90 text-white px-8 py-3 rounded-lg text-lg"
                  >
                    <Link href="/store">Browse Our Products</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-hydro-green/30 rounded-2xl shadow-lg">
              <CardContent className="p-8 grid lg:grid-cols-3 gap-8">
                {/* Cart Items Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-hydro-onyx">
                      Cart Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </h3>
                    <button
                      onClick={() => {
                        cart.forEach(({ product }) => removeFromCart(product.cartId || product.id));
                        toast.success("Cart cleared");
                      }}
                      className="text-sm text-hydro-onyx/60 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {cart.map(({ product, quantity }) => {
                      const stockInfo = getStockStatus(product);
                      const leadTime = getEstimatedLeadTime(product);
                      const productTitle = getProductTitle(product);
                      const productPrice = getProductPrice(product);
                      const productImage = getProductImage(product);
                      const productSlug = getProductSlug(product);

                      return (
                        <div key={product.cartId || product.id} className="bg-white rounded-lg border border-hydro-green/10 p-6">
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="w-20 h-20 flex-shrink-0 bg-hydro-mint/20 rounded-lg overflow-hidden flex items-center justify-center">
                              {productImage ? (
                                <Image
                                  src={productImage}
                                  alt={productTitle}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const icon = document.createElement('div');
                                      icon.className = 'text-hydro-green/50 flex items-center justify-center w-full h-full';
                                      icon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18l-1.41-1.41A2 2 0 0 0 14.99 4H9.01a2 2 0 0 0-1.42.59L6.18 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>';
                                      parent.appendChild(icon);
                                    }
                                  }}
                                />
                              ) : (
                                <Package className="w-8 h-8 text-hydro-green/50" />
                              )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/product/${productSlug}`}
                                className="text-lg font-semibold text-hydro-onyx hover:text-hydro-green block leading-tight mb-1"
                              >
                                {productTitle}
                              </Link>

                              <div className="text-hydro-green font-bold text-xl mb-2">
                                R{productPrice.toFixed(2)}
                              </div>

                              <div className="flex items-center justify-between mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}`}>
                                  {stockInfo.status}
                                </span>
                                <span className="text-xs text-hydro-onyx/60">
                                  Est. {leadTime} delivery
                                </span>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-hydro-onyx/70 mr-2">Quantity:</span>
                                  <div className="flex items-center border border-hydro-green/40 rounded-lg overflow-hidden">
                                    <button
                                      className="px-3 py-2 text-hydro-onyx hover:text-hydro-green hover:bg-hydro-green/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      onClick={() =>
                                        handleQuantityChange(product.cartId || product.id, quantity - 1)
                                      }
                                      disabled={quantity <= 1}
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <input
                                      type="number"
                                      min={1}
                                      max={99}
                                      value={quantity}
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          product.cartId || product.id,
                                          Math.max(1, Math.min(99, Number(e.target.value) || 1))
                                        )
                                      }
                                      className="w-16 text-center text-hydro-onyx bg-white outline-none border-0 py-2"
                                    />
                                    <button
                                      className="px-3 py-2 text-hydro-onyx hover:text-hydro-green hover:bg-hydro-green/10 transition-colors"
                                      onClick={() =>
                                        handleQuantityChange(product.cartId || product.id, Math.min(99, quantity + 1))
                                      }
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="text-sm text-hydro-onyx/60">Subtotal</div>
                                    <div className="text-lg font-semibold text-hydro-green">
                                      R{(productPrice * quantity).toFixed(2)}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2"
                                    onClick={() => handleRemoveItem(product)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cart Summary Section */}
                <div className="lg:self-start lg:sticky lg:top-4">
                  <div className="bg-hydro-mint/10 rounded-2xl border border-hydro-green/20 p-6">
                    <h3 className="text-xl font-semibold mb-6 text-hydro-onyx">
                      Order Summary
                    </h3>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-hydro-onyx">
                        <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                        <span className="font-medium">R{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-hydro-onyx/70 text-sm">
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <div className="border-t border-hydro-green/30 pt-4">
                        <div className="flex justify-between text-xl font-bold text-hydro-green">
                          <span>Estimated Total</span>
                          <span>R{totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className="w-full bg-hydro-green text-white hover:bg-hydro-green/90 text-lg py-4 rounded-lg"
                        onClick={() => router.push("/checkout")}
                      >
                        Request Quote
                      </Button>
                      
                      <div className="text-center">
                        <Link 
                          href="/store" 
                          className="text-sm text-hydro-green hover:text-hydro-green/80 font-medium"
                        >
                          Continue Shopping
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-800">
                        <div className="font-medium mb-1">Quote Process</div>
                        <ul className="text-xs space-y-1 text-green-700">
                          <li>• No payment required now</li>
                          <li>• Stock confirmation within 24-48hrs</li>
                          <li>• Secure payment link via email</li>
                          <li>• Fast delivery after payment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}