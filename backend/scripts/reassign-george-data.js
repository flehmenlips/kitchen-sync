#!/usr/bin/env node

/**
 * Reassign George's Data to Coq au Vin
 * Moves all data from restaurant 1 to restaurant 2
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
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient();

async function reassignGeorgeData() {
  console.log('🔄 Reassigning George\'s Data to Coq au Vin');
  console.log('=========================================\n');
  
  try {
    const georgeId = 2;
    const oldRestaurantId = 1;
    const newRestaurantId = 2; // Coq au Vin
    
    console.log(`Moving data from restaurant ${oldRestaurantId} to restaurant ${newRestaurantId} for user ${georgeId}...\n`);
    
    // Update each table
    const updates = [
      {
        table: 'recipes',
        result: await prisma.$executeRaw`
          UPDATE recipes 
          SET restaurant_id = ${newRestaurantId} 
          WHERE user_id = ${georgeId} AND restaurant_id = ${oldRestaurantId}
        `
      },
      {
        table: 'menus',
        result: await prisma.$executeRaw`
          UPDATE menus 
          SET restaurant_id = ${newRestaurantId} 
          WHERE user_id = ${georgeId} AND restaurant_id = ${oldRestaurantId}
        `
      },
      {
        table: 'categories',
        result: await prisma.$executeRaw`
          UPDATE categories 
          SET restaurant_id = ${newRestaurantId} 
          WHERE user_id = ${georgeId} AND restaurant_id = ${oldRestaurantId}
        `
      },
      {
        table: 'ingredients',
        result: await prisma.$executeRaw`
          UPDATE ingredients 
          SET restaurant_id = ${newRestaurantId} 
          WHERE user_id = ${georgeId} AND restaurant_id = ${oldRestaurantId}
        `
      },
      {
        table: 'ingredient_categories',
        result: await prisma.$executeRaw`
          UPDATE ingredient_categories 
          SET restaurant_id = ${newRestaurantId} 
          WHERE user_id = ${georgeId} AND restaurant_id = ${oldRestaurantId}
        `
      },
      {
        table: 'units_of_measure',
        result: await prisma.$executeRaw`
          UPDATE units_of_measure 
          SET restaurant_id = ${newRestaurantId} 
          WHERE user_id = ${georgeId} AND restaurant_id = ${oldRestaurantId}
        `
      },
      {
        table: 'prep_columns',
        result: await prisma.$executeRaw`
          UPDATE prep_columns 
          SET restaurant_id = ${newRestaurantId} 
          WHERE user_id = ${georgeId} AND restaurant_id = ${oldRestaurantId}
        `
      }
    ];
    
    // Also update prep_tasks (they don't have user_id, but we need to update based on prep_columns)
    const prepTaskResult = await prisma.$executeRaw`
      UPDATE prep_tasks 
      SET restaurant_id = ${newRestaurantId} 
      WHERE restaurant_id = ${oldRestaurantId} 
        AND column_id IN (
          SELECT id FROM prep_columns WHERE user_id = ${georgeId}
        )
    `;
    
    console.log('📊 Update Results:');
    updates.forEach(({ table, result }) => {
      console.log(`   ${table}: ${result} records updated`);
    });
    console.log(`   prep_tasks: ${prepTaskResult} records updated`);
    
    // Verify the reassignment
    console.log('\n✅ Verifying reassignment...');
    
    const georgeCounts = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM recipes WHERE user_id = ${georgeId} AND restaurant_id = ${newRestaurantId}) as recipes,
        (SELECT COUNT(*) FROM menus WHERE user_id = ${georgeId} AND restaurant_id = ${newRestaurantId}) as menus,
        (SELECT COUNT(*) FROM categories WHERE user_id = ${georgeId} AND restaurant_id = ${newRestaurantId}) as categories,
        (SELECT COUNT(*) FROM ingredients WHERE user_id = ${georgeId} AND restaurant_id = ${newRestaurantId}) as ingredients,
        (SELECT COUNT(*) FROM ingredient_categories WHERE user_id = ${georgeId} AND restaurant_id = ${newRestaurantId}) as ingredient_categories,
        (SELECT COUNT(*) FROM units_of_measure WHERE user_id = ${georgeId} AND restaurant_id = ${newRestaurantId}) as units,
        (SELECT COUNT(*) FROM prep_columns WHERE user_id = ${georgeId} AND restaurant_id = ${newRestaurantId}) as prep_columns,
        (SELECT COUNT(*) FROM prep_tasks WHERE restaurant_id = ${newRestaurantId}) as prep_tasks
    `;
    
    const data = georgeCounts[0];
    console.log('\n📊 George\'s data now assigned to Coq au Vin:');
    console.log(`   Recipes: ${data.recipes}`);
    console.log(`   Menus: ${data.menus}`);
    console.log(`   Categories: ${data.categories}`);
    console.log(`   Ingredients: ${data.ingredients}`);
    console.log(`   Ingredient Categories: ${data.ingredient_categories}`);
    console.log(`   Units: ${data.units}`);
    console.log(`   Prep Columns: ${data.prep_columns}`);
    console.log(`   Prep Tasks: ${data.prep_tasks}`);
    
    const totalAssigned = parseInt(data.recipes) + parseInt(data.menus) + parseInt(data.categories) + 
                         parseInt(data.ingredients) + parseInt(data.ingredient_categories) + 
                         parseInt(data.units) + parseInt(data.prep_columns) + parseInt(data.prep_tasks);
    
    console.log('\n🎉 Reassignment complete!');
    console.log(`   Total records now assigned to Coq au Vin: ${totalAssigned}`);
    console.log('\n✅ George can now log in and see all his data under Coq au Vin restaurant.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

reassignGeorgeData(); 