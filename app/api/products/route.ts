import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000) // 10 sec timeout

  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const per_page = searchParams.get("per_page") || "12"
    const category = searchParams.get("category") || ""
    const search = searchParams.get("search") || ""

    const apiUrl = process.env.WC_API_URL
    const apiKey = process.env.WC_API_KEY
    const apiSecret = process.env.WC_API_SECRET

    if (!apiUrl || !apiKey || !apiSecret) {
      console.error("Missing WooCommerce environment variables:", {
        hasApiUrl: !!apiUrl,
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
      })
      clearTimeout(timeout)
      return NextResponse.json(
        {
          error: "WooCommerce API credentials not configured",
          details: "Please check your environment variables",
        },
        { status: 500 },
      )
    }

    const params = new URLSearchParams({
      page,
      per_page,
      status: "publish",
    })

    if (category && category !== "all") {
      params.append("category", category)
    }

    if (search) {
      params.append("search", search)
    }

    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")
    const fullUrl = `${apiUrl}/products?${params}`

    console.log("Attempting to fetch from:", fullUrl.replace(apiKey, "***").replace(apiSecret, "***"))

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "User-Agent": "Hydro-Works-NextJS/1.0",
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    console.log("WooCommerce API Response Status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("WooCommerce API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: fullUrl.replace(apiKey, "***").replace(apiSecret, "***"),
      })

      return NextResponse.json(
        {
          error: `WooCommerce API error: ${response.status} ${response.statusText}`,
          details: errorText || "No additional details available",
        },
        { status: response.status },
      )
    }

    const products = await response.json()
    console.log("Successfully fetched", products.length, "products")

    const totalPages = response.headers.get("X-WP-TotalPages") || "1"
    const totalProducts = response.headers.get("X-WP-Total") || "0"

    return NextResponse.json({
      products,
      pagination: {
        current_page: Number.parseInt(page),
        total_pages: Number.parseInt(totalPages),
        total_products: Number.parseInt(totalProducts),
        per_page: Number.parseInt(per_page),
      },
    })
  } catch (error) {
    clearTimeout(timeout)

    console.error("WooCommerce API Error Details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "Unknown",
    })

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Network error: Unable to connect to WooCommerce API",
          details: "Please check if your WordPress site is running and accessible",
        },
        { status: 503 },
      )
    }

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Request timeout: WooCommerce API took too long to respond",
          details: "The API request timed out after 10 seconds",
        },
        { status: 408 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to fetch products from WooCommerce",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
