-- Add menu_title and menu_description columns to recipes table
ALTER TABLE "recipes" 
ADD COLUMN IF NOT EXISTS "menu_title" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "menu_description" TEXT; 