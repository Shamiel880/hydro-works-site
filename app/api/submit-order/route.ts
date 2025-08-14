export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

export async function POST(req: NextRequest) {
  // Make sure env variables exist
  if (!process.env.WC_API_KEY || !process.env.WC_API_SECRET) {
    return NextResponse.json(
      { success: false, message: "WooCommerce API credentials are missing" },
      { status: 500 }
    );
  }

  const api = new WooCommerceRestApi({
    url: "https://backend.hydroworks.co.za/wp",
    consumerKey: process.env.WC_API_KEY,
    consumerSecret: process.env.WC_API_SECRET,
    version: "wc/v3",
    timeout: 10000,
  });

  try {
    const body = await req.json();
    const {
      billing,
      shipping,
      line_items,
      shipping_lines,
      payment_method = "bacs",
      payment_method_title = "Direct Bank Transfer",
      customer_note,
    } = body;

    const orderData: Record<string, any> = {
      payment_method,
      payment_method_title,
      set_paid: false,
      billing,
      shipping,
      line_items,
      shipping_lines,
    };

    if (customer_note) {
      orderData.customer_note = customer_note;
    }

    const { data: order } = await api.post("orders", orderData);

    return NextResponse.json({
      success: true,
      message: "Order submitted successfully",
      order,
    });
  } catch (error: any) {
    const errorMsg = error.response?.data || error.message || "Unknown error";
    console.error("WooCommerce Order Error:", errorMsg);
    return NextResponse.json(
      {
        success: false,
        message: "Order submission failed",
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
