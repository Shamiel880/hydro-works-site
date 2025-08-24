// /app/api/product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const product = await prisma.product.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" }, isPublished: true },
    include: {
      images: true,
      categories: true,
      variations: true, // attributes is JSON
    },
  });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const variation_data = product.variations.map((v) => {
    let parsedAttributes: { name: string; option: string }[] = [];
    if (v.attributes) {
      try {
        const jsonAttrs = typeof v.attributes === "string" ? JSON.parse(v.attributes) : v.attributes;
        // jsonAttrs can be [{ name: "Size", option: "Large" }, ...]
        parsedAttributes = Array.isArray(jsonAttrs) ? jsonAttrs : [];
      } catch {
        parsedAttributes = [];
      }
    }
    return {
      id: v.id,
      price: v.price,
      stock_status: v.stock_status,
      attributes: parsedAttributes,
    };
  });

  // BUILD PRODUCT-LEVEL ATTRIBUTES FROM VARIATIONS
  const buildProductAttributes = () => {
    if (!variation_data.length) return [];

    // Group all attribute options by attribute name
    const attributeMap = new Map<string, Set<string>>();
    
    variation_data.forEach(variation => {
      variation.attributes.forEach(attr => {
        if (!attributeMap.has(attr.name)) {
          attributeMap.set(attr.name, new Set());
        }
        attributeMap.get(attr.name)!.add(attr.option);
      });
    });

    // Convert to the format expected by frontend
    return Array.from(attributeMap.entries()).map(([name, optionsSet]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]/g, ''), // Generate simple ID
      name: name,
      options: Array.from(optionsSet).sort() // Sort options alphabetically
    }));
  };

  const result = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    type: product.type,
    stock_status: product.stock_status,
    purchasable: product.purchasable,
    description: product.description,
    short_description: product.short_description,
    sku: product.sku,
    images: product.images ?? [],
    categories: product.categories ?? [],
    variation_data,
    attributes: buildProductAttributes(), // NOW PROPERLY BUILT FROM VARIATIONS
  };

  return NextResponse.json({ product: result });
}