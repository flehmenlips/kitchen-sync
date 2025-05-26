#!/usr/bin/env node

/**
 * Production Database Backup Script
 * 
 * Creates a JSON backup of all critical production data.
 * This is used before running any migration scripts.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

const BACKUP_DIR = path.join(__dirname, 'backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_FILE = path.join(BACKUP_DIR, `backup-${TIMESTAMP}.json`);

async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create backup directory:', error);
    throw error;
  }
}

async function backupDatabase() {
  console.log('🔒 Production Database Backup');
  console.log('============================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Output: ${BACKUP_FILE}\n`);

  const backup = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      environment: process.env.DATABASE_URL?.includes('localhost') ? 'LOCAL' : 'PRODUCTION'
    },
    data: {}
  };

  try {
    // Users (including customers)
    console.log('Backing up users...');
    backup.data.users = await prisma.user.findMany({
      include: {
        restaurantStaff: true
      }
    });
    console.log(`  ✅ ${backup.data.users.length} users`);

    // Restaurants
    console.log('Backing up restaurants...');
    backup.data.restaurants = await prisma.restaurant.findMany();
    console.log(`  ✅ ${backup.data.restaurants.length} restaurants`);

    // Restaurant Staff
    console.log('Backing up restaurant staff...');
    backup.data.restaurantStaff = await prisma.restaurantStaff.findMany();
    console.log(`  ✅ ${backup.data.restaurantStaff.length} staff assignments`);

    // Recipes
    console.log('Backing up recipes...');
    backup.data.recipes = await prisma.recipe.findMany({
      include: {
        recipeIngredients: true,
        usedAsSubRecipe: true,
        menuItems: true
      }
    });
    console.log(`  ✅ ${backup.data.recipes.length} recipes`);

    // Ingredients
    console.log('Backing up ingredients...');
    backup.data.ingredients = await prisma.ingredient.findMany();
    console.log(`  ✅ ${backup.data.ingredients.length} ingredients`);

    // Menus
    console.log('Backing up menus...');
    backup.data.menus = await prisma.menu.findMany({
      include: {
        sections: {
          include: {
            items: true
          }
        }
      }
    });
    console.log(`  ✅ ${backup.data.menus.length} menus`);

    // Reservations
    console.log('Backing up reservations...');
    backup.data.reservations = await prisma.reservation.findMany();
    console.log(`  ✅ ${backup.data.reservations.length} reservations`);

    // Orders
    console.log('Backing up orders...');
    backup.data.orders = await prisma.order.findMany({
      include: {
        orderItems: true
      }
    });
    console.log(`  ✅ ${backup.data.orders.length} orders`);

    // Categories
    console.log('Backing up categories...');
    backup.data.categories = await prisma.category.findMany();
    console.log(`  ✅ ${backup.data.categories.length} categories`);

    // Units
    console.log('Backing up units...');
    backup.data.units = await prisma.unitOfMeasure.findMany();
    console.log(`  ✅ ${backup.data.units.length} units`);

    // Prep Tasks
    console.log('Backing up prep tasks...');
    backup.data.prepTasks = await prisma.prepTask.findMany();
    console.log(`  ✅ ${backup.data.prepTasks.length} prep tasks`);

    // Prep Columns
    console.log('Backing up prep columns...');
    backup.data.prepColumns = await prisma.prepColumn.findMany();
    console.log(`  ✅ ${backup.data.prepColumns.length} prep columns`);

    // Check for customer tables (might not exist yet)
    try {
      const customerCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM customers`;
      if (customerCount[0].count > 0) {
        console.log('Backing up customers table...');
        backup.data.customers = await prisma.$queryRaw`
          SELECT * FROM customers;
        `;
        console.log(`  ✅ ${backup.data.customers.length} customers`);

        backup.data.customerProfiles = await prisma.$queryRaw`
          SELECT * FROM customer_profiles;
        `;
        backup.data.customerRestaurants = await prisma.$queryRaw`
          SELECT * FROM customer_restaurants;
        `;
      }
    } catch (error) {
      console.log('  ℹ️  Customer tables not found (not yet migrated)');
    }

    // Write backup
    await fs.writeFile(BACKUP_FILE, JSON.stringify(backup, null, 2));
    
    // Calculate file size
    const stats = await fs.stat(BACKUP_FILE);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log('\n✅ Backup completed successfully!');
    console.log(`📦 File size: ${fileSizeMB} MB`);
    console.log(`📍 Location: ${BACKUP_FILE}`);

    // Summary
    console.log('\n📊 Backup Summary:');
    Object.entries(backup.data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        console.log(`  - ${key}: ${value.length} records`);
      }
    });

    return BACKUP_FILE;

  } catch (error) {
    console.error('\n❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    await ensureBackupDir();
    await backupDatabase();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main(); 