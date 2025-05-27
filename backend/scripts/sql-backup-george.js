#!/usr/bin/env node

/**
 * SQL-based Backup Script for George's Data
 * Uses raw SQL to avoid Prisma schema mismatch with production
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Use production database from .env
const envContent = fs.readFileSync('./.env', 'utf8');
const databaseUrl = envContent
  .split('\n')
  .find(line => line.startsWith('DATABASE_URL'))
  ?.split('=')[1]
  ?.replace(/"/g, '')
  ?.trim();

if (!databaseUrl) {
  console.error('❌ Could not find DATABASE_URL in backend/.env');
  process.exit(1);
}

// Check if this is production database
if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
  console.error('⚠️  WARNING: This appears to be a LOCAL database!');
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient();

async function sqlBackup() {
  console.log('🔒 SQL-based Backup of george@seabreeze.farm Production Data');
  console.log('=========================================================\n');
  
  try {
    // Create backup directory
    const backupDir = './database-backups';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `george-sql-backup-${timestamp}.json`);
    
    console.log('📁 Backup file:', backupFile);
    console.log('\n🔄 Fetching data using raw SQL...\n');
    
    // Find George's user ID
    const georgeResult = await prisma.$queryRaw`
      SELECT * FROM users WHERE email = 'george@seabreeze.farm'
    `;
    
    if (!georgeResult || georgeResult.length === 0) {
      console.log('❌ User george@seabreeze.farm not found!');
      return;
    }
    
    const george = georgeResult[0];
    console.log(`✅ Found user: ${george.name} (ID: ${george.id})`);
    console.log('\n📊 Backing up data:');
    
    // Initialize backup object
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        userEmail: george.email,
        userId: george.id,
        description: 'Pre-migration SQL backup of George\'s data'
      },
      user: george,
      data: {}
    };
    
    // Backup each table using raw SQL
    
    // Recipes
    backup.data.recipes = await prisma.$queryRaw`
      SELECT * FROM recipes WHERE user_id = ${george.id}
    `;
    console.log(`   ✓ Recipes: ${backup.data.recipes.length}`);
    
    // Recipe Ingredients
    const recipeIds = backup.data.recipes.map(r => r.id);
    if (recipeIds.length > 0) {
      backup.data.recipeIngredients = await prisma.$queryRaw`
        SELECT * FROM recipe_ingredients WHERE recipe_id = ANY(${recipeIds})
      `;
    } else {
      backup.data.recipeIngredients = [];
    }
    console.log(`   ✓ Recipe Ingredients: ${backup.data.recipeIngredients.length}`);
    
    // Menus
    backup.data.menus = await prisma.$queryRaw`
      SELECT * FROM menus WHERE user_id = ${george.id}
    `;
    console.log(`   ✓ Menus: ${backup.data.menus.length}`);
    
    // Menu Sections
    const menuIds = backup.data.menus.map(m => m.id);
    if (menuIds.length > 0) {
      backup.data.menuSections = await prisma.$queryRaw`
        SELECT * FROM menu_sections WHERE menu_id = ANY(${menuIds})
      `;
    } else {
      backup.data.menuSections = [];
    }
    console.log(`   ✓ Menu Sections: ${backup.data.menuSections.length}`);
    
    // Menu Items
    const sectionIds = backup.data.menuSections.map(s => s.id);
    if (sectionIds.length > 0) {
      backup.data.menuItems = await prisma.$queryRaw`
        SELECT * FROM menu_items WHERE section_id = ANY(${sectionIds})
      `;
    } else {
      backup.data.menuItems = [];
    }
    console.log(`   ✓ Menu Items: ${backup.data.menuItems.length}`);
    
    // Categories
    backup.data.categories = await prisma.$queryRaw`
      SELECT * FROM categories WHERE user_id = ${george.id}
    `;
    console.log(`   ✓ Categories: ${backup.data.categories.length}`);
    
    // Ingredients
    backup.data.ingredients = await prisma.$queryRaw`
      SELECT * FROM ingredients WHERE user_id = ${george.id}
    `;
    console.log(`   ✓ Ingredients: ${backup.data.ingredients.length}`);
    
    // Ingredient Categories
    backup.data.ingredientCategories = await prisma.$queryRaw`
      SELECT * FROM ingredient_categories WHERE user_id = ${george.id}
    `;
    console.log(`   ✓ Ingredient Categories: ${backup.data.ingredientCategories.length}`);
    
    // Units of Measure
    backup.data.unitsOfMeasure = await prisma.$queryRaw`
      SELECT * FROM units_of_measure WHERE user_id = ${george.id}
    `;
    console.log(`   ✓ Units of Measure: ${backup.data.unitsOfMeasure.length}`);
    
    // Prep Columns
    backup.data.prepColumns = await prisma.$queryRaw`
      SELECT * FROM prep_columns WHERE user_id = ${george.id}
    `;
    console.log(`   ✓ Prep Columns: ${backup.data.prepColumns.length}`);
    
    // Prep Tasks
    const prepColumnIds = backup.data.prepColumns.map(c => c.id);
    if (prepColumnIds.length > 0) {
      backup.data.prepTasks = await prisma.$queryRaw`
        SELECT * FROM prep_tasks WHERE column_id = ANY(${prepColumnIds})
      `;
    } else {
      backup.data.prepTasks = [];
    }
    console.log(`   ✓ Prep Tasks: ${backup.data.prepTasks.length}`);
    
    // Restaurant associations (if table exists)
    try {
      backup.data.restaurantStaff = await prisma.$queryRaw`
        SELECT * FROM restaurant_staff WHERE user_id = ${george.id}
      `;
      console.log(`   ✓ Restaurant Associations: ${backup.data.restaurantStaff.length}`);
    } catch (e) {
      backup.data.restaurantStaff = [];
      console.log(`   ✓ Restaurant Associations: 0 (table may not exist yet)`);
    }
    
    // Write backup to file
    console.log('\n💾 Writing backup to file...');
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    // Get file size
    const stats = fs.statSync(backupFile);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n✅ Backup completed successfully!');
    console.log(`📁 File: ${backupFile}`);
    console.log(`📏 Size: ${fileSizeInMB} MB`);
    
    // Summary
    const totalRecords = Object.entries(backup.data)
      .filter(([key]) => key !== 'restaurantStaff')
      .reduce((sum, [_, data]) => sum + (Array.isArray(data) ? data.length : 0), 0);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total records backed up: ${totalRecords}`);
    console.log(`   User ID: ${george.id}`);
    console.log(`   Restaurant associations: ${backup.data.restaurantStaff.length}`);
    
    console.log('\n🎉 George\'s data has been safely backed up!');
    console.log('\n⚠️  IMPORTANT: Store this backup file safely before proceeding with migration!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy this backup file to a safe location');
    console.log('2. Apply the pending migrations:');
    console.log('   - 20250526210850_add_platform_architecture');
    console.log('   - 20250527051355_add_restaurant_id_to_core_models');
    console.log('3. Run verification after migration');
    
  } catch (error) {
    console.error('❌ Error during backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

sqlBackup(); 