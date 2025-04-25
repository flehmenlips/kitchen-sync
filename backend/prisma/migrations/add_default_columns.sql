-- Create default columns for each user
INSERT INTO prep_columns (id, name, order, color, user_id, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    'To Prep',
    0,
    '#1976d2',
    id,
    NOW(),
    NOW()
FROM users
ON CONFLICT DO NOTHING;

INSERT INTO prep_columns (id, name, order, color, user_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'In Progress',
    1,
    '#ed6c02',
    id,
    NOW(),
    NOW()
FROM users
ON CONFLICT DO NOTHING;

INSERT INTO prep_columns (id, name, order, color, user_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Ready',
    2,
    '#2e7d32',
    id,
    NOW(),
    NOW()
FROM users
ON CONFLICT DO NOTHING;

-- Migrate existing tasks to the appropriate columns
WITH user_columns AS (
    SELECT 
        pc.id as column_id,
        pc.name,
        pc.user_id
    FROM prep_columns pc
)
UPDATE prep_tasks pt
SET column_id = uc.column_id
FROM user_columns uc
WHERE pt.user_id = uc.user_id
AND (
    (pt.status = 'TO_PREP' AND uc.name = 'To Prep') OR
    (pt.status = 'PREPPING' AND uc.name = 'In Progress') OR
    (pt.status = 'READY' AND uc.name = 'Ready')
); 