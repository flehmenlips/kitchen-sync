const { PrismaClient } = require('@prisma/client');

// EXPLICITLY use production database for READ-ONLY check
const productionDatabaseUrl = process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: productionDatabaseUrl
    }
  }
});

async function checkProductionSchema() {
  console.log('🔍 PRODUCTION DATABASE SCHEMA CHECK (READ-ONLY)');
  console.log('=================================================');

  try {
    // Try to check if navigation fields exist by attempting a simple query
    console.log('\n📊 Testing navigation fields in restaurant_settings...');
    
    try {
      const testQuery = await prisma.restaurantSettings.findFirst({
        select: {
          id: true,
          navigationEnabled: true,
          navigationItems: true
        },
        take: 1
      });
      console.log('✅ Navigation fields exist in production database');
    } catch (error) {
      console.log('❌ Navigation fields do NOT exist in production database');
      console.log('Error:', error.message);
    }

    // Check basic restaurant data
    console.log('\n📊 Checking Restaurant ID 2 (Coq au Vin)...');
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: 2 },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    if (restaurant) {
      console.log(`✅ Restaurant ID 2 exists: "${restaurant.name}" with slug: "${restaurant.slug}"`);
    } else {
      console.log('❌ Restaurant ID 2 NOT found in production');
    }

    // Check restaurant settings for ID 2
    console.log('\n📊 Checking Restaurant Settings for ID 2...');
    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId: 2 },
      select: {
        id: true,
        websiteName: true,
        restaurantId: true
      }
    });

    if (settings) {
      console.log(`✅ Settings found: "${settings.websiteName}" for restaurant ID ${settings.restaurantId}`);
    } else {
      console.log('❌ Settings NOT found for restaurant ID 2');
    }

  } catch (error) {
    console.error('❌ Error checking production schema:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionSchema(); 