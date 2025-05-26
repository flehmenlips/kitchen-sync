#!/usr/bin/env node

/**
 * Migration Script: Single-Tenant to Multi-Tenant
 * 
 * This script migrates the current KitchenSync database from
 * single-tenant to multi-tenant architecture.
 * 
 * Steps:
 * 1. Migrate customer data from users to customers table
 * 2. Create customer_restaurants entries
 * 3. Update reservations and orders to link to customers
 * 4. Add missing restaurantId to tables that need it
 * 5. Clean up the users table
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const DatabaseSafety = require('../utils/databaseSafety');

const prisma = new PrismaClient();
const dbSafety = new DatabaseSafety();

async function previewMigration() {
  console.log('\n📊 PREVIEW: Migration Impact Analysis\n');
  
  const stats = {
    customerUsers: await prisma.user.count({ where: { isCustomer: true } }),
    staffUsers: await prisma.user.count({ where: { isCustomer: false } }),
    existingCustomers: await prisma.customer.count(),
    restaurants: await prisma.restaurant.count(),
    reservations: await prisma.reservation.count(),
    orders: await prisma.order.count(),
  };
  
  console.table(stats);
  
  // Check for potential issues
  const issues = [];
  
  // Check for duplicate emails between users and customers
  const customerEmails = await prisma.customer.findMany({ select: { email: true } });
  const customerEmailSet = new Set(customerEmails.map(c => c.email));
  
  const userCustomers = await prisma.user.findMany({
    where: { isCustomer: true },
    select: { email: true }
  });
  
  const duplicates = userCustomers.filter(u => customerEmailSet.has(u.email));
  if (duplicates.length > 0) {
    issues.push(`⚠️  ${duplicates.length} duplicate emails found between users and customers tables`);
    console.log('\nDuplicate emails:', duplicates.map(d => d.email).join(', '));
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️  Potential Issues:');
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('\n✅ No issues detected');
  }
  
  return { stats, issues };
}

async function migrateCustomers() {
  console.log('\n📋 Step 1: Migrating customers from users to customers table...\n');
  
  const customerUsers = await prisma.user.findMany({
    where: { isCustomer: true },
    include: {
      customerReservations: true,
      customerProfile: true
    }
  });
  
  console.log(`Found ${customerUsers.length} customers to migrate`);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const user of customerUsers) {
    try {
      // Check if customer already exists
      const existing = await prisma.customer.findUnique({
        where: { email: user.email }
      });
      
      if (existing) {
        console.log(`⏭️  Skipping ${user.email} - already exists in customers table`);
        skipped++;
        continue;
      }
      
      // Create customer
      const customer = await prisma.customer.create({
        data: {
          email: user.email,
          password: user.password, // Already hashed
          firstName: user.name?.split(' ')[0] || null,
          lastName: user.name?.split(' ').slice(1).join(' ') || null,
          phone: user.phone,
          emailVerified: false, // Reset verification status
          createdAt: user.createdAt,
          restaurantId: 1 // Default to restaurant 1
        }
      });
      
      // Create customer_restaurant entry
      await prisma.customerRestaurant.create({
        data: {
          customerId: customer.id,
          restaurantId: 1,
          firstVisit: user.createdAt,
          visitCount: user.customerReservations.length
        }
      });
      
      // Update reservations to point to new customer
      if (user.customerReservations.length > 0) {
        await prisma.reservation.updateMany({
          where: { customerId: user.id },
          data: { customerId: customer.id }
        });
      }
      
      // Migrate customer profile if exists
      if (user.customerProfile) {
        await prisma.customerPreferences.create({
          data: {
            customerId: customer.id,
            dietaryRestrictions: user.customerProfile.dietaryRestrictions,
            seatingPreferences: user.customerProfile.specialRequests,
            marketingOptIn: user.customerProfile.marketingOptIn,
            preferredContactMethod: user.customerProfile.preferredContactMethod,
            notes: user.customerProfile.notes
          }
        });
      }
      
      console.log(`✅ Migrated ${user.email}`);
      migrated++;
      
    } catch (error) {
      console.error(`❌ Error migrating ${user.email}:`, error.message);
    }
  }
  
  console.log(`\n📊 Migration complete: ${migrated} migrated, ${skipped} skipped`);
}

async function updateOrdersTable() {
  console.log('\n📋 Step 2: Adding customer references to orders...\n');
  
  // First, add customer_id column if it doesn't exist
  try {
    await prisma.$executeRaw`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id);
    `;
    console.log('✅ Added customer_id column to orders table');
  } catch (error) {
    console.log('ℹ️  customer_id column already exists or error:', error.message);
  }
  
  // Update orders based on reservation customer
  const result = await prisma.$executeRaw`
    UPDATE orders o
    SET customer_id = r.customer_id
    FROM reservations r
    WHERE o.reservation_id = r.id
    AND r.customer_id IS NOT NULL
    AND o.customer_id IS NULL;
  `;
  
  console.log(`✅ Updated ${result} orders with customer references`);
}

async function addMissingRestaurantIds() {
  console.log('\n📋 Step 3: Adding restaurantId to tables that need it...\n');
  
  const tables = [
    { name: 'recipes', column: 'restaurant_id' },
    { name: 'ingredients', column: 'restaurant_id' },
    { name: 'categories', column: 'restaurant_id' },
    { name: 'units_of_measure', column: 'restaurant_id' },
    { name: 'menus', column: 'restaurant_id' }
  ];
  
  for (const table of tables) {
    try {
      // Add column if doesn't exist
      await prisma.$executeRawUnsafe(`
        ALTER TABLE ${table.name} 
        ADD COLUMN IF NOT EXISTS ${table.column} INTEGER DEFAULT 1 REFERENCES restaurants(id);
      `);
      
      // Update null values
      await prisma.$executeRawUnsafe(`
        UPDATE ${table.name} 
        SET ${table.column} = 1 
        WHERE ${table.column} IS NULL;
      `);
      
      console.log(`✅ Updated ${table.name} table`);
    } catch (error) {
      console.log(`ℹ️  ${table.name}: ${error.message}`);
    }
  }
}

async function cleanupUsersTable() {
  console.log('\n📋 Step 4: Cleaning up users table...\n');
  
  // Remove isCustomer field usage (can't drop column easily, but can ignore it)
  const cleaned = await prisma.user.updateMany({
    where: { isCustomer: true },
    data: { isCustomer: false }
  });
  
  console.log(`✅ Cleaned ${cleaned.count} user records`);
}

async function createRestaurantStaffEntries() {
  console.log('\n📋 Step 5: Creating restaurant_staff entries for existing users...\n');
  
  const staffUsers = await prisma.user.findMany({
    where: { 
      isCustomer: false,
      role: { in: ['USER', 'ADMIN', 'SUPERADMIN'] }
    }
  });
  
  let created = 0;
  
  for (const user of staffUsers) {
    try {
      // Check if already exists
      const existing = await prisma.restaurantStaff.findFirst({
        where: {
          userId: user.id,
          restaurantId: 1
        }
      });
      
      if (!existing) {
        await prisma.restaurantStaff.create({
          data: {
            userId: user.id,
            restaurantId: 1,
            role: user.role === 'SUPERADMIN' ? 'OWNER' : 
                  user.role === 'ADMIN' ? 'MANAGER' : 'STAFF'
          }
        });
        created++;
      }
    } catch (error) {
      console.error(`❌ Error creating staff entry for ${user.email}:`, error.message);
    }
  }
  
  console.log(`✅ Created ${created} restaurant_staff entries`);
}

async function runMigration() {
  try {
    console.log('🚀 KitchenSync Multi-Tenant Migration');
    console.log('=====================================\n');
    
    // Show current database info
    console.log(`Database: ${dbSafety.getDatabaseName()}`);
    console.log(`Host: ${dbSafety.getDatabaseHost()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Preview migration
    const { stats, issues } = await previewMigration();
    
    if (stats.customerUsers === 0) {
      console.log('\n✅ No customer users to migrate!');
      console.log('ℹ️  You may want to run the other migration steps anyway.');
    }
    
    // Safety check for production
    const proceed = await dbSafety.performSafetyCheck(
      'MIGRATE TO MULTI-TENANT ARCHITECTURE',
      `This will migrate ${stats.customerUsers} customers and modify multiple tables`
    );
    
    if (!proceed) {
      await prisma.$disconnect();
      process.exit(0);
    }
    
    // Run migrations
    console.log('\n🔄 Starting migration...\n');
    
    await migrateCustomers();
    await updateOrdersTable();
    await addMissingRestaurantIds();
    await createRestaurantStaffEntries();
    await cleanupUsersTable();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your Prisma schema to use the new relations');
    console.log('2. Run `npx prisma generate` to update the client');
    console.log('3. Test the application thoroughly');
    console.log('4. Deploy the updated backend code');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    dbSafety.logDangerousOperation('Multi-Tenant Migration', false, process.env.USER || 'unknown');
  } finally {
    await prisma.$disconnect();
    dbSafety.close();
  }
}

// Add the customer_restaurants table if it doesn't exist
async function createCustomerRestaurantsTable() {
  console.log('\n📋 Creating customer_restaurants table...\n');
  
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS customer_restaurants (
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
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
        PRIMARY KEY (customer_id, restaurant_id)
      );
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_customer_restaurants_customer_id ON customer_restaurants(customer_id);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_customer_restaurants_restaurant_id ON customer_restaurants(restaurant_id);
    `;
    
    console.log('✅ Created customer_restaurants table');
  } catch (error) {
    console.log('ℹ️  customer_restaurants table already exists or error:', error.message);
  }
}

// Run the migration
if (require.main === module) {
  createCustomerRestaurantsTable().then(() => {
    runMigration();
  });
} 