#!/usr/bin/env node

/**
 * Production Customer Migration Script
 * 
 * This script safely migrates customers from the users table to a separate
 * customers table for production use. It includes extensive safety checks,
 * dry-run mode, and rollback capabilities.
 * 
 * USAGE:
 *   DRY RUN (default): node production-customer-migration.js
 *   EXECUTE: node production-customer-migration.js --execute
 *   ROLLBACK: node production-customer-migration.js --rollback
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Configuration
const DRY_RUN = !process.argv.includes('--execute');
const ROLLBACK = process.argv.includes('--rollback');
const LOG_FILE = path.join(__dirname, `migration-log-${new Date().toISOString().split('T')[0]}.json`);

// Migration state tracking
const migrationState = {
  startTime: new Date(),
  environment: process.env.DATABASE_URL?.includes('localhost') ? 'LOCAL' : 'PRODUCTION',
  dryRun: DRY_RUN,
  rollback: ROLLBACK,
  steps: [],
  errors: [],
  warnings: [],
  summary: {}
};

// Utility functions
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message };
  
  console.log(`[${timestamp}] [${level}] ${message}`);
  migrationState.steps.push(logEntry);
}

function error(message) {
  log(message, 'ERROR');
  migrationState.errors.push({ timestamp: new Date().toISOString(), message });
}

function warning(message) {
  log(message, 'WARNING');
  migrationState.warnings.push({ timestamp: new Date().toISOString(), message });
}

async function saveLog() {
  try {
    await fs.writeFile(LOG_FILE, JSON.stringify(migrationState, null, 2));
    console.log(`\nMigration log saved to: ${LOG_FILE}`);
  } catch (err) {
    console.error('Failed to save migration log:', err);
  }
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Safety checks
async function performSafetyChecks() {
  log('=== PERFORMING SAFETY CHECKS ===');
  
  // Check environment
  if (migrationState.environment === 'PRODUCTION' && DRY_RUN) {
    log('Running in DRY RUN mode against PRODUCTION database');
  } else if (migrationState.environment === 'PRODUCTION' && !DRY_RUN) {
    log('⚠️  PRODUCTION EXECUTION MODE - Changes will be permanent!', 'WARNING');
    const confirm = await prompt('\nType "MIGRATE PRODUCTION" to continue: ');
    if (confirm !== 'MIGRATE PRODUCTION') {
      throw new Error('Production migration cancelled by user');
    }
  }
  
  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    log('✅ Database connection verified');
  } catch (err) {
    throw new Error(`Database connection failed: ${err.message}`);
  }
  
  // Check if customer tables exist
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('customers', 'customer_profiles', 'customer_sessions', 'customer_restaurants');
    `;
    
    if (ROLLBACK && tables.length === 0) {
      throw new Error('Cannot rollback - customer tables do not exist');
    } else if (!ROLLBACK && tables.length === 4) {
      warning('All customer tables already exist - migration may have already been run');
    }
    
    log(`Found ${tables.length}/4 customer tables`);
  } catch (err) {
    error(`Table check failed: ${err.message}`);
  }
  
  // Count affected records
  const customerCount = await prisma.user.count({ where: { isCustomer: true } });
  const staffCount = await prisma.user.count({ where: { isCustomer: false } });
  
  log(`Found ${customerCount} customers to migrate`);
  log(`Found ${staffCount} staff users (will not be affected)`);
  
  migrationState.summary.customersToMigrate = customerCount;
  migrationState.summary.staffUsers = staffCount;
  
  return { customerCount, staffCount };
}

// Create customer tables
async function createCustomerTables() {
  log('\n=== CREATING CUSTOMER TABLES ===');
  
  if (DRY_RUN) {
    log('DRY RUN: Would create customer tables');
    return;
  }
  
  try {
    // Create customers table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log('✅ Created customers table');
    
    // Create customer_profiles table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS customer_profiles (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
        dietary_restrictions TEXT,
        preferences JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log('✅ Created customer_profiles table');
    
    // Create customer_sessions table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS customer_sessions (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    log('✅ Created customer_sessions table');
    
    // Create customer_restaurants join table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS customer_restaurants (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        first_visit_date DATE,
        last_visit_date DATE,
        visit_count INTEGER DEFAULT 0,
        total_spent DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(customer_id, restaurant_id)
      );
    `);
    log('✅ Created customer_restaurants table');
    
    // Create indexes
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_customer_sessions_token ON customer_sessions(token)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer_id ON customer_sessions(customer_id)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_customer_restaurants_customer_id ON customer_restaurants(customer_id)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_customer_restaurants_restaurant_id ON customer_restaurants(restaurant_id)`);
    log('✅ Created indexes');
    
  } catch (err) {
    error(`Failed to create tables: ${err.message}`);
    throw err;
  }
}

// Migrate customers
async function migrateCustomers() {
  log('\n=== MIGRATING CUSTOMERS ===');
  
  const customers = await prisma.user.findMany({
    where: { isCustomer: true },
    include: { 
      restaurantStaff: true,
      reservations: true,
      orders: true
    }
  });
  
  let migrated = 0;
  let failed = 0;
  
  for (const user of customers) {
    try {
      log(`Processing customer: ${user.email}`);
      
      if (DRY_RUN) {
        log(`  DRY RUN: Would migrate user ${user.id} -> customer`);
        migrated++;
        continue;
      }
      
      // Check if already migrated
      const existing = await prisma.$queryRawUnsafe(
        `SELECT id FROM customers WHERE email = $1`,
        user.email
      );
      
      if (existing.length > 0) {
        warning(`  Customer ${user.email} already exists in customers table`);
        continue;
      }
      
      // Insert into customers table
      // Split name into first and last name
      const nameParts = (user.name || '').trim().split(' ');
      const firstName = nameParts[0] || null;
      const lastName = nameParts.slice(1).join(' ') || null;
      
      const [customer] = await prisma.$queryRawUnsafe(`
        INSERT INTO customers (
          email, password, first_name, last_name, phone,
          email_verified, verification_token, reset_token, reset_token_expires,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `,
        user.email,
        user.password,
        firstName,
        lastName,
        user.phone,
        false, // email_verified - default to false since field doesn't exist in User
        null,  // verification_token - doesn't exist in User model
        null,  // reset_token - doesn't exist in User model
        null,  // reset_token_expires - doesn't exist in User model
        user.createdAt,
        user.updatedAt
      );
      
      log(`  ✅ Created customer record with ID: ${customer.id}`);
      
      // Create customer profile
      await prisma.$executeRawUnsafe(`
        INSERT INTO customer_profiles (customer_id)
        VALUES ($1)
      `, customer.id);
      
      // Create restaurant link (default to restaurant 1)
      const restaurantId = user.restaurantStaff[0]?.restaurantId || 1;
      await prisma.$executeRawUnsafe(`
        INSERT INTO customer_restaurants (customer_id, restaurant_id)
        VALUES ($1, $2)
        ON CONFLICT (customer_id, restaurant_id) DO NOTHING
      `, customer.id, restaurantId);
      
      log(`  ✅ Created profile and restaurant link`);
      
      // Update reservations
      if (user.reservations.length > 0) {
        await prisma.$executeRawUnsafe(`
          UPDATE reservations 
          SET customer_id = $1 
          WHERE user_id = $2
        `, customer.id, user.id);
        log(`  ✅ Updated ${user.reservations.length} reservations`);
      }
      
      // Update orders
      if (user.orders.length > 0) {
        await prisma.$executeRawUnsafe(`
          UPDATE orders 
          SET customer_id = $1 
          WHERE user_id = $2
        `, customer.id, user.id);
        log(`  ✅ Updated ${user.orders.length} orders`);
      }
      
      migrated++;
      
    } catch (err) {
      error(`  ❌ Failed to migrate ${user.email}: ${err.message}`);
      failed++;
    }
  }
  
  migrationState.summary.migrated = migrated;
  migrationState.summary.failed = failed;
  
  log(`\nMigration complete: ${migrated} succeeded, ${failed} failed`);
}

// Clean up after migration
async function cleanupAfterMigration() {
  log('\n=== CLEANUP PHASE ===');
  
  if (DRY_RUN) {
    log('DRY RUN: Would remove customers from users table and restaurant_staff');
    return;
  }
  
  try {
    // Remove customers from restaurant_staff
    const staffDeleted = await prisma.restaurantStaff.deleteMany({
      where: {
        user: {
          isCustomer: true
        }
      }
    });
    log(`✅ Removed ${staffDeleted.count} customer records from restaurant_staff`);
    
    // Mark migrated users with special password (safer than deleting)
    const customerEmails = await prisma.$queryRaw`SELECT email FROM customers`;
    const emailList = customerEmails.map(c => c.email);
    
    const usersUpdated = await prisma.user.updateMany({
      where: {
        isCustomer: true,
        email: {
          in: emailList
        }
      },
      data: {
        password: 'MIGRATED_TO_CUSTOMERS_TABLE'
      }
    });
    log(`✅ Marked ${usersUpdated.count} migrated users as inactive`);
    
  } catch (err) {
    error(`Cleanup failed: ${err.message}`);
  }
}

// Rollback function
async function rollbackMigration() {
  log('\n=== ROLLBACK MODE ===');
  
  const confirm = await prompt('\n⚠️  This will restore customers to users table. Type "ROLLBACK" to continue: ');
  if (confirm !== 'ROLLBACK') {
    log('Rollback cancelled by user');
    return;
  }
  
  try {
    // Get all customers
    const customers = await prisma.$queryRaw`
      SELECT c.*, cr.restaurant_id 
      FROM customers c
      LEFT JOIN customer_restaurants cr ON c.id = cr.customer_id
    `;
    
    for (const customer of customers) {
      // Check if user still exists
      const existingUser = await prisma.user.findUnique({
        where: { email: customer.email }
      });
      
      if (existingUser && existingUser.password !== 'MIGRATED_TO_CUSTOMERS_TABLE') {
        warning(`User ${customer.email} already active - skipping`);
        continue;
      }
      
      if (existingUser) {
        // Reactivate user
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: customer.password,
            isCustomer: true
          }
        });
        log(`✅ Reactivated user: ${customer.email}`);
      } else {
        // Recreate user
        const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || null;
        const newUser = await prisma.user.create({
          data: {
            email: customer.email,
            password: customer.password,
            name: fullName,
            phone: customer.phone,
            isCustomer: true,
            role: 'USER'
          }
        });
        log(`✅ Recreated user: ${customer.email}`);
        
        // Restore restaurant staff link
        if (customer.restaurant_id) {
          await prisma.restaurantStaff.create({
            data: {
              userId: newUser.id,
              restaurantId: customer.restaurant_id,
              role: 'STAFF'
            }
          });
        }
      }
    }
    
    log('\n✅ Rollback completed successfully');
    
  } catch (err) {
    error(`Rollback failed: ${err.message}`);
    throw err;
  }
}

// Verification
async function verifyMigration() {
  log('\n=== VERIFICATION ===');
  
  try {
    const customerTableCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM customers`;
    const activeCustomersInUsers = await prisma.user.count({ 
      where: { 
        isCustomer: true,
        NOT: {
          password: 'MIGRATED_TO_CUSTOMERS_TABLE'
        }
      } 
    });
    const reservationsWithCustomerId = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM reservations WHERE customer_id IS NOT NULL
    `;
    const ordersWithCustomerId = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM orders WHERE customer_id IS NOT NULL
    `;
    
    log(`Customers in customers table: ${customerTableCount[0].count}`);
    log(`Active customers in users table: ${activeCustomersInUsers}`);
    log(`Reservations with customer_id: ${reservationsWithCustomerId[0].count}`);
    log(`Orders with customer_id: ${ordersWithCustomerId[0].count}`);
    
    migrationState.summary.verification = {
      customersTable: parseInt(customerTableCount[0].count),
      activeCustomersInUsers,
      reservationsUpdated: parseInt(reservationsWithCustomerId[0].count),
      ordersUpdated: parseInt(ordersWithCustomerId[0].count)
    };
    
    if (activeCustomersInUsers > 0 && !ROLLBACK) {
      warning(`Still have ${activeCustomersInUsers} active customers in users table`);
    }
    
  } catch (err) {
    error(`Verification failed: ${err.message}`);
  }
}

// Main execution
async function main() {
  console.log('\n🚀 KitchenSync Customer Migration Script');
  console.log('======================================');
  console.log(`Mode: ${ROLLBACK ? 'ROLLBACK' : (DRY_RUN ? 'DRY RUN' : 'EXECUTE')}`);
  console.log(`Environment: ${migrationState.environment}`);
  console.log(`Started: ${migrationState.startTime.toISOString()}\n`);
  
  try {
    // Perform safety checks
    await performSafetyChecks();
    
    if (ROLLBACK) {
      await rollbackMigration();
    } else {
      // Create tables
      await createCustomerTables();
      
      // Migrate customers
      await migrateCustomers();
      
      // Cleanup
      await cleanupAfterMigration();
    }
    
    // Verify results
    await verifyMigration();
    
    // Summary
    migrationState.endTime = new Date();
    migrationState.duration = migrationState.endTime - migrationState.startTime;
    
    console.log('\n📊 MIGRATION SUMMARY');
    console.log('===================');
    console.log(`Duration: ${Math.round(migrationState.duration / 1000)}s`);
    console.log(`Errors: ${migrationState.errors.length}`);
    console.log(`Warnings: ${migrationState.warnings.length}`);
    
    if (migrationState.summary.migrated !== undefined) {
      console.log(`\nCustomers migrated: ${migrationState.summary.migrated}`);
      console.log(`Failed migrations: ${migrationState.summary.failed}`);
    }
    
    if (migrationState.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      migrationState.errors.forEach(err => console.log(`  - ${err.message}`));
    }
    
    if (migrationState.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      migrationState.warnings.forEach(warn => console.log(`  - ${warn.message}`));
    }
    
  } catch (err) {
    error(`Fatal error: ${err.message}`);
    console.error('\n💥 MIGRATION FAILED!');
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await saveLog();
  }
}

// Run the migration
main().catch(console.error); 