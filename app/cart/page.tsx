"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/cartContext"
import toast from "react-hot-toast"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart()

  // Helper to get product image or fallback
  const getProductImage = (product: any) => {
    if (product.images?.length) return product.images[0].src
    return "/placeholder.png"
  }

  const handleQuantityChange = (productId: number, qty: number) => {
    if (qty < 1) {
      toast.error("Quantity cannot be less than 1")
      return
    }
    updateQuantity(productId, qty)
  }

  return (
    <div className="min-h-screen bg-hydro-white">
      <div className="container mx-auto py-12 px-4">
        <Button variant="ghost" asChild className="text-hydro-onyx hover:text-hydro-green mb-6">
          <Link href="/store" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-hydro-onyx mb-8">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 text-hydro-onyx/70">
            <ShoppingCart className="mx-auto mb-4 w-12 h-12 text-hydro-green/50" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="mb-6">Explore our smart horticultural products to add to your cart.</p>
            <Button asChild className="bg-hydro-green hover:bg-hydro-green/90 text-white px-6 py-2 rounded">
              <Link href="/store">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <Card className="border border-hydro-green/30 rounded-2xl max-w-3xl mx-auto">
            <CardContent className="p-6 space-y-6">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-4">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-lg font-semibold text-hydro-onyx hover:text-hydro-green"
                    >
                      {product.name}
                    </Link>
                    <div className="text-hydro-green font-bold mt-1">R {product.price}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <label htmlFor={`qty-${product.id}`} className="text-sm text-hydro-onyx/70">
                        Qty:
                      </label>
                      <input
                        id={`qty-${product.id}`}
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                        className="w-16 border border-hydro-green/40 rounded px-2 py-1"
                      />
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => {
                      removeFromCart(product.id)
                      toast.success(`${product.name} removed from cart`)
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}

              {/* Subtotal */}
              <div className="flex justify-between items-center border-t border-hydro-green/30 pt-6">
                <span className="text-hydro-onyx text-lg font-semibold">Subtotal</span>
                <span className="text-hydro-green text-xl font-bold">R{totalPrice.toFixed(2)}</span>
              </div>

              {/* Proceed to Checkout */}
              <div className="flex justify-end">
                <Link href="/checkout" passHref legacyBehavior>
                  <Button
                    size="lg"
                    className="rounded-full bg-hydro-green text-white hover:bg-hydro-green/90 disabled:opacity-50"
                    disabled={cart.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
