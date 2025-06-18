const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testContentBlocks() {
  try {
    console.log('🔍 Testing Content Blocks in Production...\n');

    // Test 1: Check all restaurants
    console.log('1. All Restaurants:');
    const restaurants = await prisma.restaurant.findMany({
      select: { id: true, name: true, slug: true }
    });
    console.log(restaurants);
    console.log('');

    // Test 2: Find coq-au-vin restaurant
    console.log('2. Looking for coq-au-vin restaurant:');
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'coq-au-vin' }
    });
    console.log(restaurant);
    console.log('');

    if (restaurant) {
      // Test 3: Check content blocks for this restaurant
      console.log(`3. Content blocks for restaurant ID ${restaurant.id}:`);
      const contentBlocks = await prisma.contentBlock.findMany({
        where: { 
          restaurantId: restaurant.id,
          page: 'home'
        },
        orderBy: { displayOrder: 'asc' }
      });
      console.log(`Found ${contentBlocks.length} content blocks:`);
      contentBlocks.forEach(block => {
        console.log(`- ${block.blockType}: ${block.title} (Order: ${block.displayOrder})`);
      });
    }

    // Test 4: Check all content blocks
    console.log('\n4. All Content Blocks:');
    const allBlocks = await prisma.contentBlock.findMany({
      select: { 
        id: true, 
        restaurantId: true, 
        page: true, 
        blockType: true, 
        title: true,
        displayOrder: true
      }
    });
    console.log(`Total content blocks: ${allBlocks.length}`);
    allBlocks.forEach(block => {
      console.log(`- Restaurant ${block.restaurantId}: ${block.page}/${block.blockType} - ${block.title}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContentBlocks(); 