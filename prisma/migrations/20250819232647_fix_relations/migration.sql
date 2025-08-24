/*
  Warnings:

  - You are about to drop the `_ProductCategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ProductCategories" DROP CONSTRAINT "_ProductCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProductCategories" DROP CONSTRAINT "_ProductCategories_B_fkey";

-- DropTable
DROP TABLE "public"."_ProductCategories";

-- CreateTable
CREATE TABLE "public"."_ProductToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductToCategory_B_index" ON "public"."_ProductToCategory"("B");

-- AddForeignKey
ALTER TABLE "public"."_ProductToCategory" ADD CONSTRAINT "_ProductToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductToCategory" ADD CONSTRAINT "_ProductToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
