#!/usr/bin/env node

/**
 * Simple Backup Script for George's Data
 * Backs up data without complex relations (for pre-migration state)
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

async function simpleBackup() {
  console.log('🔒 Simple Backup of george@seabreeze.farm Production Data');
  console.log('======================================================\n');
  
  try {
    // Create backup directory
    const backupDir = './database-backups';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `george-simple-backup-${timestamp}.json`);
    
    console.log('📁 Backup file:', backupFile);
    console.log('\n🔄 Fetching data...\n');
    
    // Find George's user account
    const george = await prisma.user.findUnique({
      where: { email: 'george@seabreeze.farm' }
    });
    
    if (!george) {
      console.log('❌ User george@seabreeze.farm not found!');
      return;
    }
    
    console.log(`✅ Found user: ${george.name} (ID: ${george.id})`);
    console.log('\n📊 Backing up data:');
    
    // Initialize backup object
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        userEmail: george.email,
        userId: george.id,
        description: 'Pre-migration backup of George\'s data'
      },
      user: george,
      data: {}
    };
    
    // Backup each table separately (without complex includes)
    
    // Recipes
    backup.data.recipes = await prisma.recipe.findMany({
      where: { userId: george.id }
    });
    console.log(`   ✓ Recipes: ${backup.data.recipes.length}`);
    
    // Recipe Ingredients (separate query)
    const recipeIds = backup.data.recipes.map(r => r.id);
    backup.data.recipeIngredients = await prisma.recipeIngredient.findMany({
      where: { recipeId: { in: recipeIds } }
    });
    console.log(`   ✓ Recipe Ingredients: ${backup.data.recipeIngredients.length}`);
    
    // Menus
    backup.data.menus = await prisma.menu.findMany({
      where: { userId: george.id }
    });
    console.log(`   ✓ Menus: ${backup.data.menus.length}`);
    
    // Menu Items
    const menuIds = backup.data.menus.map(m => m.id);
    backup.data.menuItems = await prisma.menuItem.findMany({
      where: { menuId: { in: menuIds } }
    });
    console.log(`   ✓ Menu Items: ${backup.data.menuItems.length}`);
    
    // Categories
    backup.data.categories = await prisma.category.findMany({
      where: { userId: george.id }
    });
    console.log(`   ✓ Categories: ${backup.data.categories.length}`);
    
    // Ingredients
    backup.data.ingredients = await prisma.ingredient.findMany({
      where: { userId: george.id }
    });
    console.log(`   ✓ Ingredients: ${backup.data.ingredients.length}`);
    
    // Ingredient Categories
    backup.data.ingredientCategories = await prisma.ingredientCategory.findMany({
      where: { userId: george.id }
    });
    console.log(`   ✓ Ingredient Categories: ${backup.data.ingredientCategories.length}`);
    
    // Units of Measure
    backup.data.unitsOfMeasure = await prisma.unitOfMeasure.findMany({
      where: { userId: george.id }
    });
    console.log(`   ✓ Units of Measure: ${backup.data.unitsOfMeasure.length}`);
    
    // Prep Columns
    backup.data.prepColumns = await prisma.prepColumn.findMany({
      where: { userId: george.id }
    });
    console.log(`   ✓ Prep Columns: ${backup.data.prepColumns.length}`);
    
    // Prep Tasks
    const prepColumnIds = backup.data.prepColumns.map(c => c.id);
    backup.data.prepTasks = await prisma.prepTask.findMany({
      where: { prepColumnId: { in: prepColumnIds } }
    });
    console.log(`   ✓ Prep Tasks: ${backup.data.prepTasks.length}`);
    
    // Get existing restaurant associations (if any)
    backup.data.restaurantStaff = await prisma.restaurantStaff.findMany({
      where: { userId: george.id }
    });
    console.log(`   ✓ Restaurant Associations: ${backup.data.restaurantStaff.length}`);
    
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
      .reduce((sum, [_, data]) => sum + data.length, 0);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total records backed up: ${totalRecords}`);
    console.log(`   User ID: ${george.id}`);
    console.log(`   Restaurant associations: ${backup.data.restaurantStaff.length}`);
    
    console.log('\n🎉 George\'s data has been safely backed up!');
    console.log('\n⚠️  IMPORTANT: Store this backup file safely before proceeding with migration!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy this backup file to a safe location');
    console.log('2. Review the migration that will be applied');
    console.log('3. Apply the migrations to production');
    
  } catch (error) {
    console.error('❌ Error during backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

simpleBackup(); 