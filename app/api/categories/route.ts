import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.WC_API_URL
    const apiKey = process.env.WC_API_KEY
    const apiSecret = process.env.WC_API_SECRET

    if (!apiUrl || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "WooCommerce API credentials not configured" }, { status: 500 })
    }

    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")

    const response = await fetch(`${apiUrl}/products/categories?per_page=100&hide_empty=true`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`)
    }

    const categories = await response.json()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("WooCommerce Categories API Error:", error)
    return NextResponse.json({ error: "Failed to fetch categories from WooCommerce" }, { status: 500 })
  }
}
