#!/usr/bin/env node

/**
 * Check George's Data Script
 * Specifically checks george@seabreeze.farm's data before migration
 */

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

if (!databaseUrl) {
  console.error('❌ Could not find DATABASE_URL in backend/.env');
  process.exit(1);
}

// Check if this is production database
if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
  console.error('⚠️  WARNING: This appears to be a LOCAL database!');
  console.error('   Please update backend/.env with the PRODUCTION DATABASE_URL from Render');
  console.error('   Current URL:', databaseUrl);
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient();

async function checkGeorgeData() {
  console.log('🔍 Checking george@seabreeze.farm Production Data');
  console.log('===============================================\n');
  
  try {
    // 1. Find George's user account
    console.log('1. Finding George\'s Account:');
    const george = await prisma.user.findUnique({
      where: { email: 'george@seabreeze.farm' }
    });
    
    if (!george) {
      console.log('❌ User george@seabreeze.farm not found!');
      return;
    }
    
    console.log(`✅ Found user: ${george.name} (ID: ${george.id})`);
    
    // 2. Check George's restaurant associations
    console.log('\n2. Restaurant Associations:');
    const staffAssociations = await prisma.restaurantStaff.findMany({
      where: { userId: george.id },
      include: { restaurant: true }
    });
    
    if (staffAssociations.length === 0) {
      console.log('❌ No restaurant associations found!');
      console.log('   Migration will create a default restaurant.');
    } else {
      console.log(`✅ Found ${staffAssociations.length} restaurant association(s):`);
      staffAssociations.forEach(sa => {
        console.log(`   - ${sa.restaurant.name} (ID: ${sa.restaurant.id}, Active: ${sa.isActive})`);
      });
    }
    
    // 3. Count George's data that needs restaurantId
    console.log('\n3. George\'s Data Records:');
    const georgeCounts = {
      recipes: await prisma.recipe.count({ where: { userId: george.id } }),
      menus: await prisma.menu.count({ where: { userId: george.id } }),
      categories: await prisma.category.count({ where: { userId: george.id } }),
      ingredients: await prisma.ingredient.count({ where: { userId: george.id } }),
      ingredientCategories: await prisma.ingredientCategory.count({ where: { userId: george.id } }),
      units: await prisma.unitOfMeasure.count({ where: { userId: george.id } }),
      prepColumns: await prisma.prepColumn.count({ where: { userId: george.id } }),
      prepTasks: await prisma.prepTask.count({ where: { userId: george.id } })
    };
    
    let totalGeorgeRecords = 0;
    for (const [model, count] of Object.entries(georgeCounts)) {
      console.log(`   ${model}: ${count}`);
      totalGeorgeRecords += count;
    }
    console.log(`   TOTAL: ${totalGeorgeRecords} of George's records will be updated`);
    
    // 4. Check if there are other users in the system
    console.log('\n4. Other Users in System:');
    const totalUsers = await prisma.user.count();
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Other users: ${totalUsers - 1}`);
    
    // 5. Migration impact assessment
    console.log('\n📊 Migration Impact for George:');
    console.log('================================');
    
    if (staffAssociations.length === 0) {
      console.log('⚠️  George has no restaurant association!');
      console.log('   The migration will create a default restaurant.');
      console.log('   All of George\'s data will be assigned to this new restaurant.');
    } else if (staffAssociations.length === 1) {
      const restaurant = staffAssociations[0].restaurant;
      console.log(`✅ All of George's data will be assigned to: ${restaurant.name}`);
    } else {
      console.log('⚠️  George has multiple restaurant associations.');
      console.log('   Data will be assigned to the first restaurant.');
    }
    
    // 6. Sample data check
    console.log('\n5. Sample of George\'s Recipes:');
    const sampleRecipes = await prisma.recipe.findMany({
      where: { userId: george.id },
      take: 5,
      select: { id: true, name: true }
    });
    
    if (sampleRecipes.length > 0) {
      sampleRecipes.forEach(r => {
        console.log(`   - ${r.name} (ID: ${r.id})`);
      });
      if (georgeCounts.recipes > 5) {
        console.log(`   ... and ${georgeCounts.recipes - 5} more recipes`);
      }
    } else {
      console.log('   No recipes found');
    }
    
    console.log('\n✅ Data check complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Create a backup using: ./backend/scripts/backup-production-db.sh');
    console.log('2. Review the data above');
    console.log('3. Proceed with migration if everything looks correct');
    
  } catch (error) {
    console.error('❌ Error during check:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkGeorgeData(); 