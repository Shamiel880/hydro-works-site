'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react'
import toast from 'react-hot-toast'
import type { WooCommerceProduct } from '@/types/woocommerce'
import { extractAttributeValues } from '@/lib/product-utils'

interface CartItem {
  product: WooCommerceProduct & { 
    displayName: string
    cartId: string
    variationId?: number
  }
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: WooCommerceProduct, quantity?: number, selectedVariation?: any) => Promise<void>
  removeFromCart: (cartId: string) => void
  clearCart: () => void
  updateQuantity: (cartId: string, quantity: number) => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Keep this function for potential future use
async function fetchParentProduct(parentId: number): Promise<WooCommerceProduct | null> {
  try {
    console.log('Fetching parent product with ID:', parentId)
    const res = await fetch(`/api/product-by-id?id=${parentId}`)
    if (res.ok) {
      const parentData = await res.json()
      console.log('Parent product fetched:', parentData)
      return parentData
    }
    console.log('Failed to fetch parent product - response not ok:', res.status)
    return null
  } catch (error) {
    console.error('Failed to fetch parent product:', error)
    return null
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const toastRef = useRef<string | null>(null)

  // Load cart from localStorage on first render
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const storedCart = localStorage.getItem('hydroworks_cart')
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart)
        // Migrate old cart items to new format if needed
        const migratedCart = parsedCart.map((item: any) => {
          if (!item.product.cartId) {
            // Create cartId for old items
            const cartId = item.product.variationId 
              ? `product_${item.product.id}_variation_${item.product.variationId}`
              : `product_${item.product.id}`
            
            return {
              ...item,
              product: {
                ...item.product,
                cartId
              }
            }
          }
          return item
        })
        setCart(migratedCart)
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }, [])

  // Save cart to localStorage on updates
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('hydroworks_cart', JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [cart])

  // Show toast after cart update
  useEffect(() => {
    if (toastRef.current) {
      toast.success(toastRef.current)
      toastRef.current = null
    }
  }, [cart])

  async function addToCart(product: WooCommerceProduct, quantity = 1, selectedVariation: any = null) {
    try {
      console.log('Adding to cart:', product)
      console.log('Product type:', product.type)
      console.log('Selected variation:', selectedVariation)

      let productToAdd: WooCommerceProduct & { 
        displayName: string
        cartId: string
        variationId?: number
      } = {
        ...product,
        displayName: product.name || 'Unnamed Product',
        cartId: `product_${product.id}`, // Default cart ID
      }

      // Handle variable products (products with variations)
      if (product.type === 'variable' && selectedVariation) {
        console.log('Processing variable product with selected variation...')
        
        // Extract variation attributes for display name
        const attributeValues = extractAttributeValues(selectedVariation.attributes)
        console.log('Extracted attribute values:', attributeValues)

        const displayName = attributeValues
          ? `${product.name} - ${attributeValues}`
          : product.name || 'Unnamed Product'

        console.log('Final display name:', displayName)

        productToAdd = {
          ...productToAdd,
          displayName,
          price: selectedVariation.price || product.price, // Use variation price
          variationId: selectedVariation.id,
          cartId: `product_${product.id}_variation_${selectedVariation.id}`, // Unique cart ID
          // Keep the original product ID for WooCommerce
          id: product.id
        }
      }
      // Handle simple products (no variations)
      else if (product.type === 'simple') {
        console.log('Processing simple product...')
        productToAdd = {
          ...productToAdd,
          displayName: product.name || 'Unnamed Product',
          cartId: `product_${product.id}`
        }
      }
      // Handle variable products without selected variation (shouldn't happen in normal flow)
      else if (product.type === 'variable' && !selectedVariation) {
        console.log('Variable product added without variation selection')
        productToAdd = {
          ...productToAdd,
          displayName: product.name || 'Unnamed Product',
          cartId: `product_${product.id}`
        }
      }

      console.log('Final product to add:', productToAdd)

      // Strip unnecessary fields before storing to reduce localStorage size
      const { description, short_description, ...cleanProduct } = productToAdd

      setCart(prevCart => {
        const existingIndex = prevCart.findIndex(
          item => item.product.cartId === cleanProduct.cartId
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
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add product to cart')
    }
  }

  function removeFromCart(cartId: string) {
    setCart(prevCart => prevCart.filter(item => item.product.cartId !== cartId))
  }

  function updateQuantity(cartId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(cartId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.cartId === cartId ? { ...item, quantity } : item
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
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}