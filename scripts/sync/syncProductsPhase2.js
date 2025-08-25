import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

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

// Upsert category
async function upsertCategory(cat) {
  try {
    return await prisma.productCategory.upsert({
      where: { wc_id: cat.id },
      update: {
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parent || null,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        wc_id: cat.id,
        parentId: cat.parent || null,
      },
    });
  } catch (err) {
    console.error(`Failed to sync category ${cat.name}:`, err.message);
    return null;
  }
}

// Sync products
async function syncProducts(products) {
  for (const product of products) {
    if (product.status !== "publish") continue;

    const dbProduct = await prisma.product.upsert({
      where: { wc_id: product.id },
      update: {
        name: product.name,
        price: product.price || null,
        stock_status: product.stock_status || "instock",
        description: product.description || "",             // <-- ADD
        short_description: product.short_description || "", // <-- ADD
      },
      create: {
        wc_id: product.id,
        name: product.name,
        price: product.price || null,
        stock_status: product.stock_status || "instock",
        slug: product.slug,
        type: product.type,
        purchasable: product.purchasable != null ? product.purchasable : true,
        isPublished: true,
        on_sale: product.on_sale != null ? product.on_sale : false,
        description: product.description || "",             // <-- ADD
        short_description: product.short_description || "", // <-- ADD
      },
    });
    

    // Connect categories
    if (product.categories && product.categories.length) {
      const connectedCats = [];
      for (const cat of product.categories) {
        const dbCat = await upsertCategory(cat);
        if (dbCat) connectedCats.push({ id: dbCat.id });
      }

      await prisma.product.update({
        where: { id: dbProduct.id },
        data: {
          categories: {
            set: [],
            connect: connectedCats,
          },
        },
      });
    }

    // Sync images
    if (product.images && product.images.length) {
      await prisma.productImage.deleteMany({ where: { productId: dbProduct.id } });
      for (let i = 0; i < product.images.length; i++) {
        const img = product.images[i];
        await prisma.productImage.create({
          data: {
            productId: dbProduct.id,
            src: img.src,
            alt: img.alt || null,
            position: i,
          },
        });
      }
    }

    // Sync variations
    if (product.variations && product.variations.length) {
      const variations = await fetchAll(`products/${product.id}/variations`);
      for (const v of variations) {
        await prisma.productVariation.upsert({
          where: { wc_id: v.id },
          update: {
            sku: v.sku || null,
            price: v.price || "0",
            stock_status: v.stock_status || "instock",
          },
          create: {
            wc_id: v.id,
            productId: dbProduct.id,
            sku: v.sku || null,
            price: v.price || "0",
            stock_status: v.stock_status || "instock",
            attributes: v.attributes || [],
          },
        });
      }
    }

    console.log(`Upserted product: ${dbProduct.name}`);
  }
}

async function main() {
  try {
    const products = await fetchAll("products");
    await syncProducts(products);
    console.log("Full product sync complete!");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
