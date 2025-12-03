-- Migration: Add ReservationSettings and TimeSlotCapacity tables
-- Created: 2025-01-03

-- Create ReservationSettings table
CREATE TABLE IF NOT EXISTS "reservation_settings" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "operating_hours" JSONB NOT NULL DEFAULT '{}',
    "min_party_size" INTEGER NOT NULL DEFAULT 1,
    "max_party_size" INTEGER NOT NULL DEFAULT 20,
    "default_duration" INTEGER NOT NULL DEFAULT 90,
    "advance_booking_days" INTEGER NOT NULL DEFAULT 60,
    "min_advance_hours" INTEGER NOT NULL DEFAULT 2,
    "time_slot_interval" INTEGER NOT NULL DEFAULT 15,
    "seating_intervals" JSONB,
    "max_covers_per_slot" INTEGER,
    "allow_overbooking" BOOLEAN NOT NULL DEFAULT false,
    "overbooking_percentage" INTEGER NOT NULL DEFAULT 10,
    "cancellation_policy" TEXT,
    "cancellation_hours" INTEGER NOT NULL DEFAULT 24,
    "require_credit_card" BOOLEAN NOT NULL DEFAULT false,
    "require_deposit" BOOLEAN NOT NULL DEFAULT false,
    "deposit_amount" DECIMAL(10,2),
    "auto_confirm" BOOLEAN NOT NULL DEFAULT true,
    "send_confirmation" BOOLEAN NOT NULL DEFAULT true,
    "send_reminder" BOOLEAN NOT NULL DEFAULT true,
    "reminder_hours" INTEGER NOT NULL DEFAULT 24,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_settings_pkey" PRIMARY KEY ("id")
);

-- Create TimeSlotCapacity table
CREATE TABLE IF NOT EXISTS "time_slot_capacity" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "time_slot" VARCHAR(10) NOT NULL,
    "max_covers" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slot_capacity_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for reservation_settings.restaurant_id
CREATE UNIQUE INDEX IF NOT EXISTS "reservation_settings_restaurant_id_key" ON "reservation_settings"("restaurant_id");

-- Create unique constraint for time_slot_capacity (restaurant_id, day_of_week, time_slot)
CREATE UNIQUE INDEX IF NOT EXISTS "time_slot_capacity_restaurant_id_day_of_week_time_slot_key" ON "time_slot_capacity"("restaurant_id", "day_of_week", "time_slot");

-- Create indexes
CREATE INDEX IF NOT EXISTS "reservation_settings_restaurant_id_idx" ON "reservation_settings"("restaurant_id");
CREATE INDEX IF NOT EXISTS "time_slot_capacity_restaurant_id_idx" ON "time_slot_capacity"("restaurant_id");
CREATE INDEX IF NOT EXISTS "time_slot_capacity_day_of_week_idx" ON "time_slot_capacity"("day_of_week");

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reservation_settings_restaurant_id_fkey'
    ) THEN
        ALTER TABLE "reservation_settings" ADD CONSTRAINT "reservation_settings_restaurant_id_fkey" 
        FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'time_slot_capacity_restaurant_id_fkey'
    ) THEN
        ALTER TABLE "time_slot_capacity" ADD CONSTRAINT "time_slot_capacity_restaurant_id_fkey" 
        FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

