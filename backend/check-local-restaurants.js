const { PrismaClient } = require('@prisma/client');

async function checkLocalRestaurants() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://georgepage@localhost/kitchensync_dev' } }
  });

  try {
    const restaurants = await prisma.restaurant.findMany({ 
      select: { id: true, name: true, slug: true } 
    });
    console.log('Local restaurants:', restaurants);
    
    if (restaurants.length > 0) {
      // Test the first restaurant
      const testSlug = restaurants[0].slug;
      console.log(`\nTesting API with slug: ${testSlug}`);
      console.log(`URL: http://localhost:3001/api/restaurant/public/slug/${testSlug}/settings`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLocalRestaurants(); 