-- SQL Script to add new customization columns to the menus table

ALTER TABLE menus ADD COLUMN IF NOT EXISTS logo_visible BOOLEAN DEFAULT true;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS logo_alignment VARCHAR(50) DEFAULT 'center';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS title_font_size VARCHAR(50) DEFAULT 'normal';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS subtitle_font_size VARCHAR(50) DEFAULT 'normal';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS section_font_size VARCHAR(50) DEFAULT 'normal';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS item_name_font_size VARCHAR(50) DEFAULT 'normal';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS item_desc_font_size VARCHAR(50) DEFAULT 'normal';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS section_divider_style VARCHAR(50) DEFAULT 'solid';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS section_divider_width VARCHAR(50) DEFAULT '1px';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS section_divider_color VARCHAR(50) DEFAULT '#333333';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS rich_text_enabled BOOLEAN DEFAULT false;

-- SQL Script to add text alignment columns to the menus table

ALTER TABLE menus ADD COLUMN IF NOT EXISTS title_alignment VARCHAR(50) DEFAULT 'center';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS subtitle_alignment VARCHAR(50) DEFAULT 'center';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS section_alignment VARCHAR(50) DEFAULT 'left';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS item_name_alignment VARCHAR(50) DEFAULT 'left';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS item_price_alignment VARCHAR(50) DEFAULT 'right';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS item_desc_alignment VARCHAR(50) DEFAULT 'left'; 