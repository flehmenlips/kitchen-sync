-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "chain_name" VARCHAR(255),
ADD COLUMN     "chain_settings" JSONB,
ADD COLUMN     "custom_domain" VARCHAR(255),
ADD COLUMN     "is_chain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parent_restaurant_id" INTEGER,
ADD COLUMN     "website_builder_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "website_settings" JSONB;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "api_access" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "custom_domain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enabled_modules" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "max_customer_accounts" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "max_locations" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "max_staff_accounts" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "module_access" JSON,
ADD COLUMN     "priority_support" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "white_label" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "restaurants_parent_restaurant_id_idx" ON "restaurants"("parent_restaurant_id");

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_parent_restaurant_id_fkey" FOREIGN KEY ("parent_restaurant_id") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

