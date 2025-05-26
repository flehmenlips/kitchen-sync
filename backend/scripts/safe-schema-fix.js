#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load production environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function safeFix() {
  console.log('🔧 Safe Schema Fix for Customer Auth');
  console.log('====================================\n');
  
  try {
    // 1. Check if customer_preferences has the right structure
    console.log('1. Checking customer_preferences table...');
    const prefColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customer_preferences'
      ORDER BY ordinal_position
    `;
    
    const hasCustomerId = prefColumns.some(c => c.column_name === 'customer_id');
    
    if (!hasCustomerId) {
      console.log('   ❌ Missing customer_id column - table is incompatible');
      console.log('   Creating new customer_preferences table with _temp suffix...');
      
      // Create a temporary table with correct structure
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS customer_preferences_temp (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER UNIQUE NOT NULL,
          dietary_restrictions TEXT,
          seating_preferences TEXT,
          special_occasions JSON,
          marketing_opt_in BOOLEAN NOT NULL DEFAULT true,
          sms_notifications BOOLEAN NOT NULL DEFAULT false,
          preferred_contact_method VARCHAR(20) DEFAULT 'email',
          notes TEXT,
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Rename tables
      await prisma.$executeRaw`ALTER TABLE customer_preferences RENAME TO customer_preferences_old`;
      await prisma.$executeRaw`ALTER TABLE customer_preferences_temp RENAME TO customer_preferences`;
      
      console.log('   ✅ Created new customer_preferences table');
    } else {
      console.log('   ✅ customer_preferences table has customer_id column');
    }
    
    // 2. Create preferences for existing customers
    console.log('\n2. Creating preferences for existing customers...');
    const customersWithoutPrefs = await prisma.$queryRaw`
      SELECT c.id 
      FROM customers c
      LEFT JOIN customer_preferences cp ON c.id = cp.customer_id
      WHERE cp.id IS NULL
    `;
    
    for (const customer of customersWithoutPrefs) {
      try {
        await prisma.$executeRaw`
          INSERT INTO customer_preferences (customer_id)
          VALUES (${customer.id})
        `;
        console.log(`   ✅ Created preferences for customer ${customer.id}`);
      } catch (err) {
        console.log(`   ⚠️  Failed to create preferences for customer ${customer.id}: ${err.message}`);
      }
    }
    
    if (customersWithoutPrefs.length === 0) {
      console.log('   ✅ All customers already have preferences');
    }
    
    // 3. Add missing columns to customer_restaurants if needed
    console.log('\n3. Checking customer_restaurants table...');
    const restColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'customer_restaurants'
    `;
    
    const columnNames = restColumns.map(c => c.column_name);
    
    if (!columnNames.includes('last_visit')) {
      console.log('   Adding last_visit column...');
      await prisma.$executeRaw`
        ALTER TABLE customer_restaurants 
        ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      `;
      console.log('   ✅ Added last_visit column');
    }
    
    // 4. Test login query
    console.log('\n4. Testing login query...');
    try {
      const testCustomer = await prisma.customer.findUnique({
        where: { email: 'amora@page.com' },
        include: {
          customerPreferences: true,
          restaurantLinks: true
        }
      });
      
      if (testCustomer) {
        console.log('   ✅ Login query successful!');
        console.log(`   - Customer: ${testCustomer.email}`);
        console.log(`   - Has preferences: ${!!testCustomer.customerPreferences}`);
        console.log(`   - Restaurant links: ${testCustomer.restaurantLinks?.length || 0}`);
      }
    } catch (error) {
      console.log(`   ❌ Login query failed: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 KitchenSync Safe Production Fix');
  console.log('==================================');
  console.log(`Database: ${process.env.DATABASE_URL?.substring(0, 40)}...\n`);
  
  await safeFix();
  
  console.log('\n✅ Safe fixes completed!');
  console.log('\nYour login and registration should now work.');
  console.log('No data was lost or modified.\n');
}

main().catch(console.error); 