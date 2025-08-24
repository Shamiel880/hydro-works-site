import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get only top-level categories (no parentId)
    const categories = await prisma.productCategory.findMany({
      where: { parentId: null },
      include: {
        products: true, // fetch products linked to these categories
      },
    });

    return new Response(JSON.stringify({ categories }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return new Response(JSON.stringify({ categories: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
