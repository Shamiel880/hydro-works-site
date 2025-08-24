"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/lib/cartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, Users, CheckCircle, Package, AlertCircle } from "lucide-react";

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
  customer_note?: string;
}

interface OrderSummary {
  order_id: number;
  line_items: { name: string; quantity: number; price: number; leadTime?: string }[];
  total: number;
  shipping: number;
  customer_name: string;
  customer_email: string;
  estimated_quote_time: string;
  estimated_fulfillment: string;
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
  { zipCodes: [/^7/], cost: 90, region: "Western Cape" }, 
  { zipCodes: [/^6/], cost: 120, region: "Eastern Cape" }, 
  { zipCodes: [/^0/, /^1/, /^2/, /^3/, /^4/, /^5/, /^8/, /^9/], cost: 150, region: "Other Provinces" }, 
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
    customer_note: "",
  });

  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingRegion, setShippingRegion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    const matchedZone = shippingZones.find((zone) =>
      zone.zipCodes.some((rx) => rx.test(billing.postcode))
    );
    if (matchedZone) {
      setShippingCost(matchedZone.cost);
      setShippingRegion(matchedZone.region);
    } else {
      setShippingCost(0);
      setShippingRegion("");
    }
  }, [billing.postcode]);

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

  const calculateEstimatedFulfillment = () => {
    const hasBackorder = cart.some(({ product }) => product.stock_status === 'onbackorder');
    const hasStockToConfirm = cart.some(({ product }) => !product.stock_status || product.stock_status === 'outofstock');
    
    if (hasBackorder || hasStockToConfirm) return '5-7 business days';
    return '3-5 business days';
  };

  const determineProjectType = (note: string) => {
    if (!note) return 'general';
    const lowerNote = note.toLowerCase();
    if (lowerNote.includes('commercial') || lowerNote.includes('business')) return 'commercial';
    if (lowerNote.includes('home') || lowerNote.includes('personal')) return 'residential';
    if (lowerNote.includes('urgent') || lowerNote.includes('asap')) return 'urgent';
    return 'general';
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

const lineItemsPayload = cart.map(({ product, quantity }) => {
  const lineItem: any = {
    product_id: product.variationId ? product.id.toString().slice(0, -product.variationId.toString().length) : product.id,
    quantity,
    name: product.displayName || product.name,
    price: product.price.toString(),
  };

  // If this is a variation, add the variation_id
  if (product.variationId) {
    lineItem.variation_id = product.variationId;
    
    // Add variation attributes if available
    if (product.attributes) {
      lineItem.meta_data = Object.entries(product.attributes).map(([key, value]) => ({
        key: key.startsWith('pa_') ? key : `pa_${key}`,
        value: value
      }));
    }
  }

  return lineItem;
});

    const projectType = determineProjectType(billing.customer_note || '');
    const estimatedFulfillment = calculateEstimatedFulfillment();

    const orderPayload = {
      payment_method: "bacs",
      payment_method_title: "Quote Request - Payment Link to Follow",
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
      customer_note: billing.customer_note,
      status: "quote-requested",
      meta_data: [
        { key: '_quote_requested_at', value: new Date().toISOString() },
        { key: '_estimated_fulfillment', value: estimatedFulfillment },
        { key: '_customer_project_type', value: projectType },
        { key: '_shipping_region', value: shippingRegion },
        { key: '_requires_stock_check', value: cart.some(({ product }) => product.stock_status !== 'instock') }
      ]
    };

    try {
      const res = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (data.success) {
        const summary: OrderSummary = {
          order_id: data.order.id,
          line_items: cart.map(({ product, quantity }) => ({
            name: product.displayName,
            quantity,
            price: Number(product.price),
            leadTime: getEstimatedLeadTime(product),
          })),
          total: totalPrice + shippingCost,
          shipping: shippingCost,
          customer_name: `${billing.first_name} ${billing.last_name}`,
          customer_email: billing.email,
          estimated_quote_time: projectType === 'urgent' ? '12-24 hours' : '24-48 hours',
          estimated_fulfillment: estimatedFulfillment,
        };

        setOrderSummary(summary);
        setSubmitted(true);
        clearCart();
      } else {
        setError(data.message || "Quote request submission failed");
      }
    } catch {
      setError("Network or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted && orderSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgba(201,255,191,0.25)] pt-20 pb-32">
        <div className="container max-w-2xl">
          <Card className="border border-hydro-green/30 rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-hydro-green mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-hydro-onyx mb-2">
                Quote Request Received!
              </h2>
              <p className="text-hydro-onyx/80 text-lg">
                Thank you, {orderSummary.customer_name}
              </p>
            </div>

            <div className="bg-hydro-mint/10 border border-hydro-green/30 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-hydro-onyx mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-hydro-green" />
                What Happens Next
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-hydro-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                  <div>
                    <div className="font-medium">Stock Confirmation</div>
                    <div className="text-sm text-hydro-onyx/70">We'll confirm availability with our suppliers within {orderSummary.estimated_quote_time}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-hydro-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                  <div>
                    <div className="font-medium">Payment Link</div>
                    <div className="text-sm text-hydro-onyx/70">You'll receive a secure payment link via email</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-hydro-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                  <div>
                    <div className="font-medium">Order Fulfillment</div>
                    <div className="text-sm text-hydro-onyx/70">Delivery within {orderSummary.estimated_fulfillment} after payment</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-hydro-green/20 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-hydro-onyx">Quote Request #{orderSummary.order_id}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Quote Requested</span>
              </div>
              
              <div className="space-y-3 mb-4">
                {orderSummary.line_items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-hydro-onyx/60">Qty: {item.quantity} • Est. lead time: {item.leadTime}</div>
                    </div>
                    <span className="font-medium">R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-hydro-onyx/80">
                  <span>Subtotal:</span>
                  <span>R{(orderSummary.total - orderSummary.shipping).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-hydro-onyx/80">
                  <span>Shipping:</span>
                  <span>R{orderSummary.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-hydro-green pt-2 border-t border-gray-200">
                  <span>Estimated Total:</span>
                  <span>R{orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-amber-800">Important Notes:</div>
                  <ul className="text-amber-700 mt-1 space-y-1">
                    <li>• Final pricing may vary based on current stock availability</li>
                    <li>• Quote prices are valid for 30 days</li>
                    <li>• No payment is required until stock is confirmed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-hydro-onyx/70 mb-4">
                Questions about your quote? Contact us at <span className="font-medium">sales@hydroworks.co.za</span> or call us directly.
              </p>
              <button 
                onClick={() => window.location.href = '/store'} 
                className="bg-hydro-green text-white px-6 py-2 rounded-lg hover:bg-hydro-green/90 transition"
              >
                Continue Shopping
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgba(201,255,191,0.25)] pt-20 pb-32">
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        {/* Progress Indicator */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-hydro-onyx/60 mb-2">
            <span>Quote Request</span>
            <span>Step 1 of 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-hydro-green h-2 rounded-full w-1/4 transition-all duration-300"></div>
          </div>
        </div>

        {/* Process Explanation */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-hydro-mint/10 border border-hydro-green/30 rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-bold text-hydro-onyx mb-4 text-xl text-center">How Our Quote Process Works</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-hydro-green text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mx-auto mb-2">1</div>
                  <div className="font-medium text-hydro-onyx">Submit Details</div>
                  <div className="text-sm text-hydro-onyx/70">No payment required</div>
                </div>
                <div className="text-center">
                  <div className="bg-hydro-green text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mx-auto mb-2">2</div>
                  <div className="font-medium text-hydro-onyx">Stock Check</div>
                  <div className="text-sm text-hydro-onyx/70">24-48 hour confirmation</div>
                </div>
                <div className="text-center">
                  <div className="bg-hydro-green text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mx-auto mb-2">3</div>
                  <div className="font-medium text-hydro-onyx">Payment Link</div>
                  <div className="text-sm text-hydro-onyx/70">Secure email payment</div>
                </div>
                <div className="text-center">
                  <div className="bg-hydro-green text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mx-auto mb-2">4</div>
                  <div className="font-medium text-hydro-onyx">Fast Delivery</div>
                  <div className="text-sm text-hydro-onyx/70">3-5 business days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-white border border-hydro-green/20 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-around text-sm">
                <div className="flex items-center gap-2 text-hydro-onyx">
                  <Shield className="w-4 h-4 text-hydro-green" />
                  <span>Cape Town Based</span>
                </div>
                <div className="flex items-center gap-2 text-hydro-onyx">
                  <Clock className="w-4 h-4 text-hydro-green" />
                  <span>Quick Turnaround</span>
                </div>
                <div className="flex items-center gap-2 text-hydro-onyx">
                  <Users className="w-4 h-4 text-hydro-green" />
                  <span>Personal Service</span>
                </div>
                <div className="flex items-center gap-2 text-hydro-onyx">
                  <Package className="w-4 h-4 text-hydro-green" />
                  <span>Fresh Stock</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form */}
        <Card className="border border-hydro-green/30 rounded-2xl shadow-lg max-w-5xl mx-auto">
          <CardContent className="p-8 grid lg:grid-cols-3 gap-8">
            <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
              <h2 className="text-2xl font-semibold text-hydro-onyx mb-2">
                Request Your Quote
              </h2>
              <p className="text-hydro-onyx/70 text-sm mb-6">
                Fill in your details below. We'll confirm stock and send you a payment link within 24-48 hours.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  required
                  name="first_name"
                  placeholder="First Name"
                  value={billing.first_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <input
                  required
                  name="last_name"
                  placeholder="Last Name"
                  value={billing.last_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
              </div>

              <input
                name="company"
                placeholder="Company (Optional)"
                value={billing.company}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={billing.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <input
                  required
                  name="phone"
                  placeholder="Phone Number"
                  value={billing.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
              </div>

              <input
                required
                name="address_1"
                placeholder="Street Address"
                value={billing.address_1}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
              />

              <input
                name="address_2"
                placeholder="Apartment, suite, etc. (Optional)"
                value={billing.address_2}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
              />

              <div className="grid md:grid-cols-3 gap-4">
                <input
                  required
                  name="city"
                  placeholder="City"
                  value={billing.city}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
                <select
                  required
                  name="state"
                  value={billing.state}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green bg-white"
                >
                  <option value="">Select Province</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                <input
                  required
                  name="postcode"
                  placeholder="Postal Code"
                  value={billing.postcode}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green"
                />
              </div>

              <input
                name="country"
                value="South Africa"
                disabled
                className="w-full p-3 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />

              <div>
                <label className="block text-sm font-medium text-hydro-onyx mb-2">
                  Project Details / Special Requirements (Optional)
                </label>
                <textarea
                  name="customer_note"
                  placeholder="Tell us about your hydroponic project, timeline, or any special requirements..."
                  rows={4}
                  value={billing.customer_note}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hydro-green resize-none"
                />
                <p className="text-xs text-hydro-onyx/60 mt-1">
                  This helps us provide better recommendations and more accurate quotes
                </p>
              </div>

              {shippingRegion && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm">
                    <div className="font-medium text-green-800 mb-1">Shipping to {shippingRegion}</div>
                    <div className="text-green-700">
                      <strong>Shipping:</strong> R{shippingCost.toFixed(2)} • 
                      <strong> Timeline:</strong> Stock confirmation 24-48hrs, then {calculateEstimatedFulfillment()} delivery
                    </div>
                  </div>
                </div>
              )}

              <div className="text-hydro-green font-medium pt-4 text-lg">
                Estimated Total: R{(totalPrice + shippingCost).toFixed(2)}
                <div className="text-sm text-hydro-onyx/70 font-normal">
                  Final pricing confirmed after stock check
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="text-xs text-hydro-onyx/60 mb-4">
                By submitting this quote request, you agree to our Privacy Policy and consent to us contacting you about your order. Quotes are valid for 30 days.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-hydro-green text-white py-4 rounded-lg font-semibold hover:bg-hydro-green/90 disabled:opacity-50 transition text-lg"
              >
                {loading ? "Submitting Quote Request..." : "Request Quote"}
              </button>
              <div className="text-center text-sm text-hydro-onyx/70">
                No payment required now • Secure process
              </div>
            </form>

            <div className="lg:self-start lg:sticky lg:top-4">
              <h3 className="text-lg font-semibold mb-4 text-hydro-onyx">
                Quote Summary
              </h3>
              
              <div className="space-y-4 mb-6">
                {cart.map(({ product, quantity }) => {
                  const stockInfo = getStockStatus(product);
                  const leadTime = getEstimatedLeadTime(product);
                  
                  return (
                    <div key={product.id} className="bg-white rounded-lg border border-hydro-green/10 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-hydro-onyx leading-tight">{product.displayName}</span>
                        <span className="text-hydro-green font-medium ml-2">
                          R{(Number(product.price) * quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-hydro-onyx/70">Qty: {quantity}</span>
                        <span className="text-hydro-onyx/70">R{Number(product.price).toFixed(2)} each</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}`}>
                          {stockInfo.status}
                        </span>
                        <span className="text-xs text-hydro-onyx/60">
                          Est. {leadTime} after payment
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-hydro-mint/10 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-hydro-onyx">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                  <span>R{totalPrice.toFixed(2)}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-hydro-onyx">
                    <span>Shipping:</span>
                    <span>R{shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-hydro-green/30 pt-2 flex justify-between font-bold text-hydro-green">
                  <span>Estimated Total:</span>
                  <span>R{(totalPrice + shippingCost).toFixed(2)}</span>
                </div>
                <div className="text-xs text-hydro-onyx/60 text-center italic pt-2">
                  Final pricing subject to stock availability
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-hydro-onyx/70 italic">
                "Over 200 successful hydroponic projects completed in Cape Town"
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}