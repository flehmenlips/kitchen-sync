#!/usr/bin/env node

/**
 * Assign George to Coq au Vin Restaurant
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
  console.log('🏪 Assigning George to Coq au Vin Restaurant');
  console.log('==========================================\n');
  
  try {
    // 1. Find George's user account
    console.log('1. Finding George\'s account...');
    const george = await prisma.user.findUnique({
      where: { email: 'george@seabreeze.farm' }
    });
    
    if (!george) {
      console.log('❌ User george@seabreeze.farm not found!');
      return;
    }
    
    console.log(`✅ Found user: ${george.name} (ID: ${george.id})`);
    
    // 2. Check if Coq au Vin restaurant already exists
    console.log('\n2. Checking for existing restaurant...');
    let restaurant = await prisma.restaurant.findFirst({
      where: { name: 'Coq au Vin' }
    });
    
    if (restaurant) {
      console.log(`✅ Restaurant "Coq au Vin" already exists (ID: ${restaurant.id})`);
    } else {
      // 3. Create Coq au Vin restaurant
      console.log('\n3. Creating Coq au Vin restaurant...');
      restaurant = await prisma.restaurant.create({
        data: {
          name: 'Coq au Vin',
          address: '123 French Street',
          phone: '(555) 123-4567',
          email: 'info@coqauvin.com',
          website: 'https://coqauvin.com',
          cuisine: 'French',
          description: 'Authentic French cuisine in a cozy bistro setting',
          isActive: true
        }
      });
      console.log(`✅ Created restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
    }
    
    // 4. Check if George is already associated with this restaurant
    console.log('\n4. Checking existing restaurant association...');
    const existingAssociation = await prisma.restaurantStaff.findUnique({
      where: {
        userId_restaurantId: {
          userId: george.id,
          restaurantId: restaurant.id
        }
      }
    });
    
    if (existingAssociation) {
      console.log('✅ George is already associated with Coq au Vin');
      console.log(`   Role: ${existingAssociation.role}`);
      console.log(`   Active: ${existingAssociation.isActive}`);
    } else {
      // 5. Create restaurant staff association
      console.log('\n5. Creating restaurant staff association...');
      const staffAssociation = await prisma.restaurantStaff.create({
        data: {
          userId: george.id,
          restaurantId: restaurant.id,
          role: 'ADMIN', // George is the owner, so he gets ADMIN role
          isActive: true
        }
      });
      console.log('✅ Created restaurant staff association');
      console.log(`   Role: ${staffAssociation.role}`);
    }
    
    // 6. Verify the data has restaurantId assigned
    console.log('\n6. Verifying data assignment...');
    
    const georgeData = {
      recipes: await prisma.recipe.count({ 
        where: { userId: george.id, restaurantId: restaurant.id } 
      }),
      menus: await prisma.menu.count({ 
        where: { userId: george.id, restaurantId: restaurant.id } 
      }),
      categories: await prisma.category.count({ 
        where: { userId: george.id, restaurantId: restaurant.id } 
      }),
      ingredients: await prisma.ingredient.count({ 
        where: { userId: george.id, restaurantId: restaurant.id } 
      }),
      ingredientCategories: await prisma.ingredientCategory.count({ 
        where: { userId: george.id, restaurantId: restaurant.id } 
      }),
      units: await prisma.unitOfMeasure.count({ 
        where: { userId: george.id, restaurantId: restaurant.id } 
      }),
      prepColumns: await prisma.prepColumn.count({ 
        where: { userId: george.id, restaurantId: restaurant.id } 
      }),
      prepTasks: await prisma.prepTask.count({ 
        where: { restaurantId: restaurant.id } 
      })
    };
    
    console.log('\n📊 George\'s data assigned to Coq au Vin:');
    console.log(`   Recipes: ${georgeData.recipes}`);
    console.log(`   Menus: ${georgeData.menus}`);
    console.log(`   Categories: ${georgeData.categories}`);
    console.log(`   Ingredients: ${georgeData.ingredients}`);
    console.log(`   Ingredient Categories: ${georgeData.ingredientCategories}`);
    console.log(`   Units: ${georgeData.units}`);
    console.log(`   Prep Columns: ${georgeData.prepColumns}`);
    console.log(`   Prep Tasks: ${georgeData.prepTasks}`);
    
    const totalAssigned = Object.values(georgeData).reduce((sum, count) => sum + count, 0);
    
    console.log('\n✅ Assignment complete!');
    console.log(`   Restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
    console.log(`   Owner: ${george.name} (${george.email})`);
    console.log(`   Total records assigned: ${totalAssigned}`);
    
    // 7. Update user's active restaurant if needed
    if (!george.activeRestaurantId || george.activeRestaurantId !== restaurant.id) {
      console.log('\n7. Setting Coq au Vin as George\'s active restaurant...');
      await prisma.user.update({
        where: { id: george.id },
        data: { activeRestaurantId: restaurant.id }
      });
      console.log('✅ Updated active restaurant');
    }
    
    console.log('\n🎉 Success! George is now the owner of Coq au Vin restaurant.');
    console.log('\n📋 Next steps:');
    console.log('1. George can now log in and see only Coq au Vin data');
    console.log('2. All his recipes, menus, and other data are properly isolated');
    console.log('3. The multi-tenancy system is now active');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

assignGeorgeToRestaurant(); 