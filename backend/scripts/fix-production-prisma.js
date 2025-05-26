#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load production environment
const prodEnvPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(prodEnvPath)) {
  console.error('❌ Production .env file not found');
  process.exit(1);
}

dotenv.config({ path: prodEnvPath });

async function checkPrismaClient() {
  console.log('\n🔍 Checking Prisma Client');
  console.log('========================\n');
  
  try {
    // Check if Prisma client has Customer model
    const prisma = new PrismaClient();
    
    console.log('Available Prisma models:');
    const models = Object.keys(prisma).filter(key => 
      !key.startsWith('_') && 
      !key.startsWith('$') && 
      typeof prisma[key] === 'object'
    );
    
    models.forEach(model => console.log(`  - ${model}`));
    
    if (!models.includes('customer')) {
      console.log('\n❌ Customer model not found in Prisma client!');
      console.log('This means Prisma needs to be regenerated.');
      return false;
    }
    
    console.log('\n✅ Customer model found in Prisma client');
    
    // Test if we can query customers
    try {
      const count = await prisma.customer.count();
      console.log(`✅ Can query customers table (found ${count} customers)`);
    } catch (error) {
      console.log('❌ Error querying customers:', error.message);
      return false;
    }
    
    await prisma.$disconnect();
    return true;
    
  } catch (error) {
    console.error('❌ Error checking Prisma client:', error);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n🔍 Testing Direct Database Connection');
  console.log('====================================\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Test raw query
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM customers`;
    console.log(`✅ Direct query successful: ${result[0].count} customers in database`);
    
    // Check all customer-related tables
    const tables = ['customers', 'customer_preferences', 'customer_sessions', 'customer_restaurants'];
    
    for (const table of tables) {
      const exists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        ) as exists
      `;
      console.log(`  ${table}: ${exists[0].exists ? '✅ exists' : '❌ missing'}`);
    }
    
    await prisma.$disconnect();
    return true;
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    await prisma.$disconnect();
    return false;
  }
}

async function regeneratePrismaClient() {
  console.log('\n🔧 Regenerating Prisma Client');
  console.log('=============================\n');
  
  try {
    console.log('Running prisma generate...');
    execSync('npx prisma generate', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit' 
    });
    console.log('✅ Prisma client regenerated');
    return true;
  } catch (error) {
    console.error('❌ Failed to regenerate Prisma client:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 KitchenSync Production Prisma Fix');
  console.log('====================================');
  
  // Test database connection first
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    console.log('\n❌ Database connection issues detected');
    process.exit(1);
  }
  
  // Check Prisma client
  const prismaOk = await checkPrismaClient();
  
  if (!prismaOk) {
    console.log('\n⚠️  Prisma client needs to be regenerated');
    
    // Try to regenerate
    const regenOk = await regeneratePrismaClient();
    
    if (regenOk) {
      // Test again
      const retestOk = await checkPrismaClient();
      if (retestOk) {
        console.log('\n✅ Prisma client fixed!');
      } else {
        console.log('\n❌ Prisma client still has issues after regeneration');
        console.log('\nPossible solutions:');
        console.log('1. Make sure prisma schema matches the database');
        console.log('2. Run "prisma db pull" to sync schema with database');
        console.log('3. Restart the application after regenerating');
      }
    }
  } else {
    console.log('\n✅ Prisma client is properly configured');
    
    // Do a test login
    console.log('\n🔍 Testing customer operations...');
    const prisma = new PrismaClient();
    
    try {
      const customer = await prisma.customer.findFirst({
        include: {
          customerPreferences: true,
          restaurantLinks: true
        }
      });
      
      if (customer) {
        console.log(`✅ Found customer: ${customer.email}`);
        console.log(`  - Has preferences: ${!!customer.customerPreferences}`);
        console.log(`  - Restaurant links: ${customer.restaurantLinks?.length || 0}`);
      }
      
    } catch (error) {
      console.error('❌ Error testing customer operations:', error.message);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  console.log('\n📊 Summary');
  console.log('==========');
  console.log(`Database connection: ${dbOk ? '✅' : '❌'}`);
  console.log(`Prisma client: ${prismaOk ? '✅' : '❌'}`);
}

main().catch(console.error); 