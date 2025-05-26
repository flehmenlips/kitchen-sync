#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load production environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function createMissingTables() {
  console.log('🔧 Creating Missing Tables');
  console.log('=========================\n');
  
  try {
    // Check if customer_preferences exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customer_preferences'
      ) as exists
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ customer_preferences table already exists');
      return;
    }
    
    console.log('Creating customer_preferences table...');
    
    // Create the table
    await prisma.$executeRaw`
      CREATE TABLE customer_preferences (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        dietary_restrictions TEXT,
        seating_preferences TEXT,
        special_occasions JSONB,
        marketing_opt_in BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT false,
        preferred_contact_method VARCHAR(20) DEFAULT 'email',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Created customer_preferences table');
    
    // Create index
    await prisma.$executeRaw`
      CREATE INDEX idx_customer_preferences_customer_id 
      ON customer_preferences(customer_id)
    `;
    
    console.log('✅ Created index on customer_id');
    
    // Create preferences for existing customers
    const customers = await prisma.$queryRaw`SELECT id FROM customers`;
    
    for (const customer of customers) {
      await prisma.$executeRaw`
        INSERT INTO customer_preferences (customer_id)
        VALUES (${customer.id})
        ON CONFLICT (customer_id) DO NOTHING
      `;
    }
    
    console.log(`✅ Created preferences for ${customers.length} existing customers`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Also fix the customer_restaurants table
async function fixCustomerRestaurantsTable() {
  console.log('\n🔧 Fixing customer_restaurants table');
  console.log('===================================\n');
  
  try {
    // Check if last_visit column exists
    const columnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'customer_restaurants'
        AND column_name = 'last_visit'
      ) as exists
    `;
    
    if (!columnExists[0].exists) {
      console.log('Adding last_visit column with default value...');
      
      // Add the column with a default value
      await prisma.$executeRaw`
        ALTER TABLE customer_restaurants 
        ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `;
      
      // Update existing rows to use first_visit as last_visit
      await prisma.$executeRaw`
        UPDATE customer_restaurants 
        SET last_visit = COALESCE(first_visit, created_at, CURRENT_TIMESTAMP)
        WHERE last_visit IS NULL
      `;
      
      console.log('✅ Added last_visit column');
    } else {
      console.log('✅ last_visit column already exists');
    }
    
  } catch (error) {
    console.error('❌ Error fixing customer_restaurants:', error.message);
  }
}

async function main() {
  console.log('🚀 KitchenSync Table Fix Script');
  console.log('===============================');
  console.log(`Database: ${process.env.DATABASE_URL?.substring(0, 40)}...\n`);
  
  try {
    await createMissingTables();
    await fixCustomerRestaurantsTable();
    
    console.log('\n✅ All table fixes completed!');
    console.log('\nYour login and registration should now work.');
    
  } catch (error) {
    console.error('\n❌ Failed to complete fixes:', error);
    process.exit(1);
  }
}

main().catch(console.error); 