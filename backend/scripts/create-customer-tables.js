#!/usr/bin/env node

/**
 * Create Customer Tables
 * 
 * This script creates the new customer-related tables needed
 * for the multi-tenant architecture.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const DatabaseSafety = require('../utils/databaseSafety');

const prisma = new PrismaClient();
const dbSafety = new DatabaseSafety();

async function createTables() {
  try {
    console.log('🔨 Creating Customer Tables for Multi-Tenant Architecture');
    console.log('=======================================================\n');
    
    // Show current database info
    console.log(`Database: ${dbSafety.getDatabaseName()}`);
    console.log(`Host: ${dbSafety.getDatabaseHost()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
    
    // Safety check
    const proceed = await dbSafety.performSafetyCheck(
      'CREATE CUSTOMER TABLES',
      'This will create new tables: customers, customer_preferences, customer_sessions, customer_restaurants'
    );
    
    if (!proceed) {
      await prisma.$disconnect();
      process.exit(0);
    }
    
    console.log('\n📋 Creating customers table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL DEFAULT 1,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        phone VARCHAR(50),
        email_verified BOOLEAN NOT NULL DEFAULT false,
        email_verification_token VARCHAR(255),
        email_verification_expires TIMESTAMP(3),
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP(3),
        last_login TIMESTAMP(3),
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_customer_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      );
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_customers_restaurant_id ON customers(restaurant_id);
    `;
    
    console.log('✅ Created customers table');
    
    console.log('\n📋 Creating customer_preferences table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS customer_preferences (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER UNIQUE NOT NULL,
        dietary_restrictions TEXT,
        seating_preferences TEXT,
        special_occasions JSONB,
        marketing_opt_in BOOLEAN NOT NULL DEFAULT true,
        sms_notifications BOOLEAN NOT NULL DEFAULT false,
        preferred_contact_method VARCHAR(20) DEFAULT 'email',
        notes TEXT,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_preferences_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      );
    `;
    console.log('✅ Created customer_preferences table');
    
    console.log('\n📋 Creating customer_sessions table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS customer_sessions (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP(3) NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_session_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      );
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_customer_sessions_token ON customer_sessions(token);
    `;
    
    console.log('✅ Created customer_sessions table');
    
    console.log('\n📋 Creating customer_restaurants table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS customer_restaurants (
        customer_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        first_visit TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_visit TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        visit_count INTEGER NOT NULL DEFAULT 0,
        total_spent DECIMAL(10,2),
        notes TEXT,
        tags TEXT[],
        vip_status BOOLEAN NOT NULL DEFAULT false,
        preferences JSONB,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (customer_id, restaurant_id),
        CONSTRAINT fk_cr_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        CONSTRAINT fk_cr_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      );
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_customer_restaurants_customer_id ON customer_restaurants(customer_id);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_customer_restaurants_restaurant_id ON customer_restaurants(restaurant_id);
    `;
    
    console.log('✅ Created customer_restaurants table');
    
    // Add triggers for updated_at
    console.log('\n📋 Creating update triggers...');
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    
    const tablesWithUpdatedAt = ['customers', 'customer_preferences', 'customer_restaurants'];
    
    for (const table of tablesWithUpdatedAt) {
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TRIGGER update_${table}_updated_at BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
      } catch (error) {
        // Trigger might already exist
        console.log(`ℹ️  Trigger for ${table} might already exist`);
      }
    }
    
    console.log('✅ Created update triggers');
    
    console.log('\n🎉 All customer tables created successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run `npm run db:migrate:multi-tenant` to migrate existing customer data');
    console.log('2. Update your Prisma schema file to match these tables');
    console.log('3. Run `npx prisma generate` to update the Prisma client');
    
  } catch (error) {
    console.error('\n❌ Error creating tables:', error);
    dbSafety.logDangerousOperation('Create Customer Tables', false, process.env.USER || 'unknown');
  } finally {
    await prisma.$disconnect();
    dbSafety.close();
  }
}

if (require.main === module) {
  createTables();
} 