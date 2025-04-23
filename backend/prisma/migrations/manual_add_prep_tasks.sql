-- CreateEnum
CREATE TYPE "PrepTaskStatus" AS ENUM ('TO_PREP', 'PREPPING', 'READY', 'COMPLETE');

-- CreateTable
CREATE TABLE "prep_tasks" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "PrepTaskStatus" NOT NULL DEFAULT 'TO_PREP',
    "recipe_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prep_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prep_tasks_user_id_idx" ON "prep_tasks"("user_id");

-- CreateIndex
CREATE INDEX "prep_tasks_recipe_id_idx" ON "prep_tasks"("recipe_id");

-- CreateIndex
CREATE INDEX "prep_tasks_status_idx" ON "prep_tasks"("status");

-- AddForeignKey
ALTER TABLE "prep_tasks" ADD CONSTRAINT "prep_tasks_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prep_tasks" ADD CONSTRAINT "prep_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; 