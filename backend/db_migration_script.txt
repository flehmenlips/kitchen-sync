-- Add photo_public_id column to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS photo_public_id TEXT;

-- Update existing rows to have a null photo_public_id
UPDATE recipes
SET photo_public_id = NULL
WHERE photo_public_id IS NULL; 