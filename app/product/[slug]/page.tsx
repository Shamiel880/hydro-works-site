import { notFound } from "next/navigation"
import type { WooCommerceProduct } from "@/types/woocommerce"
import ProductPageClient from "./ProductPageClient"

async function getProduct(slug: string): Promise<WooCommerceProduct | null> {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const res = await fetch(`${baseUrl}/api/product?slug=${slug}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data.product
  } catch {
    return null
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params  // Await here

  const product = await getProduct(slug)

  if (!product) {
    return notFound()
  }

  return <ProductPageClient product={product} />
}
