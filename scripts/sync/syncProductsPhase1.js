import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch"; // Node 18+ has fetch built-in

const prisma = new PrismaClient();

const WC_URL = process.env.WC_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

async function fetchFromWC(endpoint, page = 1, per_page = 100) {
  const url = `${WC_URL}/wp-json/wc/v3/${endpoint}?consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}&per_page=${per_page}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  return res.json();
}

async function fetchAll(endpoint) {
  let page = 1;
  let results = [];
  while (true) {
    const data = await fetchFromWC(endpoint, page);
    if (!data.length) break;
    results = results.concat(data);
    page++;
  }
  return results;
}

async function syncProducts(products) {
  console.log(`Syncing ${products.length} products...`);

  for (const product of products) {
    try {
      const dbProduct = await prisma.product.upsert({
        where: { wc_id: product.id },
        update: {
          name: product.name,
          slug: product.slug,
          type: product.type,
          price: product.price || null,
          stock_status: product.stock_status || "instock",
          purchasable: product.purchasable ?? true,
          isPublished: product.status === "publish",
          on_sale: product.on_sale ?? false,
        },
        create: {
          wc_id: product.id,
          name: product.name,
          slug: product.slug,
          type: product.type,
          price: product.price || null,
          stock_status: product.stock_status || "instock",
          purchasable: product.purchasable ?? true,
          isPublished: product.status === "publish",
          on_sale: product.on_sale ?? false,
        },
      });

      console.log("Upserted product:", { id: dbProduct.id, name: dbProduct.name, slug: dbProduct.slug });
    } catch (err) {
      console.error(`Failed to upsert product: ${product.name}`, err.message);
    }
  }

  console.log("Phase 1 minimal product sync complete!");
}

async function main() {
  try {
    console.log("Fetching products...");
    const allProducts = await fetchAll("products");

    // Only sync published products
    const publishedProducts = allProducts.filter(p => p.status === "publish");
    console.log(`Total published products: ${publishedProducts.length}`);

    await syncProducts(publishedProducts);
  } catch (err) {
    console.error("Sync failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
