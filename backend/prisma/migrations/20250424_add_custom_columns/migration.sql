-- CreateTable
CREATE TABLE "prep_columns" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "color" VARCHAR(7) NOT NULL DEFAULT '#1976d2',
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prep_columns_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX "prep_columns_user_id_idx" ON "prep_columns"("user_id");
CREATE INDEX "prep_columns_order_idx" ON "prep_columns"("order");
CREATE UNIQUE INDEX "prep_columns_name_user_id_key" ON "prep_columns"("name", "user_id");

-- AddForeignKey
ALTER TABLE "prep_columns" ADD CONSTRAINT "prep_columns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create default columns for each user
INSERT INTO "prep_columns" ("id", "name", "order", "color", "user_id", "created_at", "updated_at")
SELECT 
    gen_random_uuid(), 'To Prep', 0, '#1976d2', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users";

INSERT INTO "prep_columns" ("id", "name", "order", "color", "user_id", "created_at", "updated_at")
SELECT 
    gen_random_uuid(), 'Prepping', 1, '#ed6c02', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users";

INSERT INTO "prep_columns" ("id", "name", "order", "color", "user_id", "created_at", "updated_at")
SELECT 
    gen_random_uuid(), 'Ready', 2, '#2e7d32', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users";

INSERT INTO "prep_columns" ("id", "name", "order", "color", "user_id", "created_at", "updated_at")
SELECT 
    gen_random_uuid(), 'Complete', 3, '#757575', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users";

-- Add column_id to prep_tasks
ALTER TABLE "prep_tasks" ADD COLUMN "column_id" TEXT;

-- Migrate existing tasks to their corresponding columns
WITH user_columns AS (
    SELECT id, user_id, name 
    FROM "prep_columns"
)
UPDATE "prep_tasks" pt
SET "column_id" = uc.id
FROM user_columns uc
WHERE pt.user_id = uc.user_id
AND (
    (pt.status = 'TO_PREP' AND uc.name = 'To Prep') OR
    (pt.status = 'PREPPING' AND uc.name = 'Prepping') OR
    (pt.status = 'READY' AND uc.name = 'Ready') OR
    (pt.status = 'COMPLETE' AND uc.name = 'Complete')
);

-- Make column_id required and add foreign key
ALTER TABLE "prep_tasks" ALTER COLUMN "column_id" SET NOT NULL;
ALTER TABLE "prep_tasks" ADD CONSTRAINT "prep_tasks_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "prep_columns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add index for column_id and order
CREATE INDEX "prep_tasks_column_id_idx" ON "prep_tasks"("column_id");
CREATE INDEX "prep_tasks_order_idx" ON "prep_tasks"("order");

-- Drop the status enum and column
ALTER TABLE "prep_tasks" DROP COLUMN "status"; 