-- DropForeignKey
ALTER TABLE "customer_preferences" DROP CONSTRAINT "customer_preferences_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_restaurants" DROP CONSTRAINT "customer_restaurants_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_restaurants" DROP CONSTRAINT "customer_restaurants_restaurant_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_sessions" DROP CONSTRAINT "customer_sessions_customer_id_fkey";

-- DropIndex
DROP INDEX "idx_customer_preferences_customer_id";

-- DropIndex
DROP INDEX "customer_restaurants_customer_id_restaurant_id_key";

-- DropIndex
DROP INDEX "idx_customer_sessions_customer_id";

-- AlterTable
ALTER TABLE "customer_preferences" ALTER COLUMN "customer_id" SET NOT NULL,
ALTER COLUMN "special_occasions" SET DATA TYPE JSON,
ALTER COLUMN "marketing_opt_in" SET NOT NULL,
ALTER COLUMN "sms_notifications" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "customer_restaurants" DROP CONSTRAINT "customer_restaurants_pkey",
DROP COLUMN "first_visit_date",
DROP COLUMN "id",
DROP COLUMN "last_visit_date",
ADD COLUMN     "first_visit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "preferences" JSON,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "vip_status" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "customer_id" SET NOT NULL,
ALTER COLUMN "restaurant_id" SET NOT NULL,
ALTER COLUMN "visit_count" SET NOT NULL,
ALTER COLUMN "total_spent" DROP DEFAULT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_visit" SET NOT NULL,
ALTER COLUMN "last_visit" DROP DEFAULT,
ALTER COLUMN "last_visit" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "customer_restaurants_pkey" PRIMARY KEY ("customer_id", "restaurant_id");

-- AlterTable
ALTER TABLE "customer_sessions" ALTER COLUMN "customer_id" SET NOT NULL,
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "reset_token",
DROP COLUMN "reset_token_expires",
DROP COLUMN "verification_token",
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "password" SET DATA TYPE TEXT,
ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "email_verified" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "email_verification_token" SET DATA TYPE TEXT,
ALTER COLUMN "email_verification_expires" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "password_reset_token" SET DATA TYPE TEXT,
ALTER COLUMN "password_reset_expires" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_login" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "restaurant_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "customers_restaurant_id_idx" ON "customers"("restaurant_id");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_restaurants" ADD CONSTRAINT "customer_restaurants_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_restaurants" ADD CONSTRAINT "customer_restaurants_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_preferences" ADD CONSTRAINT "customer_preferences_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_sessions" ADD CONSTRAINT "customer_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_customer_restaurants_customer_id" RENAME TO "customer_restaurants_customer_id_idx";

-- RenameIndex
ALTER INDEX "idx_customer_restaurants_restaurant_id" RENAME TO "customer_restaurants_restaurant_id_idx";

-- RenameIndex
ALTER INDEX "idx_customer_sessions_token" RENAME TO "customer_sessions_token_idx";

-- RenameIndex
ALTER INDEX "idx_customers_email" RENAME TO "customers_email_idx";

