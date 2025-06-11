const { PrismaClient } = require('@prisma/client');

async function checkRestaurantSettings() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://georgepage@localhost/kitchensync_dev' } }
  });

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'samson-bistro' },
      select: { id: true, name: true, slug: true }
    });
    
    console.log('Restaurant:', restaurant);
    
    if (restaurant) {
      const settings = await prisma.restaurantSettings.findUnique({
        where: { restaurantId: restaurant.id }
      });
      
      console.log('Settings exist:', !!settings);
      if (settings) {
        console.log('Settings keys:', Object.keys(settings));
      } else {
        console.log('No settings found - this is the problem!');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRestaurantSettings(); 