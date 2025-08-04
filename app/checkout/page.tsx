"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/lib/cartContext";
import { Card, CardContent } from "@/components/ui/card";

interface BillingShipping {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const shippingZones = [
  { zipCodes: [/^7/], cost: 90 }, // Western Cape
  { zipCodes: [/^6/], cost: 120 }, // Eastern Cape
  { zipCodes: [/^0/, /^1/, /^2/, /^3/, /^4/, /^5/, /^8/, /^9/], cost: 150 }, // Other
];

export default function CheckoutForm() {
  const { cart, totalPrice } = useCart();

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
  });

  const [shippingCost, setShippingCost] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const matchedZone = shippingZones.find((zone) =>
      zone.zipCodes.some((rx) => rx.test(billing.postcode))
    );
    setShippingCost(matchedZone ? matchedZone.cost : 0);
  }, [billing.postcode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (cart.length === 0) {
      setError("Your cart is empty");
      setLoading(false);
      return;
    }

    const lineItems = cart.map(({ product, quantity }) => ({
      product_id: product.id,
      quantity,
    }));

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
          total: shippingCost.toFixed(2),
        },
      ],
    };

    try {
      const res = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = data.order.payment_url;
      } else {
        setError(data.message || "Order submission failed");
      }
    } catch {
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div className="min-h-screen bg-[rgba(201,255,191,0.25)] pt-20 pb-32">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Card className="border border-hydro-green/30 rounded-2xl shadow-lg">
          <CardContent className="p-8 grid md:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-2xl font-semibold text-hydro-onyx">
                Checkout
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <input
                  required
                  name="first_name"
                  placeholder="First Name"
                  value={billing.first_name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <input
                  required
                  name="last_name"
                  placeholder="Last Name"
                  value={billing.last_name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <input
                  name="company"
                  placeholder="Company (optional)"
                  value={billing.company}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <input
                  required
                  name="address_1"
                  placeholder="Address Line 1"
                  value={billing.address_1}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <input
                  name="address_2"
                  placeholder="Address Line 2"
                  value={billing.address_2}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <input
                  required
                  name="city"
                  placeholder="City"
                  value={billing.city}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <select
                  required
                  name="state"
                  value={billing.state}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green bg-white"
                >
                  <option value="">Select Province</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                <input
                  required
                  name="postcode"
                  placeholder="Postal Code"
                  value={billing.postcode}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <input
                  name="country"
                  value="South Africa"
                  disabled
                  className="w-full p-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={billing.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <input
                  required
                  name="phone"
                  placeholder="Phone"
                  value={billing.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
              </div>

              <div className="text-hydro-green font-medium pt-4">
                Shipping: R{shippingCost.toFixed(2)} <br />
                Total: R{(totalPrice + shippingCost).toFixed(2)}
              </div>

              {error && (
                <p className="text-red-600 bg-red-100 border border-red-300 rounded px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-hydro-green text-white py-3 rounded-md font-semibold hover:bg-opacity-90 disabled:opacity-50 transition"
              >
                {loading ? "Placing order..." : "Place Order"}
              </button>
            </form>

            <div className="self-start pt-[2.75rem]">
              <h3 className="text-lg font-semibold mb-4 text-hydro-onyx">
                Your Cart
              </h3>
              <ul className="space-y-4">
                {cart.map(({ product, quantity }) => (
                  <li
                    key={product.id}
                    className="flex justify-between border-b border-hydro-green/20 pb-2"
                  >
                    <span>{product.displayName}</span>
                    <span>
                      {quantity} × R{Number(product.price).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-hydro-onyx/80 text-sm italic">
                Shipping will update automatically based on postal code.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
