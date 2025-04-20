/*
  Warnings:

  - A unique constraint covering the columns `[name,user_id]` on the table `ingredient_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,user_id]` on the table `ingredients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,user_id]` on the table `units_of_measure` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[abbreviation,user_id]` on the table `units_of_measure` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ingredient_categories_name_key";

-- DropIndex
DROP INDEX "ingredients_name_key";

-- DropIndex
DROP INDEX "units_of_measure_abbreviation_key";

-- DropIndex
DROP INDEX "units_of_measure_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_categories_name_user_id_key" ON "ingredient_categories"("name", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_user_id_key" ON "ingredients"("name", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_name_user_id_key" ON "units_of_measure"("name", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_abbreviation_user_id_key" ON "units_of_measure"("abbreviation", "user_id");
