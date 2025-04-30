-- Add photo_public_id column to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS photo_public_id TEXT;

-- Update any existing photos (optional, this would be done by the migration script)
-- UPDATE recipes SET photo_public_id = NULL WHERE photo_url IS NOT NULL; 