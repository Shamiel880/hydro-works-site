import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const productId = url.searchParams.get("productId")

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  const apiUrl = process.env.WC_API_URL
  const apiKey = process.env.WC_API_KEY
  const apiSecret = process.env.WC_API_SECRET

  if (!apiUrl || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "WooCommerce API credentials not configured" }, { status: 500 })
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")

  try {
    const res = await fetch(`${apiUrl}/products/${productId}/variations?per_page=100`, {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch variations: ${res.status}` }, { status: res.status })
    }

    const variations = await res.json()

    return NextResponse.json({ variations })
  } catch (error) {
    console.error("WooCommerce variations fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch variations" }, { status: 500 })
  }
}
