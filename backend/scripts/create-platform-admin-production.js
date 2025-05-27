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

async function createPlatformAdmin() {
  console.log('🔐 Creating Platform Admin User');
  console.log('===============================\n');
  
  // Platform admin credentials
  const adminEmail = 'admin@kitchensync.io';
  const adminPassword = 'KitchenSync2024!'; // Change this immediately after first login
  const adminName = 'Platform Administrator';
  
  try {
    // Check if platform_admins table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'platform_admins'
      )
    `;
    
    if (!tableExists[0].exists) {
      console.error('❌ platform_admins table does not exist!');
      console.error('Please run the SQL migration first:');
      console.error('  psql -h <host> -U <user> -d <database> -f scripts/deploy-platform-admin-tables.sql.txt');
      process.exit(1);
    }
    
    // Check if admin already exists
    const existingAdmin = await prisma.$queryRaw`
      SELECT id FROM platform_admins WHERE email = ${adminEmail}
    `;
    
    if (existingAdmin.length > 0) {
      console.log('⚠️  Platform admin already exists with this email');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create platform admin
    const result = await prisma.$queryRaw`
      INSERT INTO platform_admins (email, name, password, role, is_active)
      VALUES (${adminEmail}, ${adminName}, ${hashedPassword}, 'SUPERADMIN', true)
      RETURNING id
    `;
    
    console.log('✅ Platform admin created successfully!');
    console.log('\nCredentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!');
    console.log('\nYou can now access the platform admin panel at:');
    console.log('https://[your-domain]/platform-admin/login');
    
    // Log the action
    await prisma.$queryRaw`
      INSERT INTO platform_actions (admin_id, action, resource_type, details)
      VALUES (
        ${result[0].id}, 
        'PLATFORM_ADMIN_CREATED', 
        'PLATFORM_ADMIN',
        ${{ initial_setup: true }}::jsonb
      )
    `;
    
    // Show current restaurants
    console.log('\n📊 Current Restaurants in Platform:');
    const restaurants = await prisma.$queryRaw`
      SELECT r.id, r.name, r.slug, s.plan, s.status
      FROM restaurants r
      LEFT JOIN subscriptions s ON s.restaurant_id = r.id
      ORDER BY r.id
    `;
    
    restaurants.forEach(r => {
      console.log(`- ${r.name} (ID: ${r.id}) - Plan: ${r.plan || 'None'}, Status: ${r.status || 'None'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPlatformAdmin(); 