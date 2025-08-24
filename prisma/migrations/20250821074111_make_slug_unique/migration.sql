/*
  Warnings:

  - You are about to drop the `_ProductToProductCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `ProductCategory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductVariation" DROP CONSTRAINT "ProductVariation_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProductToProductCategory" DROP CONSTRAINT "_ProductToProductCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProductToProductCategory" DROP CONSTRAINT "_ProductToProductCategory_B_fkey";

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "short_description" TEXT,
ADD COLUMN     "sku" TEXT;

-- AlterTable
ALTER TABLE "public"."ProductCategory" ALTER COLUMN "slug" SET NOT NULL;

-- DropTable
DROP TABLE "public"."_ProductToProductCategory";

-- CreateTable
CREATE TABLE "public"."_ProductToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductToCategory_B_index" ON "public"."_ProductToCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "public"."ProductCategory"("slug");

-- AddForeignKey
ALTER TABLE "public"."ProductVariation" ADD CONSTRAINT "ProductVariation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductToCategory" ADD CONSTRAINT "_ProductToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductToCategory" ADD CONSTRAINT "_ProductToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
