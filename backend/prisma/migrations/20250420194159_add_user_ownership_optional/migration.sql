-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "ingredient_categories" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "units_of_measure" ADD COLUMN     "user_id" INTEGER;

-- CreateIndex
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");

-- CreateIndex
CREATE INDEX "ingredient_categories_user_id_idx" ON "ingredient_categories"("user_id");

-- CreateIndex
CREATE INDEX "ingredients_user_id_idx" ON "ingredients"("user_id");

-- CreateIndex
CREATE INDEX "units_of_measure_user_id_idx" ON "units_of_measure"("user_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_categories" ADD CONSTRAINT "ingredient_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units_of_measure" ADD CONSTRAINT "units_of_measure_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
