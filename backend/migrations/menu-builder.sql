-- Menu Builder tables creation script
-- This script should be run on your production PostgreSQL database
-- For example, using the Render database console or psql

-- Create menus table
CREATE TABLE IF NOT EXISTS "menus" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "title" TEXT,
  "subtitle" TEXT,
  "font" TEXT DEFAULT 'Playfair Display',
  "layout" TEXT DEFAULT 'single',
  "show_dollar_sign" BOOLEAN DEFAULT true,
  "show_decimals" BOOLEAN DEFAULT true,
  "show_section_dividers" BOOLEAN DEFAULT true,
  "logo_path" TEXT,
  "logo_position" TEXT DEFAULT 'top',
  "logo_size" TEXT DEFAULT '200',
  "logo_offset" TEXT DEFAULT '0',
  "background_color" TEXT DEFAULT '#ffffff',
  "text_color" TEXT DEFAULT '#000000',
  "accent_color" TEXT DEFAULT '#333333',
  "is_archived" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "user_id" INTEGER NOT NULL
);

-- Create menu_sections table
CREATE TABLE IF NOT EXISTS "menu_sections" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "position" INTEGER DEFAULT 0,
  "active" BOOLEAN DEFAULT true,
  "menu_id" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS "menu_items" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price" TEXT,
  "position" INTEGER DEFAULT 0,
  "active" BOOLEAN DEFAULT true,
  "recipe_id" INTEGER,
  "section_id" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE "menus" ADD CONSTRAINT "menus_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "menu_sections" ADD CONSTRAINT "menu_sections_menu_id_fkey" 
  FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE;

ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_section_id_fkey"
  FOREIGN KEY ("section_id") REFERENCES "menu_sections"("id") ON DELETE CASCADE;

ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_recipe_id_fkey"
  FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "menus_user_id_idx" ON "menus"("user_id");
CREATE INDEX IF NOT EXISTS "menu_sections_menu_id_idx" ON "menu_sections"("menu_id");
CREATE INDEX IF NOT EXISTS "menu_sections_position_idx" ON "menu_sections"("position");
CREATE INDEX IF NOT EXISTS "menu_items_section_id_idx" ON "menu_items"("section_id");
CREATE INDEX IF NOT EXISTS "menu_items_recipe_id_idx" ON "menu_items"("recipe_id");
CREATE INDEX IF NOT EXISTS "menu_items_position_idx" ON "menu_items"("position"); 