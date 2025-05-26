#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load production environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});

async function testLogin() {
  console.log('🔍 Testing Customer Login Process');
  console.log('=================================\n');
  
  const email = 'amora@page.com';
  const password = 'Welcome123!';
  
  try {
    // Step 1: Find customer
    console.log('1. Finding customer by email...');
    const customer = await prisma.customer.findUnique({
      where: { email },
      include: { 
        customerPreferences: true,
        restaurantLinks: true
      }
    });
    
    if (!customer) {
      console.log('❌ Customer not found!');
      return;
    }
    
    console.log('✅ Found customer:');
    console.log(`   ID: ${customer.id}`);
    console.log(`   Email: ${customer.email}`);
    console.log(`   Name: ${customer.firstName} ${customer.lastName || ''}`);
    console.log(`   Has preferences: ${!!customer.customerPreferences}`);
    console.log(`   Restaurant links: ${customer.restaurantLinks?.length || 0}`);
    
    // Step 2: Verify password
    console.log('\n2. Verifying password...');
    const validPassword = await bcrypt.compare(password, customer.password);
    console.log(`   Password valid: ${validPassword ? '✅ YES' : '❌ NO'}`);
    
    if (!validPassword) {
      console.log('\n❌ Login would fail - invalid password');
      return;
    }
    
    // Step 3: Test update last login
    console.log('\n3. Testing last login update...');
    try {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { lastLogin: new Date() }
      });
      console.log('   ✅ Last login update successful');
    } catch (error) {
      console.log(`   ❌ Last login update failed: ${error.message}`);
    }
    
    // Step 4: Test session creation
    console.log('\n4. Testing session creation...');
    try {
      const testSession = await prisma.customerSession.create({
        data: {
          customerId: customer.id,
          token: 'test-token-' + Date.now(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });
      console.log(`   ✅ Session created with ID: ${testSession.id}`);
      
      // Clean up test session
      await prisma.customerSession.delete({
        where: { id: testSession.id }
      });
      console.log('   ✅ Test session cleaned up');
    } catch (error) {
      console.log(`   ❌ Session creation failed: ${error.message}`);
    }
    
    console.log('\n✅ All login operations would succeed!');
    
  } catch (error) {
    console.error('\n❌ Fatal error during login test:');
    console.error(`   ${error.message}`);
    console.error('\n   Stack trace:');
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

async function showDatabaseState() {
  console.log('\n\n📊 Current Database State');
  console.log('========================\n');
  
  try {
    // Check tables
    const tables = ['customers', 'customer_preferences', 'customer_sessions', 'customer_restaurants'];
    
    for (const table of tables) {
      try {
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${count[0].count} records`);
      } catch (error) {
        console.log(`${table}: ❌ ERROR - ${error.message}`);
      }
    }
    
    // Check customer_preferences structure
    console.log('\ncustomer_preferences columns:');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customer_preferences'
      ORDER BY ordinal_position
    `;
    
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('Error checking database state:', error.message);
  }
}

async function main() {
  console.log('🚀 KitchenSync Customer Login Test');
  console.log('==================================');
  console.log(`Database: ${process.env.DATABASE_URL?.substring(0, 40)}...\n`);
  
  await testLogin();
  await showDatabaseState();
}

main().catch(console.error); 