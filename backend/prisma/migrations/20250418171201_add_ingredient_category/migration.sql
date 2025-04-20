-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "ingredient_category_id" INTEGER;

-- CreateTable
CREATE TABLE "ingredient_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredient_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_categories_name_key" ON "ingredient_categories"("name");

-- CreateIndex
CREATE INDEX "ingredients_ingredient_category_id_idx" ON "ingredients"("ingredient_category_id");

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_ingredient_category_id_fkey" FOREIGN KEY ("ingredient_category_id") REFERENCES "ingredient_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
