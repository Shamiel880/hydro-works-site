/*
  Warnings:

  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `wooId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `ProductCategory` table. All the data in the column will be lost.
  - You are about to drop the `_ProductToProductCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[wc_id]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."_ProductToProductCategory" DROP CONSTRAINT "_ProductToProductCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProductToProductCategory" DROP CONSTRAINT "_ProductToProductCategory_B_fkey";

-- DropIndex
DROP INDEX "public"."Product_wooId_key";

-- DropIndex
DROP INDEX "public"."ProductCategory_slug_key";

-- DropIndex
DROP INDEX "public"."ProductImage_src_key";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "stock",
DROP COLUMN "wooId",
ADD COLUMN     "on_sale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price_html" TEXT,
ADD COLUMN     "purchasable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "short_description" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "stock_status" TEXT NOT NULL DEFAULT 'instock',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'simple',
ADD COLUMN     "wc_id" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."ProductCategory" DROP COLUMN "slug",
ADD COLUMN     "productId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wc_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."ProductImage" ADD COLUMN     "position" INTEGER;

-- DropTable
DROP TABLE "public"."_ProductToProductCategory";

-- CreateTable
CREATE TABLE "public"."ProductVariation" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "wc_id" INTEGER NOT NULL,
    "sku" TEXT,
    "price" TEXT NOT NULL,
    "stock_status" TEXT NOT NULL,
    "attributes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariation_wc_id_key" ON "public"."ProductVariation"("wc_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_wc_id_key" ON "public"."Product"("wc_id");

-- AddForeignKey
ALTER TABLE "public"."ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariation" ADD CONSTRAINT "ProductVariation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
