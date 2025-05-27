#!/usr/bin/env node

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

if (!databaseUrl || databaseUrl.includes('localhost')) {
  console.error('❌ Not using production database!');
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient();

// Restaurant configurations for each user
const restaurantConfigs = [
  {
    userId: 4, // Rose Test
    restaurantName: "Rose's Test Kitchen",
    slug: 'roses-test-kitchen',
    description: 'Test kitchen for Rose',
    cuisine: 'Test'
  },
  {
    userId: 5, // Brandin Myett
    restaurantName: "Brandin's Kitchen",
    slug: 'brandins-kitchen',
    description: 'Brandin Myett\'s restaurant',
    cuisine: 'American'
  },
  {
    userId: 8, // Boudin Volaille
    restaurantName: 'Boudin Volaille Restaurant',
    slug: 'boudin-volaille',
    description: 'French-inspired cuisine',
    cuisine: 'French'
  },
  {
    userId: 9, // Timothy
    restaurantName: "Timothy's Kitchen",
    slug: 'timothys-kitchen',
    description: 'Timothy\'s culinary creations',
    cuisine: 'International'
  },
  {
    userId: 46, // Tom Hanks (test account)
    restaurantName: "Tom's Test Kitchen",
    slug: 'toms-test-kitchen',
    description: 'Test kitchen for Tom',
    cuisine: 'Test'
  }
];

async function createRestaurantsAndOnboard() {
  console.log('🏪 Creating Restaurants and Onboarding Users');
  console.log('==========================================\n');
  
  try {
    // First, let's create a test user for Seabreeze Kitchen (ID: 1)
    console.log('1. Creating test user for Seabreeze Kitchen...');
    
    // Check if test user already exists
    const testUserExists = await prisma.$queryRaw`
      SELECT id FROM users WHERE email = 'test@seabreeze.kitchen'
    `;
    
    let testUserId;
    if (testUserExists.length === 0) {
      // Create test user with hashed password 'test123'
      const createTestUser = await prisma.$queryRaw`
        INSERT INTO users (email, name, password, role, created_at, updated_at)
        VALUES (
          'test@seabreeze.kitchen',
          'Test User',
          '$2b$10$Mdp.clfdm95Bycy4oEyja.bXj/XjAHsnARvoUZMFBhB95l2DdO/AO',
          'USER',
          NOW(),
          NOW()
        ) RETURNING id
      `;
      testUserId = createTestUser[0].id;
      console.log(`✅ Created test user with ID: ${testUserId}`);
    } else {
      testUserId = testUserExists[0].id;
      console.log(`✅ Test user already exists with ID: ${testUserId}`);
    }
    
    // Assign test user to Seabreeze Kitchen
    await prisma.$queryRaw`
      INSERT INTO restaurant_staff (user_id, restaurant_id, role, is_active, created_at, updated_at)
      VALUES (${testUserId}, 1, 'OWNER', true, NOW(), NOW())
      ON CONFLICT (user_id, restaurant_id) DO NOTHING
    `;
    console.log('✅ Assigned test user to Seabreeze Kitchen\n');
    
    // 2. Create restaurants for users with data
    console.log('2. Creating restaurants for users with data...\n');
    
    for (const config of restaurantConfigs) {
      console.log(`Processing user ID ${config.userId}...`);
      
      // Check if restaurant already exists
      const existingRestaurant = await prisma.$queryRaw`
        SELECT id, name FROM restaurants WHERE slug = ${config.slug}
      `;
      
      let restaurantId;
      if (existingRestaurant.length === 0) {
        // Create restaurant
        const newRestaurant = await prisma.$queryRaw`
          INSERT INTO restaurants (
            name, slug, description, cuisine, is_active, 
            email, phone, address, created_at, updated_at
          ) VALUES (
            ${config.restaurantName},
            ${config.slug},
            ${config.description},
            ${config.cuisine},
            true,
            'info@' || ${config.slug} || '.com',
            '(555) 000-0000',
            '123 Main Street',
            NOW(),
            NOW()
          ) RETURNING id
        `;
        restaurantId = newRestaurant[0].id;
        console.log(`✅ Created restaurant: ${config.restaurantName} (ID: ${restaurantId})`);
      } else {
        restaurantId = existingRestaurant[0].id;
        console.log(`✅ Restaurant already exists: ${existingRestaurant[0].name} (ID: ${restaurantId})`);
      }
      
      // Create restaurant staff assignment
      await prisma.$queryRaw`
        INSERT INTO restaurant_staff (user_id, restaurant_id, role, is_active, created_at, updated_at)
        VALUES (${config.userId}, ${restaurantId}, 'OWNER', true, NOW(), NOW())
        ON CONFLICT (user_id, restaurant_id) DO UPDATE
        SET role = 'OWNER', is_active = true, updated_at = NOW()
      `;
      console.log(`✅ Assigned user as OWNER`);
      
      // Move user's data from restaurant 1 to their new restaurant
      console.log(`🔄 Moving user's data to their restaurant...`);
      
      // Update recipes
      const recipeUpdate = await prisma.$executeRaw`
        UPDATE recipes 
        SET restaurant_id = ${restaurantId}
        WHERE user_id = ${config.userId} AND restaurant_id = 1
      `;
      if (recipeUpdate > 0) console.log(`   - Moved ${recipeUpdate} recipes`);
      
      // Update menus
      const menuUpdate = await prisma.$executeRaw`
        UPDATE menus 
        SET restaurant_id = ${restaurantId}
        WHERE user_id = ${config.userId} AND restaurant_id = 1
      `;
      if (menuUpdate > 0) console.log(`   - Moved ${menuUpdate} menus`);
      
      // Update ingredients
      const ingredientUpdate = await prisma.$executeRaw`
        UPDATE ingredients 
        SET restaurant_id = ${restaurantId}
        WHERE user_id = ${config.userId} AND restaurant_id = 1
      `;
      if (ingredientUpdate > 0) console.log(`   - Moved ${ingredientUpdate} ingredients`);
      
      // Update categories
      const categoryUpdate = await prisma.$executeRaw`
        UPDATE categories 
        SET restaurant_id = ${restaurantId}
        WHERE user_id = ${config.userId} AND restaurant_id = 1
      `;
      if (categoryUpdate > 0) console.log(`   - Moved ${categoryUpdate} categories`);
      
      // Update prep columns
      const prepColumnUpdate = await prisma.$executeRaw`
        UPDATE prep_columns 
        SET restaurant_id = ${restaurantId}
        WHERE user_id = ${config.userId} AND restaurant_id = 1
      `;
      if (prepColumnUpdate > 0) console.log(`   - Moved ${prepColumnUpdate} prep columns`);
      
      console.log();
    }
    
    // 3. Get all restaurants that need platform onboarding
    console.log('\n3. Checking platform onboarding status...\n');
    
    const allRestaurants = await prisma.$queryRaw`
      SELECT r.id, r.name, r.slug,
        (SELECT COUNT(*) FROM subscriptions WHERE restaurant_id = r.id) as has_subscription
      FROM restaurants r
      WHERE r.is_active = true
      ORDER BY r.id
    `;
    
    console.log('Restaurants needing platform onboarding:');
    const needsOnboarding = allRestaurants.filter(r => r.has_subscription === '0');
    
    for (const restaurant of needsOnboarding) {
      console.log(`\n🏪 ${restaurant.name} (ID: ${restaurant.id})`);
      
      // Create subscription record (trial)
      await prisma.$queryRaw`
        INSERT INTO subscriptions (
          restaurant_id, plan, status, current_period_start, 
          current_period_end, trial_ends_at, seats
        ) VALUES (
          ${restaurant.id},
          'TRIAL',
          'TRIAL',
          NOW(),
          NOW() + INTERVAL '30 days',
          NOW() + INTERVAL '30 days',
          5
        ) ON CONFLICT (restaurant_id) DO NOTHING
      `;
      console.log('✅ Created trial subscription');
      
      // Note: Full platform onboarding would include:
      // - Creating Stripe customer
      // - Setting up payment methods
      // - Email verification
      // But for now, we're just creating the subscription record
    }
    
    console.log('\n✅ All restaurants have been created and assigned!');
    console.log('\n📋 Summary:');
    console.log('- Created test user for Seabreeze Kitchen');
    console.log('- Created restaurants for all users with data');
    console.log('- Moved data to respective restaurants');
    console.log('- Added platform subscriptions for all restaurants');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRestaurantsAndOnboard(); 