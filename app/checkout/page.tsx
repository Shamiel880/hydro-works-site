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
    const matchedZone = shippingZones.find(zone =>
      zone.zipCodes.some(rx => rx.test(billing.postcode))
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setBilling(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div className="min-h-screen bg-[rgba(201,255,191,0.25)] pt-20">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Card className="border border-hydro-green/30 rounded-2xl">
          <CardContent className="p-6 grid md:grid-cols-2 gap-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-2xl font-semibold text-hydro-onyx">Checkout</h2>
              <div className="grid grid-cols-1 gap-4">
                <input required name="first_name" placeholder="First Name" value={billing.first_name} onChange={handleChange} className="input" />
                <input required name="last_name" placeholder="Last Name" value={billing.last_name} onChange={handleChange} className="input" />
                <input name="company" placeholder="Company (optional)" value={billing.company} onChange={handleChange} className="input" />
                <input required name="address_1" placeholder="Address Line 1" value={billing.address_1} onChange={handleChange} className="input" />
                <input name="address_2" placeholder="Address Line 2" value={billing.address_2} onChange={handleChange} className="input" />
                <input required name="city" placeholder="City" value={billing.city} onChange={handleChange} className="input" />
                <select required name="state" value={billing.state} onChange={handleChange} className="input">
                  <option value="">Select Province</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                <input required name="postcode" placeholder="Postal Code" value={billing.postcode} onChange={handleChange} className="input" />
                <input name="country" value="South Africa" disabled className="input bg-gray-100 cursor-not-allowed" />
                <input required type="email" name="email" placeholder="Email" value={billing.email} onChange={handleChange} className="input" />
                <input required name="phone" placeholder="Phone" value={billing.phone} onChange={handleChange} className="input" />
              </div>
              <div className="text-hydro-green font-medium">
                Shipping: R{shippingCost.toFixed(2)}<br />
                Total: R{(totalPrice + shippingCost).toFixed(2)}
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-hydro-green text-white py-2 rounded hover:bg-opacity-90 disabled:opacity-50">
                {loading ? "Placing order..." : "Place Order"}
              </button>
            </form>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-hydro-onyx">Your Cart</h3>
              <ul className="space-y-4">
                {cart.map(({ product, quantity }) => (
                  <li key={product.id} className="flex justify-between border-b border-hydro-green/20 pb-2">
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
