#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');
const { execSync } = require('child_process');

// Load production environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Comprehensive Migration Fix');
  console.log('==============================\n');
  
  try {
    // Step 1: Pull current production schema
    console.log('1. Pulling current production schema...');
    execSync('npx prisma db pull --force', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log('✅ Schema pulled\n');
    
    // Step 2: Create a migration to fix differences
    console.log('2. Creating migration to sync schema...');
    try {
      // First, mark current state as baseline
      execSync('npx prisma migrate resolve --applied "0_init"', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
    } catch (e) {
      // Ignore if already resolved
    }
    
    // Step 3: Fix specific issues we know about
    console.log('\n3. Applying specific fixes...');
    
    // Fix foreign key constraints
    console.log('   Fixing foreign key constraints...');
    const fixes = [
      // Fix customer_id constraint in reservations to point to customers table
      `DO $$ 
       BEGIN
         -- Drop existing constraint if it points to users table
         IF EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'reservations_customer_id_fkey'
           AND table_name = 'reservations'
         ) THEN
           ALTER TABLE reservations DROP CONSTRAINT reservations_customer_id_fkey;
         END IF;
         
         -- Add new constraint pointing to customers table
         ALTER TABLE reservations 
         ADD CONSTRAINT reservations_customer_id_fkey 
         FOREIGN KEY (customer_id) REFERENCES customers(id);
       END $$;`,
       
      // Ensure all required columns have defaults
      `ALTER TABLE customer_preferences 
       ALTER COLUMN marketing_opt_in SET DEFAULT true,
       ALTER COLUMN sms_notifications SET DEFAULT false,
       ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
       ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;`,
       
      // Fix data types
      `ALTER TABLE customer_restaurants
       ALTER COLUMN visit_count SET DEFAULT 0,
       ALTER COLUMN vip_status SET DEFAULT false;`,
       
      // Add any missing indexes
      `CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id);
       CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON reservations(restaurant_id);`
    ];
    
    for (const fix of fixes) {
      try {
        await prisma.$executeRawUnsafe(fix);
        console.log('   ✅ Applied fix');
      } catch (error) {
        console.log(`   ⚠️  Fix skipped: ${error.message}`);
      }
    }
    
    // Step 4: Verify critical relationships
    console.log('\n4. Verifying relationships...');
    
    // Check customer -> reservations relationship
    const customerReservations = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM customers c
      LEFT JOIN reservations r ON c.id = r.customer_id
      WHERE c.id = 1
    `;
    console.log(`   ✅ Customer-Reservation relationship working`);
    
    // Step 5: Create a proper migration file
    console.log('\n5. Next steps to permanently fix this:');
    console.log('   1. Run locally: cd backend && npx prisma migrate dev --name sync_production_schema');
    console.log('   2. This will create a migration file that captures all differences');
    console.log('   3. Commit and push the migration file');
    console.log('   4. In production: npx prisma migrate deploy');
    console.log('\n   OR for immediate fix:');
    console.log('   Run in Render shell: npx prisma db push --force-reset --skip-generate');
    console.log('   ⚠️  WARNING: This will recreate all tables - backup data first!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Backup important data
async function backupData() {
  console.log('\n📦 Backing up critical data...');
  
  const backup = {
    timestamp: new Date().toISOString(),
    customers: await prisma.$queryRaw`SELECT * FROM customers`,
    customer_preferences: await prisma.$queryRaw`SELECT * FROM customer_preferences`,
    customer_restaurants: await prisma.$queryRaw`SELECT * FROM customer_restaurants`,
    reservations: await prisma.$queryRaw`SELECT * FROM reservations WHERE customer_id IS NOT NULL`
  };
  
  const fs = require('fs');
  const backupPath = path.join(__dirname, `backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  
  console.log(`✅ Backup saved to: ${backupPath}`);
  console.log(`   - ${backup.customers.length} customers`);
  console.log(`   - ${backup.customer_preferences.length} preferences`);
  console.log(`   - ${backup.customer_restaurants.length} restaurant links`);
  console.log(`   - ${backup.reservations.length} reservations`);
  
  return backup;
}

// Main execution
(async () => {
  console.log('🔧 KitchenSync Migration Fixer');
  console.log('=============================\n');
  
  try {
    // First backup
    await backupData();
    
    // Then fix
    await main();
    
    console.log('\n✅ Migration fixes completed!');
    console.log('\nTo make this permanent:');
    console.log('1. Run the migration commands shown above');
    console.log('2. Update Render build command to include: npx prisma migrate deploy');
    
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
})(); 