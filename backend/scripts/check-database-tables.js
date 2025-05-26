#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND (tablename LIKE '%customer%' OR tablename LIKE '%restaurant%')
      ORDER BY tablename;
    `;
    
    console.log('Tables with "customer" or "restaurant" in name:');
    tables.forEach(t => console.log(`  - ${t.tablename}`));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables(); 