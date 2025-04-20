/*
  Warnings:

  - A unique constraint covering the columns `[name,user_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Made the column `user_id` on table `categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `ingredient_categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `ingredients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `recipes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `units_of_measure` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "categories_name_key";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "ingredient_categories" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "ingredients" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "recipes" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "units_of_measure" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_user_id_key" ON "categories"("name", "user_id");
