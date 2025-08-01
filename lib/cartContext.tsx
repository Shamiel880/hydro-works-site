"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { WooCommerceProduct } from "@/types/woocommerce"

interface CartItem {
  product: WooCommerceProduct
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: WooCommerceProduct, quantity?: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  updateQuantity: (productId: number, quantity: number) => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const storedCart = localStorage.getItem("hydroworks_cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }, [])

  // Save cart to localStorage on changes
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem("hydroworks_cart", JSON.stringify(cart))
  }, [cart])

  function addToCart(product: WooCommerceProduct, quantity = 1) {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id)
      if (existingIndex !== -1) {
        // Increase quantity if product already in cart
        const updatedCart = [...prevCart]
        updatedCart[existingIndex].quantity += quantity
        return updatedCart
      }
      // Add new product to cart
      return [...prevCart, { product, quantity }]
    })
  }

  function removeFromCart(productId: number) {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  function clearCart() {
    setCart([])
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
