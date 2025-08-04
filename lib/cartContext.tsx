"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react"
import toast from "react-hot-toast"
import type { WooCommerceProduct } from "@/types/woocommerce"

interface CartItem {
  product: WooCommerceProduct & {
    displayName: string
  }
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: WooCommerceProduct, quantity?: number) => Promise<void>
  removeFromCart: (productId: number) => void
  clearCart: () => void
  updateQuantity: (productId: number, quantity: number) => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

async function fetchParentProduct(productId: number): Promise<WooCommerceProduct | null> {
  try {
    const res = await fetch(`/api/variations?productId=${productId}`)
    if (!res.ok) throw new Error("Failed to fetch parent product")
    const data = await res.json()
    return data.variations?.[0]?.parent_data || null
  } catch (error) {
    console.error("Failed to fetch parent product:", error)
    return null
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const toastRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedCart = localStorage.getItem("hydroworks_cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem("hydroworks_cart", JSON.stringify(cart))
  }, [cart])

  // Show toast after cart update
  useEffect(() => {
    if (toastRef.current) {
      toast.success(toastRef.current)
      toastRef.current = null
    }
  }, [cart])

  async function addToCart(product: WooCommerceProduct, quantity = 1) {
    let productToAdd = {
      ...product,
      displayName: product.name, // default fallback
    }
  
    if (productToAdd.type === "variation" && productToAdd.parent_id) {
      const parentProduct = await fetchParentProduct(productToAdd.parent_id)
  
      if (parentProduct) {
        const getAttributeValues = () => {
          if (Array.isArray(productToAdd.attributes)) {
            return productToAdd.attributes
              .map(attr => attr?.option)
              .filter(Boolean)
              .join(", ")
          }
          if (typeof productToAdd.attributes === "object" && productToAdd.attributes !== null) {
            return Object.values(productToAdd.attributes)
              .filter(val => typeof val === "string" && val.length > 0)
              .join(", ")
          }
          return ""
        }
  
        const attributeValues = getAttributeValues()
  
        productToAdd = {
          ...productToAdd,
          displayName: `${parentProduct.name}${attributeValues ? ` - ${attributeValues}` : ""}`,
          images: productToAdd.images?.length ? productToAdd.images : parentProduct.images,
          parent_data: {
            id: parentProduct.id,
            name: parentProduct.name,
            slug: parentProduct.slug,
            images: parentProduct.images,
          },
        }
      }
    }
  
    const { description, short_description, ...cleanProduct } = productToAdd
  
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === cleanProduct.id
      )
    
      if (existingIndex !== -1) {
        const updatedCart = [...prevCart]
        updatedCart[existingIndex].quantity += quantity
        toastRef.current = `Updated quantity for ${productToAdd.displayName}`
        return updatedCart
      }
    
      toastRef.current = `${productToAdd.displayName} added to cart`
      return [...prevCart, { product: cleanProduct, quantity }]
    })
    
  }  

  function removeFromCart(productId: number) {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  function clearCart() {
    setCart([])
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
