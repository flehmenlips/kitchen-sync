#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verifying Multi-Tenant Migration...\n');
  
  try {
    // 1. Check all models have restaurant_id
    console.log('1️⃣  Checking restaurant_id fields...');
    
    const models = [
      { name: 'recipes', count: await prisma.recipe.count() },
      { name: 'menus', count: await prisma.menu.count() },
      { name: 'categories', count: await prisma.category.count() },
      { name: 'ingredients', count: await prisma.ingredient.count() },
      { name: 'ingredientCategories', count: await prisma.ingredientCategory.count() },
      { name: 'units', count: await prisma.unitOfMeasure.count() },
      { name: 'prepColumns', count: await prisma.prepColumn.count() },
      { name: 'prepTasks', count: await prisma.prepTask.count() }
    ];
    
    for (const model of models) {
      // Check for any records without restaurant_id
      const query = `SELECT COUNT(*) as count FROM ${model.name === 'ingredientCategories' ? 'ingredient_categories' : 
                     model.name === 'units' ? 'units_of_measure' : 
                     model.name === 'prepColumns' ? 'prep_columns' : 
                     model.name === 'prepTasks' ? 'prep_tasks' :
                     model.name} WHERE restaurant_id IS NULL`;
      
      const result = await prisma.$queryRawUnsafe(query);
      const nullCount = parseInt(result[0].count);
      
      if (nullCount > 0) {
        console.log(`   ❌ ${model.name}: ${nullCount} records without restaurant_id`);
      } else {
        console.log(`   ✅ ${model.name}: All ${model.count} records have restaurant_id`);
      }
    }
    
    // 2. Check restaurant assignments
    console.log('\n2️⃣  Checking restaurant assignments...');
    const restaurants = await prisma.restaurant.findMany({
      include: {
        _count: {
          select: {
            recipes: true,
            menus: true,
            categories: true,
            ingredients: true,
            ingredientCategories: true,
            units: true,
            prepColumns: true,
            prepTasks: true
          }
        }
      }
    });
    
    for (const restaurant of restaurants) {
      console.log(`\n   Restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
      console.log(`   - Recipes: ${restaurant._count.recipes}`);
      console.log(`   - Menus: ${restaurant._count.menus}`);
      console.log(`   - Categories: ${restaurant._count.categories}`);
      console.log(`   - Ingredients: ${restaurant._count.ingredients}`);
      console.log(`   - Ingredient Categories: ${restaurant._count.ingredientCategories}`);
      console.log(`   - Units: ${restaurant._count.units}`);
      console.log(`   - Prep Columns: ${restaurant._count.prepColumns}`);
      console.log(`   - Prep Tasks: ${restaurant._count.prepTasks}`);
    }
    
    // 3. Check for orphaned data
    console.log('\n3️⃣  Checking for orphaned data...');
    
    // Check if all restaurant_ids are valid
    const invalidRestaurantIds = await prisma.$queryRaw`
      SELECT DISTINCT r.restaurant_id, 'recipes' as table_name
      FROM recipes r
      LEFT JOIN restaurants res ON r.restaurant_id = res.id
      WHERE res.id IS NULL
      UNION
      SELECT DISTINCT m.restaurant_id, 'menus' as table_name
      FROM menus m
      LEFT JOIN restaurants res ON m.restaurant_id = res.id
      WHERE res.id IS NULL
      UNION
      SELECT DISTINCT i.restaurant_id, 'ingredients' as table_name
      FROM ingredients i
      LEFT JOIN restaurants res ON i.restaurant_id = res.id
      WHERE res.id IS NULL
    `;
    
    if (invalidRestaurantIds.length > 0) {
      console.log(`   ❌ Found ${invalidRestaurantIds.length} invalid restaurant references`);
      invalidRestaurantIds.forEach(row => {
        console.log(`      - Table: ${row.table_name}, Restaurant ID: ${row.restaurant_id}`);
      });
    } else {
      console.log('   ✅ All restaurant references are valid');
    }
    
    // 4. Check user-restaurant associations
    console.log('\n4️⃣  Checking user-restaurant associations...');
    const users = await prisma.user.findMany({
      where: { isCustomer: false },
      include: {
        restaurantStaff: {
          include: {
            restaurant: true
          }
        }
      }
    });
    
    for (const user of users) {
      const restaurants = user.restaurantStaff.map(rs => rs.restaurant.name).join(', ');
      console.log(`   - ${user.name || user.email}: ${restaurants || 'No restaurant assigned'}`);
    }
    
    // 5. Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   - Total Restaurants: ${restaurants.length}`);
    console.log(`   - Total Users: ${users.length}`);
    console.log(`   - Total Records Migrated:`);
    
    let totalMigrated = 0;
    for (const model of models) {
      totalMigrated += model.count;
    }
    console.log(`     ${totalMigrated} records across all models`);
    
    console.log('\n✅ Migration verification complete!');
    
  } catch (error) {
    console.error('❌ Verification Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMigration(); 