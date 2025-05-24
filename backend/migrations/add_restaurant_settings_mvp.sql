-- Add RestaurantSettings table for managing customer-facing content (MVP version)
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL DEFAULT 1,
    
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for restaurant_id
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_restaurant_id ON restaurant_settings(restaurant_id);

-- Insert default settings for restaurant ID 1 if not exists
INSERT INTO restaurant_settings (
    restaurant_id,
    hero_title,
    hero_subtitle,
    hero_cta_text,
    hero_cta_link,
    about_title,
    about_description,
    contact_phone,
    contact_email,
    contact_address,
    contact_city,
    contact_state,
    contact_zip,
    opening_hours,
    footer_text
)
SELECT 
    1,
    'Welcome to Seabreeze Kitchen',
    'Fresh, local ingredients meet culinary excellence',
    'Make a Reservation',
    '/customer/reservations/new',
    'About Seabreeze Kitchen',
    'Located in the heart of Seaside Town, Seabreeze Kitchen brings you the freshest flavors of the coast. Our chefs work with local fishermen and farmers to source the finest ingredients, creating dishes that celebrate the bounty of the sea and land.',
    '(555) 123-4567',
    'info@seabreezekitchen.com',
    '123 Ocean Drive',
    'Seaside Town',
    'CA',
    '90210',
    '{
        "monday": {"open": "11:00 AM", "close": "9:00 PM"},
        "tuesday": {"open": "11:00 AM", "close": "9:00 PM"},
        "wednesday": {"open": "11:00 AM", "close": "9:00 PM"},
        "thursday": {"open": "11:00 AM", "close": "9:00 PM"},
        "friday": {"open": "11:00 AM", "close": "10:00 PM"},
        "saturday": {"open": "11:00 AM", "close": "10:00 PM"},
        "sunday": {"open": "10:00 AM", "close": "9:00 PM"}
    }'::jsonb,
    '© 2024 Seabreeze Kitchen. All rights reserved.'
WHERE NOT EXISTS (
    SELECT 1 FROM restaurant_settings WHERE restaurant_id = 1
); 