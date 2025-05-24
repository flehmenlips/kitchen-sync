/*
  Warnings:

  - A unique constraint covering the columns `[name,user_id,restaurant_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `restaurant_id` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEOUT', 'DELIVERY');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('STAFF', 'MANAGER', 'OWNER');

-- DropIndex
DROP INDEX "categories_name_user_id_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "restaurant_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "menu_description" TEXT,
ADD COLUMN     "menu_title" VARCHAR(255),
ADD COLUMN     "photo_public_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_customer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" VARCHAR(50);

-- CreateTable
CREATE TABLE "menus" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "font" TEXT DEFAULT 'Playfair Display',
    "layout" TEXT DEFAULT 'single',
    "show_dollar_sign" BOOLEAN NOT NULL DEFAULT true,
    "show_decimals" BOOLEAN NOT NULL DEFAULT true,
    "show_section_dividers" BOOLEAN NOT NULL DEFAULT true,
    "logo_path" TEXT,
    "logo_position" TEXT DEFAULT 'top',
    "logo_size" TEXT DEFAULT '200',
    "logo_offset" TEXT DEFAULT '0',
    "logo_visible" BOOLEAN NOT NULL DEFAULT true,
    "logo_alignment" TEXT DEFAULT 'center',
    "background_color" TEXT DEFAULT '#ffffff',
    "text_color" TEXT DEFAULT '#000000',
    "accent_color" TEXT DEFAULT '#333333',
    "title_font_size" TEXT DEFAULT 'normal',
    "subtitle_font_size" TEXT DEFAULT 'normal',
    "section_font_size" TEXT DEFAULT 'normal',
    "item_name_font_size" TEXT DEFAULT 'normal',
    "item_desc_font_size" TEXT DEFAULT 'normal',
    "section_divider_style" TEXT DEFAULT 'solid',
    "section_divider_width" TEXT DEFAULT '1px',
    "section_divider_color" TEXT DEFAULT '#333333',
    "rich_text_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_sections" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "menu_id" INTEGER NOT NULL,

    CONSTRAINT "menu_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "recipe_id" INTEGER,
    "section_id" INTEGER NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(50),
    "customer_email" VARCHAR(255),
    "customer_id" INTEGER,
    "restaurant_id" INTEGER NOT NULL,
    "party_size" INTEGER NOT NULL,
    "reservation_date" TIMESTAMP(3) NOT NULL,
    "reservation_time" VARCHAR(10) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "special_requests" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "order_number" VARCHAR(50) NOT NULL,
    "reservation_id" INTEGER,
    "restaurant_id" INTEGER NOT NULL,
    "customer_name" VARCHAR(255),
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "order_type" "OrderType" NOT NULL DEFAULT 'DINE_IN',
    "notes" TEXT,
    "total_amount" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "menu_item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,
    "modifiers" JSON,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cuisine" VARCHAR(100),
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(50),
    "zip_code" VARCHAR(20),
    "country" VARCHAR(100),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "website" TEXT,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "opening_hours" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_settings" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "website_name" TEXT,
    "tagline" TEXT,
    "logo_url" TEXT,
    "logo_public_id" TEXT,
    "hero_title" TEXT,
    "hero_subtitle" TEXT,
    "hero_image_url" TEXT,
    "hero_image_public_id" TEXT,
    "hero_cta_text" TEXT,
    "hero_cta_link" TEXT,
    "about_title" TEXT,
    "about_description" TEXT,
    "about_image_url" TEXT,
    "about_image_public_id" TEXT,
    "primary_color" TEXT DEFAULT '#1976d2',
    "secondary_color" TEXT DEFAULT '#dc004e',
    "accent_color" TEXT DEFAULT '#333333',
    "font_primary" TEXT DEFAULT 'Roboto, sans-serif',
    "font_secondary" TEXT DEFAULT 'Playfair Display, serif',
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "contact_address" TEXT,
    "contact_city" TEXT,
    "contact_state" TEXT,
    "contact_zip" TEXT,
    "opening_hours" JSONB,
    "facebook_url" TEXT,
    "instagram_url" TEXT,
    "twitter_url" TEXT,
    "active_menu_ids" INTEGER[],
    "menu_display_mode" TEXT DEFAULT 'tabs',
    "footer_text" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "page" VARCHAR(50) NOT NULL DEFAULT 'home',
    "block_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255),
    "subtitle" VARCHAR(500),
    "content" TEXT,
    "image_url" TEXT,
    "image_public_id" VARCHAR(255),
    "video_url" TEXT,
    "button_text" VARCHAR(100),
    "button_link" VARCHAR(255),
    "button_style" VARCHAR(50) DEFAULT 'primary',
    "settings" JSON DEFAULT '{}',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_staff" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'STAFF',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menus_user_id_idx" ON "menus"("user_id");

-- CreateIndex
CREATE INDEX "menu_sections_menu_id_idx" ON "menu_sections"("menu_id");

-- CreateIndex
CREATE INDEX "menu_sections_position_idx" ON "menu_sections"("position");

-- CreateIndex
CREATE INDEX "menu_items_section_id_idx" ON "menu_items"("section_id");

-- CreateIndex
CREATE INDEX "menu_items_recipe_id_idx" ON "menu_items"("recipe_id");

-- CreateIndex
CREATE INDEX "menu_items_position_idx" ON "menu_items"("position");

-- CreateIndex
CREATE INDEX "reservations_user_id_idx" ON "reservations"("user_id");

-- CreateIndex
CREATE INDEX "reservations_customer_id_idx" ON "reservations"("customer_id");

-- CreateIndex
CREATE INDEX "reservations_restaurant_id_idx" ON "reservations"("restaurant_id");

-- CreateIndex
CREATE INDEX "reservations_reservation_date_idx" ON "reservations"("reservation_date");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_restaurant_id_idx" ON "orders"("restaurant_id");

-- CreateIndex
CREATE INDEX "orders_reservation_id_idx" ON "orders"("reservation_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_menu_item_id_idx" ON "order_items"("menu_item_id");

-- CreateIndex
CREATE INDEX "order_items_status_idx" ON "order_items"("status");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");

-- CreateIndex
CREATE INDEX "restaurants_slug_idx" ON "restaurants"("slug");

-- CreateIndex
CREATE INDEX "restaurants_is_active_idx" ON "restaurants"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_settings_restaurant_id_key" ON "restaurant_settings"("restaurant_id");

-- CreateIndex
CREATE INDEX "content_blocks_restaurant_id_page_idx" ON "content_blocks"("restaurant_id", "page");

-- CreateIndex
CREATE INDEX "content_blocks_display_order_idx" ON "content_blocks"("display_order");

-- CreateIndex
CREATE INDEX "restaurant_staff_user_id_idx" ON "restaurant_staff"("user_id");

-- CreateIndex
CREATE INDEX "restaurant_staff_restaurant_id_idx" ON "restaurant_staff"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_staff_user_id_restaurant_id_key" ON "restaurant_staff"("user_id", "restaurant_id");

-- CreateIndex
CREATE INDEX "categories_restaurant_id_idx" ON "categories"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_user_id_restaurant_id_key" ON "categories"("name", "user_id", "restaurant_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_sections" ADD CONSTRAINT "menu_sections_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "menu_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_settings" ADD CONSTRAINT "restaurant_settings_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_staff" ADD CONSTRAINT "restaurant_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_staff" ADD CONSTRAINT "restaurant_staff_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
