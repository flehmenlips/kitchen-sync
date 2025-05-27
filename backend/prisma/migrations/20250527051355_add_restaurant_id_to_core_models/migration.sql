/*
  Warnings:

  - Added the required column `restaurant_id` to the `ingredient_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `ingredients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `menus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `prep_columns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `prep_tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `recipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `units_of_measure` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add nullable columns first
ALTER TABLE "ingredient_categories" ADD COLUMN "restaurant_id" INTEGER;
ALTER TABLE "ingredients" ADD COLUMN "restaurant_id" INTEGER;
ALTER TABLE "menus" ADD COLUMN "restaurant_id" INTEGER;
ALTER TABLE "prep_columns" ADD COLUMN "restaurant_id" INTEGER;
ALTER TABLE "prep_tasks" ADD COLUMN "restaurant_id" INTEGER;
ALTER TABLE "recipes" ADD COLUMN "restaurant_id" INTEGER;
ALTER TABLE "units_of_measure" ADD COLUMN "restaurant_id" INTEGER;

-- Step 2: Create a temporary function to find user's restaurant
CREATE OR REPLACE FUNCTION get_user_restaurant(user_id_param INTEGER) 
RETURNS INTEGER AS $$
DECLARE
    restaurant_id_result INTEGER;
BEGIN
    -- Try to find the user's restaurant through restaurant_staff table
    SELECT rs.restaurant_id INTO restaurant_id_result
    FROM restaurant_staff rs
    WHERE rs.user_id = user_id_param
    AND rs.is_active = true
    ORDER BY rs.created_at ASC
    LIMIT 1;
    
    -- If no restaurant found, try to find any active restaurant
    IF restaurant_id_result IS NULL THEN
        SELECT id INTO restaurant_id_result
        FROM restaurants
        WHERE is_active = true
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;
    
    -- If still no restaurant, create a default one
    IF restaurant_id_result IS NULL THEN
        INSERT INTO restaurants (name, slug, is_active, created_at, updated_at)
        VALUES ('Default Restaurant', 'default-restaurant', true, NOW(), NOW())
        RETURNING id INTO restaurant_id_result;
    END IF;
    
    RETURN restaurant_id_result;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Populate restaurant_id for all existing records
UPDATE ingredient_categories SET restaurant_id = get_user_restaurant(user_id) WHERE restaurant_id IS NULL;
UPDATE ingredients SET restaurant_id = get_user_restaurant(user_id) WHERE restaurant_id IS NULL;
UPDATE menus SET restaurant_id = get_user_restaurant(user_id) WHERE restaurant_id IS NULL;
UPDATE prep_columns SET restaurant_id = get_user_restaurant(user_id) WHERE restaurant_id IS NULL;
UPDATE prep_tasks SET restaurant_id = get_user_restaurant(user_id) WHERE restaurant_id IS NULL;
UPDATE recipes SET restaurant_id = get_user_restaurant(user_id) WHERE restaurant_id IS NULL;
UPDATE units_of_measure SET restaurant_id = get_user_restaurant(user_id) WHERE restaurant_id IS NULL;

-- Step 4: Drop the temporary function
DROP FUNCTION get_user_restaurant(INTEGER);

-- Step 5: Make columns non-nullable
ALTER TABLE "ingredient_categories" ALTER COLUMN "restaurant_id" SET NOT NULL;
ALTER TABLE "ingredients" ALTER COLUMN "restaurant_id" SET NOT NULL;
ALTER TABLE "menus" ALTER COLUMN "restaurant_id" SET NOT NULL;
ALTER TABLE "prep_columns" ALTER COLUMN "restaurant_id" SET NOT NULL;
ALTER TABLE "prep_tasks" ALTER COLUMN "restaurant_id" SET NOT NULL;
ALTER TABLE "recipes" ALTER COLUMN "restaurant_id" SET NOT NULL;
ALTER TABLE "units_of_measure" ALTER COLUMN "restaurant_id" SET NOT NULL;

-- Step 6: Create indexes
CREATE INDEX "ingredient_categories_restaurant_id_idx" ON "ingredient_categories"("restaurant_id");
CREATE INDEX "ingredients_restaurant_id_idx" ON "ingredients"("restaurant_id");
CREATE INDEX "menus_restaurant_id_idx" ON "menus"("restaurant_id");
CREATE INDEX "prep_tasks_restaurant_id_idx" ON "prep_tasks"("restaurant_id");
CREATE INDEX "recipes_restaurant_id_idx" ON "recipes"("restaurant_id");
CREATE INDEX "units_of_measure_restaurant_id_idx" ON "units_of_measure"("restaurant_id");

-- Step 7: Add foreign key constraints
ALTER TABLE "ingredient_categories" ADD CONSTRAINT "ingredient_categories_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "units_of_measure" ADD CONSTRAINT "units_of_measure_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prep_columns" ADD CONSTRAINT "prep_columns_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prep_tasks" ADD CONSTRAINT "prep_tasks_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menus" ADD CONSTRAINT "menus_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
