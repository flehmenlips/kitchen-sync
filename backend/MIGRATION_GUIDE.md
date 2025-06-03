# Migration Guide: Modular Platform Restructure

## Overview
This migration adds support for:
- Module-based access control in subscriptions
- Enterprise features (multi-location support)
- Website builder functionality
- Chain restaurant management

## Pre-Migration Checklist
- [x] Database backup created: `kitchensync_prod_backup_20250601_213139.sql.gz`
- [ ] Migration SQL reviewed
- [ ] pgAdmin access confirmed
- [ ] Low-traffic period identified (if needed)

## Step-by-Step Instructions

### 1. Connect to pgAdmin
1. Open pgAdmin
2. Connect to your production database server
3. Navigate to: `Servers > Your Server > Databases > kitchensync_db_ikpj_n4yt`

### 2. Open Query Tool
1. Right-click on your database
2. Select "Query Tool"
3. A new query window will open

### 3. Apply the Migration
Copy and paste the following SQL into the Query Tool:

```sql
-- Migration: Modular Platform Restructure
-- This migration adds support for:
-- 1. Module-based access control in subscriptions
-- 2. Enterprise features (multi-location support)
-- 3. Website builder functionality
-- 4. Chain restaurant management

-- Add new fields to restaurants table for enterprise features
ALTER TABLE "restaurants" 
ADD COLUMN     "chain_name" VARCHAR(255),
ADD COLUMN     "chain_settings" JSONB,
ADD COLUMN     "custom_domain" VARCHAR(255),
ADD COLUMN     "is_chain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parent_restaurant_id" INTEGER,
ADD COLUMN     "website_builder_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "website_settings" JSONB;

-- Add new fields to subscriptions table for module access
ALTER TABLE "subscriptions" 
ADD COLUMN     "api_access" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "custom_domain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enabled_modules" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "max_customer_accounts" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "max_locations" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "max_staff_accounts" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "module_access" JSON,
ADD COLUMN     "priority_support" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "white_label" BOOLEAN NOT NULL DEFAULT false;

-- Create index for parent_restaurant_id for better query performance
CREATE INDEX "restaurants_parent_restaurant_id_idx" ON "restaurants"("parent_restaurant_id");

-- Add foreign key constraint for restaurant chains
ALTER TABLE "restaurants" 
ADD CONSTRAINT "restaurants_parent_restaurant_id_fkey" 
FOREIGN KEY ("parent_restaurant_id") 
REFERENCES "restaurants"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
```

### 4. Execute the Migration
1. Click the "Execute/Run" button (or press F5)
2. Wait for the query to complete
3. You should see a success message in the Messages tab

### 5. Verify the Migration

Run these verification queries to ensure the migration was successful:

```sql
-- Check restaurants table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'restaurants'
AND column_name IN ('is_chain', 'parent_restaurant_id', 'chain_name', 
                    'website_builder_enabled', 'custom_domain', 
                    'website_settings', 'chain_settings')
ORDER BY column_name;

-- Check subscriptions table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
AND column_name IN ('enabled_modules', 'module_access', 'max_locations',
                    'max_staff_accounts', 'max_customer_accounts', 
                    'custom_domain', 'priority_support', 'api_access', 
                    'white_label')
ORDER BY column_name;

-- Check if index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'restaurants'
AND indexname = 'restaurants_parent_restaurant_id_idx';

-- Check if foreign key was created
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conname = 'restaurants_parent_restaurant_id_fkey';
```

### 6. Update Prisma Migration History

To prevent Prisma from showing drift warnings, run this SQL to record the migration:

```sql
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
    '20250423230205',
    'manual_migration_checksum',
    NOW(),
    '20250423230205_modular_platform_restructure',
    NULL,
    NULL,
    NOW(),
    1
);
```

### 7. Test the Changes

Run a simple test query to ensure everything is working:

```sql
-- Test query to see default values
SELECT id, name, is_chain, website_builder_enabled
FROM restaurants
LIMIT 5;

-- Test subscription defaults
SELECT id, restaurant_id, plan, enabled_modules, max_locations, max_staff_accounts
FROM subscriptions
LIMIT 5;
```

## Rollback Plan (if needed)

If you need to rollback the migration, use this SQL:

```sql
-- Remove foreign key constraint
ALTER TABLE "restaurants" 
DROP CONSTRAINT IF EXISTS "restaurants_parent_restaurant_id_fkey";

-- Remove index
DROP INDEX IF EXISTS "restaurants_parent_restaurant_id_idx";

-- Remove columns from restaurants
ALTER TABLE "restaurants" 
DROP COLUMN IF EXISTS "chain_name",
DROP COLUMN IF EXISTS "chain_settings",
DROP COLUMN IF EXISTS "custom_domain",
DROP COLUMN IF EXISTS "is_chain",
DROP COLUMN IF EXISTS "parent_restaurant_id",
DROP COLUMN IF EXISTS "website_builder_enabled",
DROP COLUMN IF EXISTS "website_settings";

-- Remove columns from subscriptions
ALTER TABLE "subscriptions" 
DROP COLUMN IF EXISTS "api_access",
DROP COLUMN IF EXISTS "custom_domain",
DROP COLUMN IF EXISTS "enabled_modules",
DROP COLUMN IF EXISTS "max_customer_accounts",
DROP COLUMN IF EXISTS "max_locations",
DROP COLUMN IF EXISTS "max_staff_accounts",
DROP COLUMN IF EXISTS "module_access",
DROP COLUMN IF EXISTS "priority_support",
DROP COLUMN IF EXISTS "white_label";

-- Remove migration record
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20250423230205_modular_platform_restructure';
```

## Post-Migration Steps

1. **Update Application Code**: Deploy the updated application code that uses these new fields
2. **Monitor**: Watch application logs for any errors
3. **Update Documentation**: Document the new fields and their purposes
4. **Configure Modules**: Set up initial module configurations for existing restaurants

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Make sure you're using a database user with ALTER TABLE permissions
2. **Column Already Exists**: The migration may have been partially applied. Check which columns exist and modify the SQL accordingly
3. **Foreign Key Violation**: This shouldn't happen with our migration, but if it does, check for any NULL values in parent_restaurant_id

### Getting Help:

If you encounter any issues:
1. Take a screenshot of the error message
2. Note which step you were on
3. Check the application logs
4. The database backup can be restored if needed

## Success Criteria

The migration is successful when:
- [ ] All new columns are added to both tables
- [ ] The index is created
- [ ] The foreign key constraint is in place
- [ ] Verification queries return expected results
- [ ] Application continues to function normally
- [ ] No errors in application logs 