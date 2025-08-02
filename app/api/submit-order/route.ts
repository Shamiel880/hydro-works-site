export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"

export async function POST(req: NextRequest) {
  const api = new WooCommerceRestApi({
    url: "https://hydroworks.co.za",
    consumerKey: process.env.WC_API_KEY || "",
    consumerSecret: process.env.WC_API_SECRET || "",
    version: "wc/v3",
    timeout: 10000,
  })

  try {
    const body = await req.json()
    const {
      billing,
      shipping,
      line_items,
      shipping_lines,
      payment_method = "bacs",
      payment_method_title = "Direct Bank Transfer",
    } = body

    const orderData = {
      payment_method,
      payment_method_title,
      set_paid: false,
      billing,
      shipping,
      line_items,
      shipping_lines,
    }

    const { data: order } = await api.post("orders", orderData)

    return NextResponse.json({
      success: true,
      message: "Order submitted",
      order,
    })
  } catch (error: any) {
    console.error("Order Error:", error.response?.data || error.message)
    return NextResponse.json(
      {
        success: false,
        message: "Order submission failed",
        error: error.response?.data || error.message,
      },
      { status: 500 }
    )
  }
}
