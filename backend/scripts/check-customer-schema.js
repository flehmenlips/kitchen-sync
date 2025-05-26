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

async function checkCustomerSchema() {
  console.log('\n📊 Checking Customer Table Schema');
  console.log('=================================\n');
  
  try {
    // Get column information for customers table
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'customers'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('Columns in customers table:');
    console.log('---------------------------');
    columns.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check for specific columns the controller expects
    console.log('\n\nChecking for expected columns:');
    console.log('------------------------------');
    
    const expectedColumns = [
      'email_verification_token',
      'email_verification_expires',
      'password_reset_token',
      'password_reset_expires',
      'last_login'
    ];
    
    for (const colName of expectedColumns) {
      const exists = columns.some(col => col.column_name === colName);
      console.log(`${colName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }
    
    // Check sample data
    console.log('\n\nSample customer data:');
    console.log('---------------------');
    const customers = await prisma.$queryRaw`
      SELECT id, email, password, created_at
      FROM customers
      LIMIT 5;
    `;
    
    customers.forEach(customer => {
      console.log(`ID: ${customer.id}, Email: ${customer.email}, Password: ${customer.password.substring(0, 20)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
    throw error;
  }
}

async function main() {
  try {
    await checkCustomerSchema();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error); 