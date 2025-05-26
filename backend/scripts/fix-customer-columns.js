#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load production environment
const prodEnvPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(prodEnvPath)) {
  console.error('❌ Production .env file not found');
  process.exit(1);
}

dotenv.config({ path: prodEnvPath });

const prisma = new PrismaClient();

async function addMissingColumns() {
  console.log('\n🔧 Adding Missing Columns to Customers Table');
  console.log('============================================\n');
  
  try {
    // Add missing columns that match the Prisma schema
    const columnsToAdd = [
      {
        name: 'email_verification_token',
        sql: 'ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);'
      },
      {
        name: 'email_verification_expires',
        sql: 'ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;'
      },
      {
        name: 'password_reset_token',
        sql: 'ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);'
      },
      {
        name: 'password_reset_expires',
        sql: 'ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;'
      },
      {
        name: 'last_login',
        sql: 'ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;'
      }
    ];
    
    for (const column of columnsToAdd) {
      console.log(`Adding column: ${column.name}`);
      try {
        await prisma.$executeRawUnsafe(column.sql);
        console.log(`  ✅ Added ${column.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  ${column.name} already exists`);
        } else {
          throw error;
        }
      }
    }
    
    // Copy data from old columns to new ones if they exist
    console.log('\nMigrating data from old columns...');
    
    await prisma.$executeRawUnsafe(`
      UPDATE customers 
      SET email_verification_token = verification_token
      WHERE verification_token IS NOT NULL
      AND email_verification_token IS NULL;
    `);
    console.log('  ✅ Copied verification_token data');
    
    await prisma.$executeRawUnsafe(`
      UPDATE customers 
      SET password_reset_token = reset_token,
          password_reset_expires = reset_token_expires
      WHERE reset_token IS NOT NULL
      AND password_reset_token IS NULL;
    `);
    console.log('  ✅ Copied reset_token data');
    
    console.log('\n✅ Column migration complete!');
    
    // Verify the columns exist
    const columns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'customers'
      AND column_name IN (
        'email_verification_token',
        'email_verification_expires', 
        'password_reset_token',
        'password_reset_expires',
        'last_login'
      );
    `;
    
    console.log(`\nVerified ${columns.length}/5 expected columns exist`);
    
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    throw error;
  }
}

async function main() {
  try {
    await addMissingColumns();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error); 