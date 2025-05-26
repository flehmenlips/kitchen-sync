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
  console.log('\n🔍 Testing Customer Login');
  console.log('========================\n');
  
  try {
    // Test 1: Can we query customers table?
    console.log('1. Testing direct query to customers table...');
    const customerCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM customers`;
    console.log(`   ✅ Found ${customerCount[0].count} customers in database`);
    
    // Test 2: Can we use Prisma's customer model?
    console.log('\n2. Testing Prisma customer model...');
    try {
      const customer = await prisma.customer.findFirst();
      console.log(`   ✅ Prisma customer model works! Found: ${customer?.email || 'no customers'}`);
    } catch (error) {
      console.log(`   ❌ Prisma customer model error: ${error.message}`);
      console.log('      This means Prisma client needs regeneration on the server');
    }
    
    // Test 3: Check a specific customer
    console.log('\n3. Testing specific customer (amora@page.com)...');
    const testCustomer = await prisma.$queryRaw`
      SELECT id, email, password, first_name, last_name 
      FROM customers 
      WHERE email = 'amora@page.com'
    `;
    
    if (testCustomer.length > 0) {
      console.log(`   ✅ Found customer: ${testCustomer[0].email}`);
      console.log(`      ID: ${testCustomer[0].id}`);
      console.log(`      Name: ${testCustomer[0].first_name} ${testCustomer[0].last_name || ''}`);
      console.log(`      Password hash: ${testCustomer[0].password.substring(0, 20)}...`);
      
      // Test password
      const validPassword = await bcrypt.compare('Welcome123!', testCustomer[0].password);
      console.log(`      Password 'Welcome123!' valid: ${validPassword ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('   ❌ Customer not found');
    }
    
    // Test 4: Check related tables
    console.log('\n4. Testing related tables...');
    const tables = ['customer_preferences', 'customer_sessions', 'customer_restaurants'];
    for (const table of tables) {
      try {
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ✅ exists (${count[0].count} records)`);
      } catch (error) {
        console.log(`   ${table}: ❌ error - ${error.message}`);
      }
    }
    
    // Test 5: Check if we can create records
    console.log('\n5. Testing record creation...');
    try {
      // Try to find or create a test customer using raw SQL
      const email = 'test-diagnostic@example.com';
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      
      // Delete if exists
      await prisma.$executeRaw`DELETE FROM customers WHERE email = ${email}`;
      
      // Create new
      const newCustomer = await prisma.$queryRaw`
        INSERT INTO customers (email, password, first_name, last_name, restaurant_id)
        VALUES (${email}, ${hashedPassword}, 'Test', 'Diagnostic', 1)
        RETURNING id, email
      `;
      console.log(`   ✅ Successfully created test customer: ${newCustomer[0].email}`);
      
      // Clean up
      await prisma.$executeRaw`DELETE FROM customers WHERE email = ${email}`;
      console.log('   ✅ Cleaned up test customer');
      
    } catch (error) {
      console.log(`   ❌ Failed to create test customer: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkPrismaModels() {
  console.log('\n🔍 Checking Prisma Client Models');
  console.log('================================\n');
  
  try {
    const models = Object.keys(prisma).filter(key => 
      !key.startsWith('_') && 
      !key.startsWith('$') && 
      typeof prisma[key] === 'object'
    );
    
    console.log('Available models:');
    models.forEach(model => {
      console.log(`  - ${model}`);
    });
    
    if (!models.includes('customer')) {
      console.log('\n❌ CRITICAL: Customer model not found!');
      console.log('   The Prisma client on the server needs to be regenerated.');
      console.log('   Run "npx prisma generate" on the Render shell.');
    } else {
      console.log('\n✅ Customer model is available in Prisma client');
    }
    
  } catch (error) {
    console.error('Error checking models:', error);
  }
}

async function main() {
  console.log('🚀 KitchenSync Customer Auth Diagnostics');
  console.log('=======================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DATABASE_URL?.substring(0, 40)}...`);
  
  await checkPrismaModels();
  await testLogin();
  
  console.log('\n📊 Summary');
  console.log('==========');
  console.log('If the Prisma customer model is missing, you need to:');
  console.log('1. Go to Render.com → Backend service → Shell');
  console.log('2. Run: cd backend && npx prisma generate');
  console.log('3. Then restart the service: kill 1');
}

main().catch(console.error); 