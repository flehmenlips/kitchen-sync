-- Customer Separation Migration
-- This migration separates customers from users into their own table

-- Step 1: Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL DEFAULT 1,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_restaurant ON customers(restaurant_id);

-- Step 2: Create customer_preferences table
CREATE TABLE IF NOT EXISTS customer_preferences (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  dietary_restrictions TEXT,
  seating_preferences TEXT,
  special_occasions JSONB,
  marketing_opt_in BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  preferred_contact_method VARCHAR(20) DEFAULT 'email',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create customer_sessions table
CREATE TABLE IF NOT EXISTS customer_sessions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_sessions_token ON customer_sessions(token);

-- Step 4: Migrate existing customer data from users table
INSERT INTO customers (
  email, 
  password, 
  first_name, 
  last_name, 
  phone, 
  email_verified, 
  created_at, 
  updated_at
)
SELECT 
  u.email,
  u.password,
  SPLIT_PART(u.name, ' ', 1) as first_name,
  CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(u.name, ' '), 1) > 1 
    THEN SUBSTR(u.name, LENGTH(SPLIT_PART(u.name, ' ', 1)) + 2)
    ELSE NULL
  END as last_name,
  u.phone,
  COALESCE(cp.email_verified, false),
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN customer_profiles cp ON u.id = cp.user_id
WHERE u.is_customer = true;

-- Step 5: Migrate customer preferences
INSERT INTO customer_preferences (
  customer_id,
  dietary_restrictions,
  notes,
  marketing_opt_in,
  preferred_contact_method,
  created_at,
  updated_at
)
SELECT 
  c.id,
  cp.dietary_restrictions,
  cp.notes,
  cp.marketing_opt_in,
  cp.preferred_contact_method,
  cp.created_at,
  cp.updated_at
FROM customers c
JOIN users u ON c.email = u.email
JOIN customer_profiles cp ON u.id = cp.user_id;

-- Step 6: Add customer_id column to reservations (temporary, for migration)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS new_customer_id INTEGER REFERENCES customers(id);

-- Step 7: Update reservations to use new customer_id
UPDATE reservations r
SET new_customer_id = c.id
FROM customers c
JOIN users u ON u.email = c.email
WHERE r.customer_id = u.id AND u.is_customer = true;

-- Step 8: Add customer_id column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id);

-- Step 9: Update orders that belong to customers
UPDATE orders o
SET customer_id = c.id
FROM customers c
JOIN users u ON u.email = c.email
JOIN reservations r ON r.user_id = u.id
WHERE o.reservation_id = r.id AND u.is_customer = true;

-- Step 10: Update restaurant table to include customer relation (for future multi-tenant)
-- No action needed in SQL, this is handled by Prisma schema

-- Step 11: Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_preferences_updated_at BEFORE UPDATE ON customer_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: The following steps should be done after verifying data migration:
-- 1. Drop the old customer_id column from reservations (after renaming new_customer_id)
-- 2. Remove is_customer column from users table
-- 3. Drop customer_profiles table
-- 4. Update all foreign key constraints 