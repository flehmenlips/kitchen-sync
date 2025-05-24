-- Add RestaurantSettings table for managing customer-facing content
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL UNIQUE,
    
    -- Hero Section
    hero_title VARCHAR(255),
    hero_subtitle VARCHAR(255),
    hero_image_url TEXT,
    hero_cta_text VARCHAR(255),
    hero_cta_link VARCHAR(255),
    
    -- About Section
    about_title VARCHAR(255),
    about_description TEXT,
    about_image_url TEXT,
    
    -- Contact Info
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    contact_address VARCHAR(255),
    contact_city VARCHAR(100),
    contact_state VARCHAR(50),
    contact_zip VARCHAR(20),
    
    -- Opening Hours (JSON)
    opening_hours JSONB,
    
    -- Social Media
    facebook_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    
    -- Menu Display Settings
    active_menu_ids INTEGER[] DEFAULT '{}',
    menu_display_mode VARCHAR(50) DEFAULT 'tabs',
    
    -- Footer
    footer_text TEXT,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_restaurant
        FOREIGN KEY(restaurant_id) 
        REFERENCES restaurants(id)
        ON DELETE CASCADE
);

-- Create index for restaurant_id
CREATE INDEX idx_restaurant_settings_restaurant_id ON restaurant_settings(restaurant_id);

-- Insert default settings for existing restaurants (if any)
INSERT INTO restaurant_settings (restaurant_id)
SELECT id FROM restaurants
WHERE NOT EXISTS (
    SELECT 1 FROM restaurant_settings WHERE restaurant_settings.restaurant_id = restaurants.id
);

-- For our single restaurant MVP (Seabreeze Kitchen)
-- This can be customized after running the migration
UPDATE restaurant_settings 
SET 
    hero_title = 'Welcome to Seabreeze Kitchen',
    hero_subtitle = 'Fresh, local ingredients meet culinary excellence',
    hero_cta_text = 'Make a Reservation',
    hero_cta_link = '/customer/reservations/new',
    about_title = 'About Seabreeze Kitchen',
    about_description = 'Located in the heart of Seaside Town, Seabreeze Kitchen brings you the freshest flavors of the coast. Our chefs work with local fishermen and farmers to source the finest ingredients, creating dishes that celebrate the bounty of the sea and land.',
    contact_phone = '(555) 123-4567',
    contact_email = 'info@seabreezekitchen.com',
    contact_address = '123 Ocean Drive',
    contact_city = 'Seaside Town',
    contact_state = 'CA',
    contact_zip = '90210',
    opening_hours = '{
        "monday": {"open": "11:00 AM", "close": "9:00 PM"},
        "tuesday": {"open": "11:00 AM", "close": "9:00 PM"},
        "wednesday": {"open": "11:00 AM", "close": "9:00 PM"},
        "thursday": {"open": "11:00 AM", "close": "9:00 PM"},
        "friday": {"open": "11:00 AM", "close": "10:00 PM"},
        "saturday": {"open": "11:00 AM", "close": "10:00 PM"},
        "sunday": {"open": "10:00 AM", "close": "9:00 PM"}
    }'::jsonb,
    footer_text = '© {year} Seabreeze Kitchen. All rights reserved.',
    updated_at = CURRENT_TIMESTAMP
WHERE restaurant_id = 1; 