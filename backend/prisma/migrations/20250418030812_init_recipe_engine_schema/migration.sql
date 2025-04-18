-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('WEIGHT', 'VOLUME', 'COUNT', 'OTHER');

-- CreateTable
CREATE TABLE "units_of_measure" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "abbreviation" VARCHAR(20),
    "type" "UnitType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_of_measure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "instructions" TEXT NOT NULL,
    "yield_quantity" DECIMAL(10,2),
    "yield_unit_id" INTEGER,
    "prep_time_minutes" INTEGER,
    "cook_time_minutes" INTEGER,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER,
    "sub_recipe_id" INTEGER,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_name_key" ON "units_of_measure"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_abbreviation_key" ON "units_of_measure"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

-- CreateIndex
CREATE INDEX "recipe_ingredients_recipe_id_idx" ON "recipe_ingredients"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_ingredients_ingredient_id_idx" ON "recipe_ingredients"("ingredient_id");

-- CreateIndex
CREATE INDEX "recipe_ingredients_sub_recipe_id_idx" ON "recipe_ingredients"("sub_recipe_id");

-- CreateIndex
CREATE INDEX "recipe_ingredients_unit_id_idx" ON "recipe_ingredients"("unit_id");

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_yield_unit_id_fkey" FOREIGN KEY ("yield_unit_id") REFERENCES "units_of_measure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_sub_recipe_id_fkey" FOREIGN KEY ("sub_recipe_id") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
