#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Use production database from .env
const envContent = fs.readFileSync('./.env', 'utf8');
const databaseUrl = envContent
  .split('\n')
  .find(line => line.startsWith('DATABASE_URL'))
  ?.split('=')[1]
  ?.replace(/"/g, '')
  ?.trim();

if (!databaseUrl || databaseUrl.includes('localhost')) {
  console.error('❌ Not using production database!');
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient();

async function testPlatformLogin() {
  console.log('🔍 Testing Platform Admin Login');
  console.log('===============================\n');
  
  const email = 'admin@kitchensync.io';
  const password = 'KitchenSync2024!';
  
  try {
    console.log('1. Testing raw SQL query (what the script uses):');
    const adminRaw = await prisma.$queryRaw`
      SELECT * FROM platform_admins WHERE email = ${email.toLowerCase()}
    `;
    console.log(`   Raw SQL found: ${adminRaw.length} admin(s)`);
    if (adminRaw.length > 0) {
      console.log(`   Email: ${adminRaw[0].email}`);
      console.log(`   Role: ${adminRaw[0].role}`);
    }
    
    console.log('\n2. Testing Prisma ORM query (what the app uses):');
    try {
      const adminORM = await prisma.platformAdmin.findUnique({
        where: { email: email.toLowerCase() },
      });
      console.log(`   ORM found: ${adminORM ? 'Yes' : 'No'}`);
      if (adminORM) {
        console.log(`   Email: ${adminORM.email}`);
        console.log(`   Role: ${adminORM.role}`);
        
        // Test password
        const isValid = await bcrypt.compare(password, adminORM.password);
        console.log(`   Password valid: ${isValid ? '✅ YES' : '❌ NO'}`);
      }
    } catch (ormError) {
      console.log(`   ❌ ORM Error: ${ormError.message}`);
      console.log('\n   This suggests Prisma client needs regeneration!');
    }
    
    console.log('\n3. Checking Prisma client models:');
    console.log(`   platformAdmin model exists: ${!!prisma.platformAdmin}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPlatformLogin(); 