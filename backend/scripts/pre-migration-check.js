#!/usr/bin/env node

/**
 * Pre-Migration Check Script
 * Verifies production data before applying multi-tenancy migration
 */

const { PrismaClient } = require('@prisma/client');

// Use production database
process.env.DATABASE_URL = require('fs')
  .readFileSync('./backend/.env', 'utf8')
  .split('\n')
  .find(line => line.startsWith('DATABASE_URL'))
  ?.split('=')[1]
  ?.trim();

if (!process.env.DATABASE_URL) {
  console.error('❌ Could not find DATABASE_URL in backend/.env');
  process.exit(1);
}

const prisma = new PrismaClient();

async function preCheck() {
  console.log('🔍 Pre-Migration Production Data Check');
  console.log('=====================================\n');
  
  try {
    // 1. Check restaurant data
    console.log('1. Current Restaurants:');
    const restaurants = await prisma.restaurant.findMany({
      select: { id: true, name: true, isActive: true }
    });
    
    console.log(`   Found ${restaurants.length} restaurants:`);
    restaurants.forEach(r => {
      console.log(`   - ${r.name} (ID: ${r.id}, Active: ${r.isActive})`);
    });
    
    // 2. Check user-restaurant associations
    console.log('\n2. User-Restaurant Associations:');
    const staffCount = await prisma.restaurantStaff.count();
    const activeStaffCount = await prisma.restaurantStaff.count({
      where: { isActive: true }
    });
    console.log(`   Total associations: ${staffCount}`);
    console.log(`   Active associations: ${activeStaffCount}`);
    
    // 3. Count records that will need restaurantId
    console.log('\n3. Records to be Updated:');
    const counts = {
      recipes: await prisma.recipe.count(),
      menus: await prisma.menu.count(),
      categories: await prisma.category.count(),
      ingredients: await prisma.ingredient.count(),
      ingredientCategories: await prisma.ingredientCategory.count(),
      units: await prisma.unitOfMeasure.count(),
      prepColumns: await prisma.prepColumn.count(),
      prepTasks: await prisma.prepTask.count()
    };
    
    let totalRecords = 0;
    for (const [model, count] of Object.entries(counts)) {
      console.log(`   ${model}: ${count}`);
      totalRecords += count;
    }
    console.log(`   TOTAL: ${totalRecords} records will be updated`);
    
    // 4. Check for users without restaurant associations
    console.log('\n4. Users Without Restaurant Associations:');
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    
    const orphanedUsers = [];
    for (const user of allUsers) {
      const hasRestaurant = await prisma.restaurantStaff.findFirst({
        where: { userId: user.id }
      });
      if (!hasRestaurant) {
        orphanedUsers.push(user);
      }
    }
    
    if (orphanedUsers.length > 0) {
      console.log(`   ⚠️  Found ${orphanedUsers.length} users without restaurant associations:`);
      orphanedUsers.forEach(u => {
        console.log(`   - ${u.name || u.email} (ID: ${u.id})`);
      });
      console.log('\n   These users will have their data assigned to a default restaurant.');
    } else {
      console.log('   ✅ All users have restaurant associations');
    }
    
    // 5. Data integrity check
    console.log('\n5. Data Integrity Check:');
    
    // Check for recipes with invalid ingredients
    const recipeIngredientCount = await prisma.recipeIngredient.count();
    console.log(`   Recipe ingredients: ${recipeIngredientCount}`);
    
    // Check for menu items with invalid recipes
    const menuItemCount = await prisma.menuItem.count();
    console.log(`   Menu items: ${menuItemCount}`);
    
    // 6. Migration safety assessment
    console.log('\n📊 Migration Safety Assessment:');
    console.log('================================');
    
    if (restaurants.length === 0) {
      console.log('❌ No restaurants found! Migration will create a default restaurant.');
    } else if (restaurants.length === 1) {
      console.log('✅ Single restaurant setup - all data will be assigned to this restaurant.');
    } else {
      console.log('⚠️  Multiple restaurants found - data will be assigned based on user associations.');
    }
    
    if (orphanedUsers.length > 0) {
      console.log('⚠️  Some users lack restaurant associations - review needed.');
    }
    
    console.log('\n📝 Recommendations:');
    console.log('1. Create a backup before proceeding (use backup-production-db.sh)');
    console.log('2. Review any warnings above');
    console.log('3. Consider running migration during low-traffic period');
    console.log('4. Have rollback plan ready\n');
    
  } catch (error) {
    console.error('❌ Error during pre-check:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

preCheck(); 