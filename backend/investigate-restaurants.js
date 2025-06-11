const { PrismaClient } = require('@prisma/client');

// EXPLICITLY use local database
const localDatabaseUrl = "postgresql://georgepage@localhost/kitchensync_dev";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: localDatabaseUrl
    }
  }
});

async function investigateRestaurants() {
  console.log('🔍 SAFE INVESTIGATION - LOCAL DATABASE ONLY');
  console.log('Database URL:', localDatabaseUrl);
  console.log('========================================\n');

  try {
    // Check all restaurants
    console.log('📊 ALL RESTAURANTS:');
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });
    
    restaurants.forEach(restaurant => {
      console.log(`ID: ${restaurant.id} | Name: "${restaurant.name}" | Slug: "${restaurant.slug}"`);
    });

    console.log('\n📊 DETAILED CHECK - Restaurant ID 2 (Coq au Vin):');
    const coqAuVin = await prisma.restaurant.findUnique({
      where: { id: 2 },
      include: {
        settings: true,
        menus: true
      }
    });

    if (coqAuVin) {
      console.log('✅ Coq au Vin EXISTS in local database');
      console.log(`Name: ${coqAuVin.name}`);
      console.log(`Slug: ${coqAuVin.slug}`);
      console.log(`Has Settings: ${coqAuVin.settings ? 'YES' : 'NO'}`);
      console.log(`Menu Count: ${coqAuVin.menus?.length || 0}`);
    } else {
      console.log('❌ Coq au Vin NOT FOUND in local database');
    }

    console.log('\n📊 Restaurant Settings:');
    const settings = await prisma.restaurantSettings.findMany({
      select: {
        restaurantId: true,
        websiteName: true,
        navigationEnabled: true,
        navigationItems: true
      },
      orderBy: { restaurantId: 'asc' }
    });

    settings.forEach(setting => {
      console.log(`Restaurant ID ${setting.restaurantId}: "${setting.websiteName}" | Nav Enabled: ${setting.navigationEnabled}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

investigateRestaurants(); 