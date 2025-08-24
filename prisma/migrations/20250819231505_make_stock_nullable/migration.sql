/*
  Warnings:

  - You are about to drop the column `url` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the `_ProductToProductCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `src` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_ProductToProductCategory" DROP CONSTRAINT "_ProductToProductCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProductToProductCategory" DROP CONSTRAINT "_ProductToProductCategory_B_fkey";

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "shortDescription" TEXT;

-- AlterTable
ALTER TABLE "public"."ProductImage" DROP COLUMN "url",
ADD COLUMN     "src" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_ProductToProductCategory";

-- CreateTable
CREATE TABLE "public"."_ProductCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductCategories_B_index" ON "public"."_ProductCategories"("B");

-- AddForeignKey
ALTER TABLE "public"."_ProductCategories" ADD CONSTRAINT "_ProductCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductCategories" ADD CONSTRAINT "_ProductCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
