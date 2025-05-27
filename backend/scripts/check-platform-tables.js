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

async function checkPlatformTables() {
  console.log('🔍 Checking Platform Admin Tables in Production');
  console.log('==============================================\n');
  
  try {
    // List of platform-related tables to check
    const tablesToCheck = [
      'platform_admins',
      'platform_actions',
      'diners',
      'diner_sessions',
      'diner_restaurant_profiles',
      'favorite_restaurants',
      'reviews',
      'loyalty_points',
      'diner_notifications',
      'subscriptions',
      'invoices',
      'usage_records',
      'restaurant_notes',
      'support_tickets',
      'ticket_messages'
    ];
    
    console.log('Checking for platform tables...\n');
    
    for (const tableName of tablesToCheck) {
      try {
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
          )
        `;
        
        const exists = result[0].exists;
        console.log(`${exists ? '✅' : '❌'} ${tableName}`);
        
        if (exists) {
          // Get row count
          const countResult = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as count FROM ${tableName}`
          );
          console.log(`   Rows: ${countResult[0].count}`);
        }
      } catch (error) {
        console.log(`❌ ${tableName} - Error: ${error.message}`);
      }
    }
    
    // Check for platform admin users
    console.log('\n\nChecking for Platform Admins:');
    try {
      const platformAdmins = await prisma.$queryRaw`
        SELECT * FROM platform_admins
      `;
      
      if (platformAdmins.length > 0) {
        console.log(`\nFound ${platformAdmins.length} platform admin(s):`);
        platformAdmins.forEach(admin => {
          console.log(`- ${admin.name} (${admin.email}) - Role: ${admin.role}`);
        });
      } else {
        console.log('❌ No platform admins found');
      }
    } catch (error) {
      console.log('❌ platform_admins table does not exist');
    }
    
    // Check current restaurant IDs
    console.log('\n\nCurrent Restaurant IDs in Production:');
    const restaurants = await prisma.$queryRaw`
      SELECT id, name, slug FROM restaurants ORDER BY id
    `;
    
    restaurants.forEach(r => {
      console.log(`- ID: ${r.id} - ${r.name} (${r.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlatformTables(); 