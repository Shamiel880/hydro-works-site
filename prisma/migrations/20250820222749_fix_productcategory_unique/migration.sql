/*
  Warnings:

  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price_html` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `short_description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `_ProductCategories` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `wc_id` on table `ProductCategory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."_ProductCategories" DROP CONSTRAINT "_ProductCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProductCategories" DROP CONSTRAINT "_ProductCategories_B_fkey";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "description",
DROP COLUMN "isPublished",
DROP COLUMN "price_html",
DROP COLUMN "short_description",
DROP COLUMN "sku";

-- AlterTable
ALTER TABLE "public"."ProductCategory" ALTER COLUMN "wc_id" SET NOT NULL;

-- DropTable
DROP TABLE "public"."_ProductCategories";

-- CreateTable
CREATE TABLE "public"."_ProductToProductCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductToProductCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductToProductCategory_B_index" ON "public"."_ProductToProductCategory"("B");

-- AddForeignKey
ALTER TABLE "public"."_ProductToProductCategory" ADD CONSTRAINT "_ProductToProductCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductToProductCategory" ADD CONSTRAINT "_ProductToProductCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
