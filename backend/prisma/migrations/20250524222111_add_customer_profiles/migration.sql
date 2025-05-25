-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "actual_arrival_time" TIMESTAMP(3),
ADD COLUMN     "actual_departure_time" TIMESTAMP(3),
ADD COLUMN     "confirmation_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "duration_minutes" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "guest_notes" TEXT,
ADD COLUMN     "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" VARCHAR(20) NOT NULL DEFAULT 'website',
ADD COLUMN     "table_ids" INTEGER[];

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "preferred_contact_method" VARCHAR(20) DEFAULT 'email',
    "dietary_restrictions" TEXT,
    "special_requests" TEXT,
    "vip_status" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "notes" TEXT,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT true,
    "birthday" DATE,
    "anniversary" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "device_info" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_logs" (
    "id" SERIAL NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(50) NOT NULL,
    "changes" JSON,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_reservations" (
    "id" SERIAL NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "guest_email" VARCHAR(255) NOT NULL,
    "guest_phone" VARCHAR(50),
    "conversion_token" VARCHAR(255),
    "converted_to_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_user_id_key" ON "customer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "customer_profiles_user_id_idx" ON "customer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "customer_profiles_vip_status_idx" ON "customer_profiles"("vip_status");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_token_idx" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "reservation_logs_reservation_id_idx" ON "reservation_logs"("reservation_id");

-- CreateIndex
CREATE INDEX "reservation_logs_user_id_idx" ON "reservation_logs"("user_id");

-- CreateIndex
CREATE INDEX "reservation_logs_action_idx" ON "reservation_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "guest_reservations_reservation_id_key" ON "guest_reservations"("reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "guest_reservations_conversion_token_key" ON "guest_reservations"("conversion_token");

-- CreateIndex
CREATE INDEX "guest_reservations_guest_email_idx" ON "guest_reservations"("guest_email");

-- CreateIndex
CREATE INDEX "guest_reservations_conversion_token_idx" ON "guest_reservations"("conversion_token");

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_logs" ADD CONSTRAINT "reservation_logs_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_logs" ADD CONSTRAINT "reservation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_reservations" ADD CONSTRAINT "guest_reservations_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_reservations" ADD CONSTRAINT "guest_reservations_converted_to_user_id_fkey" FOREIGN KEY ("converted_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
