-- Quick fix for customer login issues
-- Run this in Render shell with: psql $DATABASE_URL < quick-fix.sql

-- 1. Check current state
SELECT 'Current customer_preferences columns:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customer_preferences';

-- 2. Check if we have the wrong schema (user_id instead of customer_id)
DO $$
BEGIN
    -- Check if user_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_preferences' 
        AND column_name = 'user_id'
    ) THEN
        -- We have the wrong table structure, need to fix it
        RAISE NOTICE 'Found user_id column - fixing table structure...';
        
        -- Rename the old table
        ALTER TABLE customer_preferences RENAME TO customer_preferences_old;
        
        -- Create the correct table
        CREATE TABLE customer_preferences (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER UNIQUE NOT NULL,
            dietary_restrictions TEXT,
            seating_preferences TEXT,
            special_occasions JSON,
            marketing_opt_in BOOLEAN NOT NULL DEFAULT true,
            sms_notifications BOOLEAN NOT NULL DEFAULT false,
            preferred_contact_method VARCHAR(20) DEFAULT 'email',
            notes TEXT,
            created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Created new customer_preferences table';
    END IF;
END $$;

-- 3. Create preferences for all customers
INSERT INTO customer_preferences (customer_id)
SELECT id FROM customers
ON CONFLICT (customer_id) DO NOTHING;

-- 4. Show results
SELECT 'Customers with preferences:' as status;
SELECT c.id, c.email, 
       CASE WHEN cp.id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_preferences
FROM customers c
LEFT JOIN customer_preferences cp ON c.id = cp.customer_id;

-- 5. Add foreign key if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customer_preferences_customer_id_fkey'
    ) THEN
        ALTER TABLE customer_preferences 
        ADD CONSTRAINT customer_preferences_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
    END IF;
END $$;

SELECT 'Fix completed!' as status; 