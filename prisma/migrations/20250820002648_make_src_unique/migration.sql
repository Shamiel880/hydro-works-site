/*
  Warnings:

  - A unique constraint covering the columns `[src]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_src_key" ON "public"."ProductImage"("src");
