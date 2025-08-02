// app/product/[slug]/page.tsx

import { notFound } from "next/navigation"
import type { WooCommerceProduct } from "@/types/woocommerce"
import ProductPageClient from "./ProductPageClient"

async function getProduct(slug: string): Promise<WooCommerceProduct | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const res = await fetch(`${baseUrl}/api/product?slug=${slug}`, {
      cache: "no-store",
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.product
  } catch {
    return null
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  const product = await getProduct(slug)

  if (!product) return notFound()

  return <ProductPageClient product={product} />
}
