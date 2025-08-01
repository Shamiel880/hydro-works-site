"use client"

import React, { useState } from "react"
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

export default function CheckoutForm() {
  const { cart } = useCart()

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

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (cart.length === 0) {
      setError("Your cart is empty")
      setLoading(false)
      return
    }

    // Build line_items dynamically from cart context
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
          method_id: "flat_rate",
          method_title: "Flat Rate",
          total: "60.00",
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBilling(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 rounded shadow-lg bg-hydro-mint"
    >
      <h2 className="text-xl font-semibold mb-4 text-hydro-onyx">Checkout</h2>

      <label className="block mb-2 text-hydro-onyx">
        First Name *
        <input
          required
          name="first_name"
          value={billing.first_name}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-hydro-green"
        />
      </label>

      <label className="block mb-2 text-hydro-onyx">
        Last Name *
        <input
          required
          name="last_name"
          value={billing.last_name}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-hydro-green"
        />
      </label>

      <label className="block mb-2 text-hydro-onyx">
        Company
        <input
          name="company"
          value={billing.company}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-hydro-green"
        />
      </label>

      <label className="block mb-2 text-hydro-onyx">
        Address Line 1 *
        <input
          required
          name="address_1"
          value={billing.address_1}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-hydro-green"
        />
      </label>

      <label className="block mb-2 text-hydro-onyx">
        Address Line 2
        <input
          name="address_2"
          value={billing.address_2}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-hydro-green"
        />
      </label>

      <label className="block mb-2 text-hydro-onyx">
        City *
        <input
          required
          name="city"
          value={billing.city}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-hydro-green"
        />
      </label>

      <label className="block mb-2 text-hydro-onyx">
        State/Province *
        <input
          required
          name="state"
          value={billing.state}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-hydro-green"
        />
      </label>

      <label className="block mb-2 text-hydro-onyx">
        Postal Code *
        <input
          required
          name="postcode"
          value={billing.postcode}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-hydro-green"
        />
      </label>

      <label className="block mb-2 text-hydro-onyx">
        Country *
        <input
          required
          name="country"
          value={billing.country}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded bg-gray-100 cursor-not-allowed"
          disabled
        />
      </label>

      <label className="block mb-2 text-hydro-onyx">
        Email *
        <input
          required
          type="email"
          name="email"
          value={billing.email}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-hydro-green"
        />
      </label>

      <label className="block mb-4 text-hydro-onyx">
        Phone *
        <input
          required
          name="phone"
          value={billing.phone}
          onChange={handleChange}
          className="w-full border border-hydro-green px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-hydro-green"
        />
      </label>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-hydro-green text-hydro-white py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
      >
        {loading ? "Placing order..." : "Place Order"}
      </button>
    </form>
  )
}
