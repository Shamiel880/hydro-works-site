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

interface OrderSummary {
  order_id: number;
  line_items: { name: string; quantity: number; price: number }[];
  total: number;
  shipping: number;
  customer_name: string;
  customer_email: string;
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
  const { cart, totalPrice, clearCart } = useCart();

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
  const [submitted, setSubmitted] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    const matchedZone = shippingZones.find((zone) =>
      zone.zipCodes.some((rx) => rx.test(billing.postcode))
    );
    setShippingCost(matchedZone ? matchedZone.cost : 0);
  }, [billing.postcode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (cart.length === 0) {
      setError("Your cart is empty");
      setLoading(false);
      return;
    }

    const lineItemsPayload = cart.map(({ product, quantity }) => ({
      product_id: product.id,
      quantity,
    }));

    const orderPayload = {
      payment_method: "bacs",
      payment_method_title: "Direct Bank Transfer",
      set_paid: false,
      billing,
      shipping: billing,
      line_items: lineItemsPayload,
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
        // Prepare summary for display
        const summary: OrderSummary = {
          order_id: data.order.id,
          line_items: cart.map(({ product, quantity }) => ({
            name: product.displayName,
            quantity,
            price: Number(product.price),
          })),
          total: totalPrice + shippingCost,
          shipping: shippingCost,
          customer_name: `${billing.first_name} ${billing.last_name}`,
          customer_email: billing.email,
        };

        setOrderSummary(summary);
        setSubmitted(true);
        clearCart();
      } else {
        setError(data.message || "Order submission failed");
      }
    } catch {
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted && orderSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgba(201,255,191,0.25)] pt-20 pb-32">
        <div className="container max-w-lg">
          <Card className="border border-hydro-green/30 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-hydro-onyx mb-4">
              Thank you, {orderSummary.customer_name}!
            </h2>
            <p className="text-hydro-onyx/80 mb-4">
              Your order <span className="font-medium">#{orderSummary.order_id}</span> has been received and is pending confirmation.
            </p>

            <h3 className="text-lg font-semibold text-hydro-onyx mb-2">Order Summary</h3>
            <ul className="mb-4 border-b border-hydro-green/20 pb-2">
              {orderSummary.line_items.map((item, idx) => (
                <li key={idx} className="flex justify-between mb-1">
                  <span>{item.name} × {item.quantity}</span>
                  <span>R{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="text-hydro-onyx/80 mb-2">
              Shipping: R{orderSummary.shipping.toFixed(2)}
            </div>
            <div className="text-hydro-green font-bold text-lg mb-4">
              Total: R{orderSummary.total.toFixed(2)}
            </div>
            <p className="text-sm text-hydro-onyx/70">
              We will confirm stock and send you payment details shortly.
            </p>
          </Card>
        </div>
      </div>
    );
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
                {/* Billing Fields */}
                {["first_name","last_name","company","address_1","address_2","city","postcode","email","phone"].map((field) => (
                  <input
                    key={field}
                    required={field!=="company"}
                    name={field}
                    placeholder={field.replace("_"," ")}
                    value={(billing as any)[field]}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                  />
                ))}
                <select
                  required
                  name="state"
                  value={billing.state}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green bg-white"
                >
                  <option value="">Select Province</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                <input
                  name="country"
                  value="South Africa"
                  disabled
                  className="w-full p-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
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
