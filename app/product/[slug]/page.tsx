// app/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import Head from "next/head";
import type { WooCommerceProduct } from "@/types/woocommerce";
import ProductPageClient from "./ProductPageClient";

async function getProduct(slug: string): Promise<WooCommerceProduct | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/product?slug=${slug}`, { cache: "no-store" });

    if (!res.ok) return null;

    const data = await res.json();
    return data.product || null; // important: your API wraps product
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return notFound();

  const productImages = product.images?.map((i) => i.src) || [];

  return (
    <>
      <Head>
        <title>{product.name} - Hydro Works</title>
        <meta name="description" content={product.short_description || ""} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.short_description || ""} />
        <meta property="og:image" content={productImages[0] || ""} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`} />
        <meta property="og:type" content="product" />

        {/* Twitter card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        <meta name="twitter:description" content={product.short_description || ""} />
        <meta name="twitter:image" content={productImages[0] || ""} />

        {/* Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              image: productImages,
              description: product.short_description || product.description || "",
              sku: product.sku || product.id,
              brand: { "@type": "Brand", name: "Hydro Works" },
              offers: product.price
                ? {
                    "@type": "Offer",
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
                    priceCurrency: "ZAR",
                    price: product.price,
                    availability:
                      product.stock_status === "instock"
                        ? "https://schema.org/InStock"
                        : product.stock_status === "onbackorder"
                        ? "https://schema.org/PreOrder"
                        : "https://schema.org/OutOfStock",
                  }
                : undefined,
            }),
          }}
        />
      </Head>

      <ProductPageClient product={product} />
    </>
  );
}
