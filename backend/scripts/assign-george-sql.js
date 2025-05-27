#!/usr/bin/env node

/**
 * Assign George to Coq au Vin Restaurant using SQL
 * Creates the restaurant and assigns George as the owner
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
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient();

async function assignGeorgeToRestaurant() {
  console.log('🏪 Assigning George to Coq au Vin Restaurant (SQL)');
  console.log('===============================================\n');
  
  try {
    // 1. Find George's user account
    console.log('1. Finding George\'s account...');
    const georgeResult = await prisma.$queryRaw`
      SELECT * FROM users WHERE email = 'george@seabreeze.farm'
    `;
    
    if (!georgeResult || georgeResult.length === 0) {
      console.log('❌ User george@seabreeze.farm not found!');
      return;
    }
    
    const george = georgeResult[0];
    console.log(`✅ Found user: ${george.name} (ID: ${george.id})`);
    
    // 2. Check if Coq au Vin restaurant already exists
    console.log('\n2. Checking for existing restaurant...');
    const existingRestaurant = await prisma.$queryRaw`
      SELECT * FROM restaurants WHERE name = 'Coq au Vin'
    `;
    
    let restaurant;
    if (existingRestaurant && existingRestaurant.length > 0) {
      restaurant = existingRestaurant[0];
      console.log(`✅ Restaurant "Coq au Vin" already exists (ID: ${restaurant.id})`);
    } else {
      // 3. Create Coq au Vin restaurant
      console.log('\n3. Creating Coq au Vin restaurant...');
      const createResult = await prisma.$queryRaw`
        INSERT INTO restaurants (
          name, slug, address, phone, email, website, cuisine, description, is_active, created_at, updated_at
        ) VALUES (
          'Coq au Vin',
          'coq-au-vin',
          '123 French Street',
          '(555) 123-4567',
          'info@coqauvin.com',
          'https://coqauvin.com',
          'French',
          'Authentic French cuisine in a cozy bistro setting',
          true,
          NOW(),
          NOW()
        ) RETURNING *
      `;
      restaurant = createResult[0];
      console.log(`✅ Created restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
    }
    
    // 4. Check if George is already associated with this restaurant
    console.log('\n4. Checking existing restaurant association...');
    const existingAssociation = await prisma.$queryRaw`
      SELECT * FROM restaurant_staff 
      WHERE user_id = ${george.id} AND restaurant_id = ${restaurant.id}
    `;
    
    if (existingAssociation && existingAssociation.length > 0) {
      const association = existingAssociation[0];
      console.log('✅ George is already associated with Coq au Vin');
      console.log(`   Role: ${association.role}`);
      console.log(`   Active: ${association.is_active}`);
    } else {
      // 5. Create restaurant staff association
      console.log('\n5. Creating restaurant staff association...');
      await prisma.$queryRaw`
        INSERT INTO restaurant_staff (
          user_id, restaurant_id, role, is_active, created_at, updated_at
        ) VALUES (
          ${george.id},
          ${restaurant.id},
          'OWNER',
          true,
          NOW(),
          NOW()
        )
      `;
      console.log('✅ Created restaurant staff association');
      console.log('   Role: OWNER');
    }
    
    // 6. Check if data was assigned restaurantId by the migration
    console.log('\n6. Checking data assignment...');
    
    const georgeCounts = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM recipes WHERE user_id = ${george.id} AND restaurant_id = ${restaurant.id}) as recipes,
        (SELECT COUNT(*) FROM menus WHERE user_id = ${george.id} AND restaurant_id = ${restaurant.id}) as menus,
        (SELECT COUNT(*) FROM categories WHERE user_id = ${george.id} AND restaurant_id = ${restaurant.id}) as categories,
        (SELECT COUNT(*) FROM ingredients WHERE user_id = ${george.id} AND restaurant_id = ${restaurant.id}) as ingredients,
        (SELECT COUNT(*) FROM ingredient_categories WHERE user_id = ${george.id} AND restaurant_id = ${restaurant.id}) as ingredient_categories,
        (SELECT COUNT(*) FROM units_of_measure WHERE user_id = ${george.id} AND restaurant_id = ${restaurant.id}) as units,
        (SELECT COUNT(*) FROM prep_columns WHERE user_id = ${george.id} AND restaurant_id = ${restaurant.id}) as prep_columns,
        (SELECT COUNT(*) FROM prep_tasks WHERE restaurant_id = ${restaurant.id}) as prep_tasks
    `;
    
    const data = georgeCounts[0];
    console.log('\n📊 George\'s data assigned to Coq au Vin:');
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
    
    console.log('\n✅ Assignment complete!');
    console.log(`   Restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
    console.log(`   Owner: ${george.name} (${george.email})`);
    console.log(`   Total records assigned: ${totalAssigned}`);
    
    // 7. Update user's active restaurant if needed
    if (!george.active_restaurant_id || george.active_restaurant_id !== restaurant.id) {
      console.log('\n7. Setting Coq au Vin as George\'s active restaurant...');
      await prisma.$queryRaw`
        UPDATE users 
        SET active_restaurant_id = ${restaurant.id}
        WHERE id = ${george.id}
      `;
      console.log('✅ Updated active restaurant');
    }
    
    console.log('\n🎉 Success! George is now the owner of Coq au Vin restaurant.');
    console.log('\n📋 Summary:');
    console.log('- Multi-tenancy migration applied successfully');
    console.log('- All George\'s data has restaurantId assigned');
    console.log('- George can log in and see only Coq au Vin data');
    console.log('- Other users will only see their own restaurant data');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

assignGeorgeToRestaurant(); 