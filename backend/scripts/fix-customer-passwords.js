#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
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

// Check if we're actually connected to production
async function checkEnvironment() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl.includes('render') && !databaseUrl.includes('production')) {
    console.error('❌ This script should only be run against production database');
    console.error('Current DATABASE_URL:', databaseUrl.substring(0, 30) + '...');
    process.exit(1);
  }
  
  console.log('✅ Connected to production database');
}

async function fixCustomerPasswords() {
  console.log('\n🔧 Fixing Customer Passwords');
  console.log('============================\n');
  
  try {
    // Get all customers with the migration marker password
    const customersToFix = await prisma.$queryRaw`
      SELECT id, email, password 
      FROM customers 
      WHERE password = 'MIGRATED_TO_CUSTOMERS_TABLE'
      OR password NOT LIKE '$2a$%'
      OR password NOT LIKE '$2b$%'
    `;
    
    console.log(`Found ${customersToFix.length} customers with invalid passwords\n`);
    
    if (customersToFix.length === 0) {
      console.log('✅ No customers need password fixes');
      return;
    }
    
    // Create a temporary password mapping file
    const passwordMap = [];
    
    for (const customer of customersToFix) {
      // Generate a temporary password
      const tempPassword = 'Welcome123!'; // Simple default password
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      console.log(`Fixing password for: ${customer.email}`);
      
      // Update the customer's password
      await prisma.$executeRawUnsafe(`
        UPDATE customers 
        SET password = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, hashedPassword, customer.id);
      
      passwordMap.push({
        email: customer.email,
        tempPassword: tempPassword,
        instructions: 'Please change this password after first login'
      });
      
      console.log(`  ✅ Password updated`);
    }
    
    // Save password mapping
    const outputPath = path.join(__dirname, `customer-passwords-${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(passwordMap, null, 2));
    
    console.log(`\n✅ Password reset complete!`);
    console.log(`📄 Password mapping saved to: ${outputPath}`);
    console.log('\n⚠️  IMPORTANT: Share these temporary passwords with customers securely');
    console.log('⚠️  Customers should change their passwords after first login\n');
    
    // Note: The schema uses different column names than the controller expects
    // This might need to be fixed in the controller or schema
    
    // Show the password mapping
    console.log('Customer Temporary Passwords:');
    console.log('=============================');
    passwordMap.forEach(({ email, tempPassword }) => {
      console.log(`${email}: ${tempPassword}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
    throw error;
  }
}

async function main() {
  try {
    await checkEnvironment();
    await fixCustomerPasswords();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error); 