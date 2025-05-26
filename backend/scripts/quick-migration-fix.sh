#!/bin/bash

echo "🔧 Quick Migration Fix for KitchenSync"
echo "====================================="
echo ""
echo "This script will sync your production database with your Prisma schema."
echo ""

# Step 1: Backup current data
echo "Step 1: Creating backup of current data..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

(async () => {
  const backup = {
    timestamp: new Date().toISOString(),
    customers: await prisma.\$queryRaw\`SELECT * FROM customers\`,
    reservations: await prisma.\$queryRaw\`SELECT * FROM reservations WHERE customer_id IS NOT NULL\`
  };
  
  fs.writeFileSync('production-backup.json', JSON.stringify(backup, null, 2));
  console.log('✅ Backup saved to production-backup.json');
  console.log(\`   - \${backup.customers.length} customers\`);
  console.log(\`   - \${backup.reservations.length} customer reservations\`);
  
  await prisma.\$disconnect();
})();
"

echo ""
echo "Step 2: Fixing foreign key constraints..."

# Fix the customer_id foreign key in reservations table
psql $DATABASE_URL << 'EOF'
-- Fix reservations table to reference customers instead of users
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reservations_customer_id_fkey'
    AND table_name = 'reservations'
  ) THEN
    ALTER TABLE reservations DROP CONSTRAINT reservations_customer_id_fkey;
  END IF;
  
  -- Add new constraint pointing to customers table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    ALTER TABLE reservations 
    ADD CONSTRAINT reservations_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
    
    RAISE NOTICE '✅ Fixed customer_id foreign key';
  END IF;
END $$;

-- Show current foreign keys for verification
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'reservations'
AND kcu.column_name = 'customer_id';
EOF

echo ""
echo "Step 3: Syncing schema with Prisma..."
echo ""
echo "Run this command to sync your schema:"
echo "  npx prisma db push --skip-generate"
echo ""
echo "This will:"
echo "- Update column types to match Prisma schema"
echo "- Add any missing columns with proper defaults"
echo "- Fix any other schema mismatches"
echo ""
echo "✅ After running the command above, your migrations should be fixed!"
echo ""
echo "For permanent fix, update your Render build command to:"
echo "  cd backend && npm install && npx prisma generate && npx prisma migrate deploy" 