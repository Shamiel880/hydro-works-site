import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { invalidateAllLists, invalidateProductSlug } from "@/lib/cache";
// Optional ISR:
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

const prisma = new PrismaClient();

// Verify WooCommerce webhook signature (HMAC-SHA256 base64)
function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req: NextRequest) {
  const secret = process.env.WC_WEBHOOK_SECRET || "";
  const topic = req.headers.get("x-wc-webhook-topic"); // e.g., "product.updated"
  const signature = req.headers.get("x-wc-webhook-signature");

  const raw = await req.text(); // IMPORTANT: get the raw body first
  if (!verifySignature(raw, signature, secret)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let payload: any = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Handle product changes
  if (topic?.startsWith("product.")) {
    // Woo payload typically includes product id; we map it to our local product via wooId
    const wooId = payload?.id;
    if (wooId) {
      const local = await prisma.product.findFirst({ where: { wooId: wooId } });
      if (local?.slug) {
        invalidateProductSlug(local.slug);
        // Invalidate all listing caches (simple + safe)
        invalidateAllLists();

        // Optional: ISR revalidate the product page if you statically render it
        try {
          revalidatePath(`/product/${local.slug}`);
        } catch {
          // ignore if not using ISR for pages
        }
      } else {
        // If we can’t map, fall back to clearing list caches only
        invalidateAllLists();
      }
    } else {
      // No id? Clear lists as a safe default
      invalidateAllLists();
    }
  }

  return NextResponse.json({ ok: true });
}
