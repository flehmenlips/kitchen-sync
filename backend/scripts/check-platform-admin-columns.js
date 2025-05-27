#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
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

async function checkColumns() {
  console.log('🔍 Checking platform_admins table columns');
  console.log('========================================\n');
  
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'platform_admins' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('Columns in platform_admins table:');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n✅ These are the actual column names in the database.');
    console.log('The Prisma schema expects: last_login_at (not lastLoginAt)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns(); 