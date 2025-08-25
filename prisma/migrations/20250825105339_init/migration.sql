-- CreateTable
CREATE TABLE "public"."woocommerce_quotes" (
    "id" SERIAL NOT NULL,
    "woocommerce_order_id" INTEGER NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT,
    "customer_company" TEXT,
    "shipping_address" TEXT,
    "billing_address" TEXT,
    "line_items" JSONB NOT NULL,
    "shipping_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order_total" DOUBLE PRECISION NOT NULL,
    "customer_note" TEXT,
    "project_type" TEXT NOT NULL DEFAULT 'general',
    "shipping_region" TEXT,
    "estimated_fulfillment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "meta_data" JSONB,

    CONSTRAINT "woocommerce_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "woocommerce_quotes_woocommerce_order_id_key" ON "public"."woocommerce_quotes"("woocommerce_order_id");
