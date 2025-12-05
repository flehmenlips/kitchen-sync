-- Migration: Add time_slot_capacity table
-- Created: 2025-12-05
-- Description: Creates the time_slot_capacity table for managing capacity per time slot per day

-- CreateTable
CREATE TABLE IF NOT EXISTS "time_slot_capacity" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "time_slot" VARCHAR(10) NOT NULL,
    "max_covers" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_slot_capacity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "time_slot_capacity_restaurant_id_idx" ON "time_slot_capacity"("restaurant_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "time_slot_capacity_day_of_week_idx" ON "time_slot_capacity"("day_of_week");

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "time_slot_capacity_restaurant_id_day_of_week_time_slot_key" 
    ON "time_slot_capacity"("restaurant_id", "day_of_week", "time_slot");

-- AddForeignKey
ALTER TABLE "time_slot_capacity" 
    ADD CONSTRAINT "time_slot_capacity_restaurant_id_fkey" 
    FOREIGN KEY ("restaurant_id") 
    REFERENCES "restaurants"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

