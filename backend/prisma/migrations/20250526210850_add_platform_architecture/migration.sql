/*
  Warnings:

  - A unique constraint covering the columns `[confirmation_code]` on the table `reservations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'BILLING');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'EMAIL_VERIFIED', 'INFO_SUBMITTED', 'PAYMENT_ADDED', 'VERIFIED', 'ACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ReservationSource" AS ENUM ('PLATFORM_WEB', 'PLATFORM_APP', 'RESTAURANT_WIDGET', 'RESTAURANT_STAFF', 'PHONE', 'WALK_IN');

-- CreateEnum
CREATE TYPE "ReservationOccasion" AS ENUM ('BIRTHDAY', 'ANNIVERSARY', 'DATE_NIGHT', 'BUSINESS_MEAL', 'SPECIAL_CELEBRATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'HIDDEN', 'REMOVED');

-- CreateEnum
CREATE TYPE "SpendingTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('RESERVATION_CONFIRMED', 'RESERVATION_REMINDER', 'RESERVATION_CANCELLED', 'REVIEW_REQUEST', 'MARKETING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "UsageMetric" AS ENUM ('RESERVATIONS', 'ACTIVE_STAFF', 'STORAGE_MB', 'API_CALLS');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('PLATFORM_ADMIN', 'RESTAURANT_USER', 'SYSTEM');

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "confirmation_code" TEXT,
ADD COLUMN     "deposit_amount" DECIMAL(10,2),
ADD COLUMN     "deposit_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deposit_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dietary_restrictions" TEXT[],
ADD COLUMN     "diner_id" INTEGER,
ADD COLUMN     "occasion" "ReservationOccasion",
ADD COLUMN     "platform_fee" DECIMAL(10,2),
ADD COLUMN     "platform_source" "ReservationSource" NOT NULL DEFAULT 'RESTAURANT_STAFF',
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "business_address" TEXT,
ADD COLUMN     "business_phone" TEXT,
ADD COLUMN     "onboarding_status" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "onboarding_steps" JSONB DEFAULT '{}',
ADD COLUMN     "owner_email" TEXT,
ADD COLUMN     "owner_name" TEXT,
ADD COLUMN     "suspended_at" TIMESTAMP(3),
ADD COLUMN     "suspended_reason" TEXT,
ADD COLUMN     "tax_id" TEXT,
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" INTEGER;

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" VARCHAR(50),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" TEXT,
    "email_verification_expires" TIMESTAMP(3),
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_restaurants" (
    "customer_id" INTEGER NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "first_visit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_visit" TIMESTAMP(3) NOT NULL,
    "visit_count" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(10,2),
    "notes" TEXT,
    "tags" TEXT[],
    "vip_status" BOOLEAN NOT NULL DEFAULT false,
    "preferences" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_restaurants_pkey" PRIMARY KEY ("customer_id","restaurant_id")
);

-- CreateTable
CREATE TABLE "customer_preferences" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "dietary_restrictions" TEXT,
    "seating_preferences" TEXT,
    "special_occasions" JSON,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT true,
    "sms_notifications" BOOLEAN NOT NULL DEFAULT false,
    "preferred_contact_method" VARCHAR(20) DEFAULT 'email',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_sessions" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_admins" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "PlatformRole" NOT NULL DEFAULT 'SUPPORT',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_actions" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" INTEGER,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diners" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" VARCHAR(50),
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "profile_photo" TEXT,
    "bio" TEXT,
    "email_opt_in" BOOLEAN NOT NULL DEFAULT true,
    "sms_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT true,
    "email_verification_token" TEXT,
    "email_verification_expires" TIMESTAMP(3),
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP(3),

    CONSTRAINT "diners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diner_sessions" (
    "id" SERIAL NOT NULL,
    "diner_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diner_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diner_restaurant_profiles" (
    "diner_id" INTEGER NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "internal_notes" TEXT,
    "tags" TEXT[],
    "vip_status" BOOLEAN NOT NULL DEFAULT false,
    "spending_tier" "SpendingTier",
    "total_reservations" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(10,2),
    "average_party_size" DOUBLE PRECISION,
    "no_show_count" INTEGER NOT NULL DEFAULT 0,
    "cancellation_count" INTEGER NOT NULL DEFAULT 0,
    "seating_preferences" TEXT,
    "allergy_notes" TEXT,
    "special_occasions" JSONB,
    "first_visit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_visit" TIMESTAMP(3),

    CONSTRAINT "diner_restaurant_profiles_pkey" PRIMARY KEY ("diner_id","restaurant_id")
);

-- CreateTable
CREATE TABLE "favorite_restaurants" (
    "diner_id" INTEGER NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_restaurants_pkey" PRIMARY KEY ("diner_id","restaurant_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "diner_id" INTEGER NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "food_rating" INTEGER,
    "service_rating" INTEGER,
    "ambiance_rating" INTEGER,
    "review_text" TEXT,
    "would_recommend" BOOLEAN,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderated_at" TIMESTAMP(3),
    "moderated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_points" (
    "id" SERIAL NOT NULL,
    "diner_id" INTEGER NOT NULL,
    "restaurant_id" INTEGER,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reservation_id" INTEGER,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "loyalty_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diner_notifications" (
    "id" SERIAL NOT NULL,
    "diner_id" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diner_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'TRIAL',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "stripe_customer_id" TEXT,
    "stripe_sub_id" TEXT,
    "current_period_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "trial_ends_at" TIMESTAMP(3),
    "seats" INTEGER NOT NULL DEFAULT 5,
    "billing_email" TEXT,
    "billing_name" TEXT,
    "billing_address" JSONB,
    "payment_method" JSONB,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "subscription_id" INTEGER NOT NULL,
    "stripe_invoice_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" SERIAL NOT NULL,
    "subscription_id" INTEGER NOT NULL,
    "metric" "UsageMetric" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_notes" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_to" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "sender_id" INTEGER,
    "sender_type" "SenderType" NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_restaurant_id_idx" ON "customers"("restaurant_id");

-- CreateIndex
CREATE INDEX "customer_restaurants_customer_id_idx" ON "customer_restaurants"("customer_id");

-- CreateIndex
CREATE INDEX "customer_restaurants_restaurant_id_idx" ON "customer_restaurants"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_preferences_customer_id_key" ON "customer_preferences"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_sessions_token_key" ON "customer_sessions"("token");

-- CreateIndex
CREATE INDEX "customer_sessions_token_idx" ON "customer_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "platform_admins_email_key" ON "platform_admins"("email");

-- CreateIndex
CREATE INDEX "platform_actions_admin_id_idx" ON "platform_actions"("admin_id");

-- CreateIndex
CREATE INDEX "platform_actions_entity_type_entity_id_idx" ON "platform_actions"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "diners_email_key" ON "diners"("email");

-- CreateIndex
CREATE INDEX "diners_email_idx" ON "diners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "diner_sessions_token_key" ON "diner_sessions"("token");

-- CreateIndex
CREATE INDEX "diner_sessions_token_idx" ON "diner_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_reservation_id_key" ON "reviews"("reservation_id");

-- CreateIndex
CREATE INDEX "reviews_restaurant_id_status_idx" ON "reviews"("restaurant_id", "status");

-- CreateIndex
CREATE INDEX "loyalty_points_diner_id_idx" ON "loyalty_points"("diner_id");

-- CreateIndex
CREATE INDEX "diner_notifications_diner_id_is_read_idx" ON "diner_notifications"("diner_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_restaurant_id_key" ON "subscriptions"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_sub_id_key" ON "subscriptions"("stripe_sub_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripe_invoice_id_key" ON "invoices"("stripe_invoice_id");

-- CreateIndex
CREATE INDEX "invoices_subscription_id_idx" ON "invoices"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "usage_records_subscription_id_metric_date_key" ON "usage_records"("subscription_id", "metric", "date");

-- CreateIndex
CREATE INDEX "restaurant_notes_restaurant_id_idx" ON "restaurant_notes"("restaurant_id");

-- CreateIndex
CREATE INDEX "support_tickets_restaurant_id_idx" ON "support_tickets"("restaurant_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "ticket_messages_ticket_id_idx" ON "ticket_messages"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_confirmation_code_key" ON "reservations"("confirmation_code");

-- CreateIndex
CREATE INDEX "reservations_diner_id_idx" ON "reservations"("diner_id");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_diner_id_fkey" FOREIGN KEY ("diner_id") REFERENCES "diners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "platform_actions" ADD CONSTRAINT "platform_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "platform_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diner_sessions" ADD CONSTRAINT "diner_sessions_diner_id_fkey" FOREIGN KEY ("diner_id") REFERENCES "diners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diner_restaurant_profiles" ADD CONSTRAINT "diner_restaurant_profiles_diner_id_fkey" FOREIGN KEY ("diner_id") REFERENCES "diners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diner_restaurant_profiles" ADD CONSTRAINT "diner_restaurant_profiles_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_restaurants" ADD CONSTRAINT "favorite_restaurants_diner_id_fkey" FOREIGN KEY ("diner_id") REFERENCES "diners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_restaurants" ADD CONSTRAINT "favorite_restaurants_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_diner_id_fkey" FOREIGN KEY ("diner_id") REFERENCES "diners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_points" ADD CONSTRAINT "loyalty_points_diner_id_fkey" FOREIGN KEY ("diner_id") REFERENCES "diners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_points" ADD CONSTRAINT "loyalty_points_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diner_notifications" ADD CONSTRAINT "diner_notifications_diner_id_fkey" FOREIGN KEY ("diner_id") REFERENCES "diners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_notes" ADD CONSTRAINT "restaurant_notes_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_notes" ADD CONSTRAINT "restaurant_notes_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "platform_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
