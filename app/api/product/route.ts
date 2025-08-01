import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (!slug) {
      return NextResponse.json({ error: "Product slug is required" }, { status: 400 })
    }

    const apiUrl = process.env.WC_API_URL
    const apiKey = process.env.WC_API_KEY
    const apiSecret = process.env.WC_API_SECRET

    if (!apiUrl || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "WooCommerce API credentials not configured" }, { status: 500 })
    }

    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")

    // Fetch main product by slug
    const productResponse = await fetch(`${apiUrl}/products?slug=${slug}&per_page=1`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!productResponse.ok) {
      throw new Error(`WooCommerce API error: ${productResponse.status} ${productResponse.statusText}`)
    }

    const products = await productResponse.json()

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = products[0]

    // ✅ If it's a variable product, fetch its variations
    if (product.type === "variable") {
      const variationsResponse = await fetch(`${apiUrl}/products/${product.id}/variations?per_page=100`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      })

      if (variationsResponse.ok) {
        const variations = await variationsResponse.json()
        product.variation_data = variations // ← attach here
      } else {
        console.warn(`Failed to fetch variations for product ${product.id}`)
        product.variation_data = []
      }
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("WooCommerce Product API Error:", error)

    const isAbortError = error instanceof DOMException && error.name === "AbortError"

    return NextResponse.json(
      {
        error: isAbortError
          ? "WooCommerce request timed out"
          : "Failed to fetch product from WooCommerce",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
