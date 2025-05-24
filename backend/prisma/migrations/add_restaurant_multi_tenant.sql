-- Add Restaurant table
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cuisine VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  opening_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add RestaurantStaff table
CREATE TABLE IF NOT EXISTS restaurant_staff (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'STAFF',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, restaurant_id)
);

-- Add indexes
CREATE INDEX idx_restaurant_staff_user_id ON restaurant_staff(user_id);
CREATE INDEX idx_restaurant_staff_restaurant_id ON restaurant_staff(restaurant_id);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);

-- Update users table for customer support
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_customer BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Update reservations table
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES users(id);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- Update orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE;

-- Update other tables to add restaurant_id
ALTER TABLE categories ADD COLUMN IF NOT EXISTS restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE units_of_measure ADD COLUMN IF NOT EXISTS restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE prep_columns ADD COLUMN IF NOT EXISTS restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE prep_tasks ADD COLUMN IF NOT EXISTS restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE;

-- Create indexes for restaurant_id
CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_categories_restaurant_id ON categories(restaurant_id);
CREATE INDEX idx_ingredients_restaurant_id ON ingredients(restaurant_id);
CREATE INDEX idx_units_restaurant_id ON units_of_measure(restaurant_id);
CREATE INDEX idx_recipes_restaurant_id ON recipes(restaurant_id);
CREATE INDEX idx_prep_columns_restaurant_id ON prep_columns(restaurant_id);
CREATE INDEX idx_prep_tasks_restaurant_id ON prep_tasks(restaurant_id);
CREATE INDEX idx_menus_restaurant_id ON menus(restaurant_id);

-- Insert a default restaurant for existing data (you'll need to update this)
INSERT INTO restaurants (name, slug, description) 
VALUES ('Default Restaurant', 'default-restaurant', 'Default restaurant for existing data')
ON CONFLICT (slug) DO NOTHING;

-- Get the default restaurant ID
DO $$
DECLARE
  default_restaurant_id INTEGER;
BEGIN
  SELECT id INTO default_restaurant_id FROM restaurants WHERE slug = 'default-restaurant';
  
  -- Update existing records to use the default restaurant
  -- Note: You may need to adjust these based on your actual data
  UPDATE categories SET restaurant_id = default_restaurant_id WHERE restaurant_id IS NULL;
  UPDATE ingredients SET restaurant_id = default_restaurant_id WHERE restaurant_id IS NULL;
  UPDATE units_of_measure SET restaurant_id = default_restaurant_id WHERE restaurant_id IS NULL;
  UPDATE recipes SET restaurant_id = default_restaurant_id WHERE restaurant_id IS NULL;
  UPDATE prep_columns SET restaurant_id = default_restaurant_id WHERE restaurant_id IS NULL;
  UPDATE prep_tasks SET restaurant_id = default_restaurant_id WHERE restaurant_id IS NULL;
  UPDATE menus SET restaurant_id = default_restaurant_id WHERE restaurant_id IS NULL;
END $$; 