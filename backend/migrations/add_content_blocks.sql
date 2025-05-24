-- Create content_blocks table
CREATE TABLE IF NOT EXISTS content_blocks (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  page VARCHAR(50) NOT NULL DEFAULT 'home', -- home, about, contact, etc.
  block_type VARCHAR(50) NOT NULL, -- text, html, image, video, cta, hero, features, etc.
  title VARCHAR(255),
  subtitle VARCHAR(500),
  content TEXT,
  image_url TEXT,
  image_public_id VARCHAR(255),
  video_url TEXT,
  button_text VARCHAR(100),
  button_link VARCHAR(255),
  button_style VARCHAR(50) DEFAULT 'primary', -- primary, secondary, outlined
  settings JSONB DEFAULT '{}', -- Additional settings specific to block type
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_content_blocks_restaurant_page ON content_blocks(restaurant_id, page);
CREATE INDEX idx_content_blocks_display_order ON content_blocks(display_order);

-- Add sample content blocks for restaurant ID 1
INSERT INTO content_blocks (restaurant_id, page, block_type, title, subtitle, content, button_text, button_link, display_order) VALUES
(1, 'home', 'cta', 'Ready to Experience Our Cuisine?', 'Book your table today and join us for an unforgettable dining experience.', NULL, 'Make a Reservation', '/customer/reservations/new', 100); 