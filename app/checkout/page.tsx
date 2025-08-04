"use client"

import React, { useEffect, useState } from "react"
import { useCart } from "@/lib/cartContext"

interface BillingShipping {
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  state: string
  postcode: string
  country: string
  email: string
  phone: string
}

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
]

const SHIPPING_OPTIONS = [
  {
    id: "flat_rate_tac",
    title: "TAC Delivery (1–2 Days)",
    cost: 75,
  },
  {
    id: "collect_order",
    title: "Collect Order – Goodwood",
    cost: 0,
    note: "28 Smartt Road, Goodwood",
  },
  // You can dynamically add uAfrica shipping options later
]

export default function CheckoutForm() {
  const { cart, totalPrice } = useCart()

  const [billing, setBilling] = useState<BillingShipping>({
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "ZA",
    email: "",
    phone: "",
  })

  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finalTotal = totalPrice + selectedShipping.cost

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (cart.length === 0) {
      setError("Your cart is empty")
      setLoading(false)
      return
    }

    const lineItems = cart.map(({ product, quantity }) => ({
      product_id: product.id,
      quantity,
    }))

    const orderPayload = {
      payment_method: "bacs",
      payment_method_title: "Direct Bank Transfer",
      set_paid: false,
      billing,
      shipping: billing,
      line_items: lineItems,
      shipping_lines: [
        {
          method_id: selectedShipping.id,
          method_title: selectedShipping.title,
          total: selectedShipping.cost.toFixed(2),
        },
      ],
    }

    try {
      const res = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })

      const data = await res.json()

      if (data.success) {
        window.location.href = data.order.payment_url
      } else {
        setError(data.message || "Order submission failed")
      }
    } catch {
      setError("Network or server error")
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 rounded shadow-lg bg-hydro-mint"
    >
      <h2 className="text-2xl font-bold mb-4 text-hydro-onyx">Checkout</h2>

      {/* --- Billing Fields --- */}
      <div className="grid grid-cols-1 gap-4">
        <input
          required
          name="first_name"
          value={billing.first_name}
          onChange={handleChange}
          placeholder="First Name *"
          className="w-full border border-hydro-green px-3 py-2 rounded"
        />

        <input
          required
          name="last_name"
          value={billing.last_name}
          onChange={handleChange}
          placeholder="Last Name *"
          className="w-full border border-hydro-green px-3 py-2 rounded"
        />

        <input
          name="company"
          value={billing.company}
          onChange={handleChange}
          placeholder="Company"
          className="w-full border border-hydro-green px-3 py-2 rounded"
        />

        <input
          required
          name="address_1"
          value={billing.address_1}
          onChange={handleChange}
          placeholder="Address Line 1 *"
          className="w-full border border-hydro-green px-3 py-2 rounded"
        />

        <input
          name="address_2"
          value={billing.address_2}
          onChange={handleChange}
          placeholder="Address Line 2"
          className="w-full border border-hydro-green px-3 py-2 rounded"
        />

        <input
          required
          name="city"
          value={billing.city}
          onChange={handleChange}
          placeholder="City *"
          className="w-full border border-hydro-green px-3 py-2 rounded"
        />

        <select
          required
          name="state"
          value={billing.state}
          onChange={handleChange}
          className="w-full border border-hydro-green px-3 py-2 rounded"
        >
          <option value="">Select Province *</option>
          {PROVINCES.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>

        <input
          required
          name="postcode"
          value={billing.postcode}
          onChange={handleChange}
          placeholder="Postal Code *"
          className="w-full border border-hydro-green px-3 py-2 rounded"
        />

        <input
          required
          type="email"
          name="email"
          value={billing.email}
          onChange={handleChange}
          placeholder="Email *"
          className="w-full border border-hydro-green px-3 py-2 rounded"
        />

        <input
          required
          name="phone"
          value={billing.phone}
          onChange={handleChange}
          placeholder="Phone *"
          className="w-full border border-hydro-green px-3 py-2 rounded"
        />
      </div>

      {/* --- Shipping Selection --- */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-hydro-onyx mb-2">Shipping Options</h3>
        <div className="space-y-2">
          {SHIPPING_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="shipping_option"
                checked={selectedShipping.id === option.id}
                onChange={() => setSelectedShipping(option)}
              />
              <span>
                {option.title}
                {option.cost > 0 && ` – R${option.cost.toFixed(2)}`}
                {option.note && <span className="text-xs ml-2 text-gray-500">({option.note})</span>}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 text-right text-hydro-onyx">
        <p className="text-lg">
          <span className="font-medium">Subtotal:</span> R{totalPrice.toFixed(2)}
        </p>
        <p className="text-lg">
          <span className="font-medium">Shipping:</span> R{selectedShipping.cost.toFixed(2)}
        </p>
        <p className="text-xl font-bold mt-1">
          <span className="font-semibold">Total:</span> R{finalTotal.toFixed(2)}
        </p>
      </div>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-hydro-green text-white py-2 rounded hover:bg-hydro-green/90 disabled:opacity-50"
      >
        {loading ? "Placing order..." : "Place Order"}
      </button>
    </form>
  )
}
