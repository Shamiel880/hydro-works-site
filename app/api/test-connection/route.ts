import { NextResponse } from "next/server"

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout

  try {
    const apiUrl = process.env.WC_API_URL
    const apiKey = process.env.WC_API_KEY
    const apiSecret = process.env.WC_API_SECRET

    console.log("Environment check:", {
      hasApiUrl: !!apiUrl,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      apiUrl: apiUrl ? apiUrl.replace(/\/wp-json.*/, "/wp-json/wc/v3") : "Not set",
    })

    if (!apiUrl || !apiKey || !apiSecret) {
      clearTimeout(timeout)
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        details: {
          hasApiUrl: !!apiUrl,
          hasApiKey: !!apiKey,
          hasApiSecret: !!apiSecret,
        },
      })
    }

    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")

    const response = await fetch(`${apiUrl}/system_status`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      apiUrl: apiUrl.replace(apiKey, "***").replace(apiSecret, "***"),
      message: response.ok ? "WooCommerce connection successful" : "WooCommerce connection failed",
    })
  } catch (error) {
    clearTimeout(timeout)
    console.error("Connection test error:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to connect to WooCommerce API",
    })
  }
}
