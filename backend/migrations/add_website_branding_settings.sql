-- Add website branding and theme customization fields to restaurant_settings
ALTER TABLE restaurant_settings 
ADD COLUMN IF NOT EXISTS website_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS tagline VARCHAR(500),
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20) DEFAULT '#1976d2',
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(20) DEFAULT '#dc004e',
ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20) DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS font_primary VARCHAR(100) DEFAULT 'Roboto, sans-serif',
ADD COLUMN IF NOT EXISTS font_secondary VARCHAR(100) DEFAULT 'Playfair Display, serif',
ADD COLUMN IF NOT EXISTS hero_image_public_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS about_image_public_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS logo_public_id VARCHAR(255);

-- Update existing record with default website name
UPDATE restaurant_settings 
SET website_name = 'Seabreeze Kitchen',
    tagline = 'Fresh, local ingredients meet culinary excellence'
WHERE restaurant_id = 1; 