/*
  Warnings:

  - You are about to drop the `_ProductToCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ProductToCategory" DROP CONSTRAINT "_ProductToCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProductToCategory" DROP CONSTRAINT "_ProductToCategory_B_fkey";

-- DropTable
DROP TABLE "public"."_ProductToCategory";

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
