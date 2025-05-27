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

async function verifyPlatformAdmin() {
  console.log('🔍 Verifying Platform Admin Credentials');
  console.log('======================================\n');
  
  try {
    // Check if platform admin exists
    const admin = await prisma.$queryRaw`
      SELECT id, email, name, role, password 
      FROM platform_admins 
      WHERE email = 'admin@kitchensync.io'
    `;
    
    if (admin.length === 0) {
      console.log('❌ No platform admin found with email: admin@kitchensync.io');
      
      // List all platform admins
      const allAdmins = await prisma.$queryRaw`
        SELECT id, email, name, role FROM platform_admins
      `;
      
      console.log('\nExisting platform admins:');
      allAdmins.forEach(a => {
        console.log(`- ${a.email} (${a.name}) - Role: ${a.role}`);
      });
      
      return;
    }
    
    console.log('✅ Platform admin found:');
    console.log(`   Email: ${admin[0].email}`);
    console.log(`   Name: ${admin[0].name}`);
    console.log(`   Role: ${admin[0].role}`);
    
    // Test password
    const testPassword = 'KitchenSync2024!';
    const isValid = await bcrypt.compare(testPassword, admin[0].password);
    
    console.log('\n🔑 Password verification:');
    console.log(`   Testing password: ${testPassword}`);
    console.log(`   Password valid: ${isValid ? '✅ YES' : '❌ NO'}`);
    
    if (!isValid) {
      console.log('\n⚠️  The password does not match!');
      console.log('This could mean:');
      console.log('1. The password was changed');
      console.log('2. There was an issue during creation');
      
      // Let's create a new password
      console.log('\n🔧 Creating new password hash for testing...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash created. You can update the password with this query in pgAdmin:');
      console.log(`\nUPDATE platform_admins SET password = '${newHash}' WHERE email = 'admin@kitchensync.io';`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPlatformAdmin(); 