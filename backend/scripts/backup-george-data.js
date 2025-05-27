#!/usr/bin/env node

/**
 * Backup George's Data Script
 * Creates a JSON backup of george@seabreeze.farm's data before migration
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
  console.error('   Please update backend/.env with the PRODUCTION DATABASE_URL from Render');
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient();

async function backupGeorgeData() {
  console.log('🔒 Backing up george@seabreeze.farm Production Data');
  console.log('================================================\n');
  
  try {
    // Create backup directory
    const backupDir = './database-backups';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `george-data-backup-${timestamp}.json`);
    
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
    
    // Backup all of George's data
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        userEmail: george.email,
        userId: george.id,
        databaseUrl: databaseUrl.replace(/:[^@]+@/, ':****@') // Hide password
      },
      user: george,
      data: {}
    };
    
    // Fetch all data belonging to George
    console.log('📊 Backing up George\'s data:');
    
    // Recipes and related data
    backup.data.recipes = await prisma.recipe.findMany({
      where: { userId: george.id },
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
            unit: true
          }
        },
        category: true,
        yieldUnit: true
      }
    });
    console.log(`   ✓ Recipes: ${backup.data.recipes.length}`);
    
    // Menus and menu items
    backup.data.menus = await prisma.menu.findMany({
      where: { userId: george.id },
      include: {
        items: {
          include: {
            recipe: true,
            category: true
          }
        }
      }
    });
    console.log(`   ✓ Menus: ${backup.data.menus.length}`);
    
    // Categories
    backup.data.categories = await prisma.category.findMany({
      where: { userId: george.id }
    });
    console.log(`   ✓ Categories: ${backup.data.categories.length}`);
    
    // Ingredients
    backup.data.ingredients = await prisma.ingredient.findMany({
      where: { userId: george.id },
      include: {
        category: true
      }
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
    
    // Prep Columns and Tasks
    backup.data.prepColumns = await prisma.prepColumn.findMany({
      where: { userId: george.id },
      include: {
        tasks: {
          include: {
            recipe: true
          }
        }
      }
    });
    console.log(`   ✓ Prep Columns: ${backup.data.prepColumns.length}`);
    
    // Count total prep tasks
    const prepTaskCount = backup.data.prepColumns.reduce((sum, col) => sum + col.tasks.length, 0);
    console.log(`   ✓ Prep Tasks: ${prepTaskCount}`);
    
    // Restaurant associations (if any)
    backup.data.restaurantStaff = await prisma.restaurantStaff.findMany({
      where: { userId: george.id },
      include: { restaurant: true }
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
    
    // Create a restore script
    const restoreScriptFile = path.join(backupDir, `restore-george-data-${timestamp}.js`);
    const restoreScript = `#!/usr/bin/env node
// Restore script for George's data backup
// Generated: ${new Date().toISOString()}

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const backupFile = '${path.basename(backupFile)}';
const backup = JSON.parse(fs.readFileSync('./' + backupFile, 'utf8'));

console.log('⚠️  WARNING: This will restore George\\'s data from backup!');
console.log('Backup created:', backup.metadata.timestamp);
console.log('User:', backup.metadata.userEmail);

// TO IMPLEMENT: Add restore logic here if needed
console.log('\\n❌ Restore functionality not yet implemented.');
console.log('This backup serves as a safety measure for manual recovery if needed.');
`;
    
    fs.writeFileSync(restoreScriptFile, restoreScript);
    fs.chmodSync(restoreScriptFile, '755');
    
    console.log(`\n📝 Restore script created: ${restoreScriptFile}`);
    console.log('\n🎉 George\'s data has been safely backed up!');
    console.log('\n📋 Next steps:');
    console.log('1. Review the backup file to ensure all data is captured');
    console.log('2. Store this backup safely before proceeding with migration');
    console.log('3. Proceed with the migration when ready');
    
  } catch (error) {
    console.error('❌ Error during backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupGeorgeData(); 