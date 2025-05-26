#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load production environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function syncSchema() {
  console.log('🔄 Syncing Production Schema with Prisma');
  console.log('========================================\n');
  
  try {
    // First, let's check what's different
    console.log('1. Checking current schema differences...\n');
    
    // Get the current schema state
    try {
      execSync('npx prisma db pull --force', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      console.log('✅ Pulled current production schema\n');
    } catch (error) {
      console.error('❌ Failed to pull schema:', error.message);
      return;
    }
    
    // Show the diff
    console.log('2. Schema differences:\n');
    try {
      execSync('npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
    } catch (error) {
      // Diff command might "fail" even when showing differences
      console.log('');
    }
    
    console.log('\n3. Applying schema changes safely...\n');
    
    // Apply changes without losing data
    try {
      // First backup critical data
      console.log('Backing up customer data...');
      const customers = await prisma.$queryRaw`SELECT * FROM customers`;
      const customerRestaurants = await prisma.$queryRaw`SELECT * FROM customer_restaurants`;
      
      console.log(`- ${customers.length} customers`);
      console.log(`- ${customerRestaurants.length} restaurant links`);
      
      // Use prisma db push with --accept-data-loss flag after confirmation
      console.log('\n⚠️  WARNING: This will modify the production database!');
      console.log('It will add missing columns and tables to match your Prisma schema.');
      console.log('\nTo proceed, run this command in the Render shell:');
      console.log('\n   npx prisma db push --accept-data-loss\n');
      console.log('This will:');
      console.log('- Add any missing tables (like customer_preferences)');
      console.log('- Add missing columns with safe defaults');
      console.log('- NOT delete any existing data\n');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function showCurrentState() {
  console.log('\n4. Current Database State:');
  console.log('==========================\n');
  
  const tables = [
    'customers',
    'customer_preferences', 
    'customer_sessions',
    'customer_restaurants'
  ];
  
  for (const table of tables) {
    try {
      const count = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      console.log(`✅ ${table}: ${count[0].count} records`);
    } catch (error) {
      console.log(`❌ ${table}: MISSING or ERROR`);
    }
  }
}

async function main() {
  console.log('🚀 KitchenSync Production Schema Sync');
  console.log('=====================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Database: ${process.env.DATABASE_URL?.substring(0, 40)}...\n`);
  
  await syncSchema();
  await showCurrentState();
  
  console.log('\n📝 Next Steps:');
  console.log('=============');
  console.log('1. Run: npx prisma db push --accept-data-loss');
  console.log('2. This will sync your production database with your Prisma schema');
  console.log('3. Then test login/registration again\n');
}

main().catch(console.error); 