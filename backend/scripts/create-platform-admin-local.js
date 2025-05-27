#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use local database
process.env.DATABASE_URL = "postgresql://georgepage@localhost/kitchensync_dev";
const prisma = new PrismaClient();

async function createPlatformAdminLocal() {
  console.log('🔐 Creating Platform Admin in LOCAL Database');
  console.log('==========================================\n');
  
  try {
    // First, ensure the tables exist
    // Add missing columns if needed
    await prisma.$executeRaw`
      ALTER TABLE platform_admins 
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE platform_actions 
      ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS entity_id INTEGER,
      ADD COLUMN IF NOT EXISTS metadata JSONB;
    `;
    
    // Check if admin already exists
    const existing = await prisma.platformAdmin.findUnique({
      where: { email: 'admin@kitchensync.io' }
    });
    
    if (existing) {
      console.log('⚠️  Platform admin already exists. Updating password...');
      // Update password
      const hashedPassword = await bcrypt.hash('KitchenSync2024!', 10);
      await prisma.platformAdmin.update({
        where: { email: 'admin@kitchensync.io' },
        data: { 
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      console.log('✅ Password updated!');
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('KitchenSync2024!', 10);
      await prisma.platformAdmin.create({
        data: {
          email: 'admin@kitchensync.io',
          password: hashedPassword,
          name: 'Platform Administrator',
          role: 'SUPER_ADMIN'
        }
      });
      console.log('✅ Platform admin created!');
    }
    
    console.log('\nCredentials:');
    console.log('Email: admin@kitchensync.io');
    console.log('Password: KitchenSync2024!');
    console.log('\nYou can now login with your local backend running!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPlatformAdminLocal(); 