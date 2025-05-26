#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load production environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function checkTableSchemas() {
  console.log('🔍 Checking Customer Table Schemas');
  console.log('==================================\n');
  
  try {
    // Check customer_preferences columns
    console.log('1. customer_preferences table columns:');
    const prefColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'customer_preferences'
      ORDER BY ordinal_position
    `;
    
    prefColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check if customer_id is correct type
    const customerIdCol = prefColumns.find(c => c.column_name === 'customer_id');
    if (!customerIdCol) {
      console.log('\n   ❌ MISSING customer_id column!');
    } else if (customerIdCol.data_type !== 'integer') {
      console.log(`\n   ⚠️  customer_id is ${customerIdCol.data_type}, expected integer`);
    }
    
    // Check customer_restaurants columns
    console.log('\n2. customer_restaurants table columns:');
    const restColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customer_restaurants'
      ORDER BY ordinal_position
    `;
    
    restColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Test if we can insert into customer_preferences
    console.log('\n3. Testing customer_preferences insert...');
    try {
      // First check if there are any records
      const existingPrefs = await prisma.$queryRaw`
        SELECT customer_id FROM customer_preferences
      `;
      console.log(`   Found ${existingPrefs.length} existing preference records`);
      
      // Get customers without preferences
      const customersWithoutPrefs = await prisma.$queryRaw`
        SELECT c.id 
        FROM customers c
        LEFT JOIN customer_preferences cp ON c.id = cp.customer_id
        WHERE cp.id IS NULL
      `;
      
      if (customersWithoutPrefs.length > 0) {
        console.log(`   Found ${customersWithoutPrefs.length} customers without preferences`);
        
        // Try to create preferences for one
        const testCustomerId = customersWithoutPrefs[0].id;
        await prisma.customerPreferences.create({
          data: {
            customerId: testCustomerId
          }
        });
        console.log(`   ✅ Successfully created preferences for customer ${testCustomerId}`);
      } else {
        console.log('   ✅ All customers already have preferences');
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to insert: ${error.message}`);
      console.log('      This is likely why registration is failing!');
    }
    
    // Test actual login flow
    console.log('\n4. Testing login flow...');
    try {
      const testCustomer = await prisma.customer.findUnique({
        where: { email: 'amora@page.com' },
        include: {
          customerPreferences: true,
          restaurantLinks: true
        }
      });
      
      if (testCustomer) {
        console.log(`   ✅ Found customer with email: ${testCustomer.email}`);
        console.log(`   - Has preferences: ${!!testCustomer.customerPreferences}`);
        console.log(`   - Restaurant links: ${testCustomer.restaurantLinks?.length || 0}`);
      } else {
        console.log('   ❌ Customer not found');
      }
      
    } catch (error) {
      console.log(`   ❌ Login query failed: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 KitchenSync Schema Check');
  console.log('===========================');
  console.log(`Database: ${process.env.DATABASE_URL?.substring(0, 40)}...\n`);
  
  await checkTableSchemas();
}

main().catch(console.error); 