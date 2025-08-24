/*
  Warnings:

  - A unique constraint covering the columns `[wc_id]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "wc_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."ProductCategory" ADD COLUMN     "slug" TEXT,
ALTER COLUMN "productId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."ProductImage" ALTER COLUMN "position" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."ProductVariation" ALTER COLUMN "stock_status" SET DEFAULT 'instock';

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_wc_id_key" ON "public"."ProductCategory"("wc_id");
