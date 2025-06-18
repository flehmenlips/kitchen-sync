const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProductionAPI() {
  try {
    console.log('🔍 Debugging Production API Endpoint...\n');

    // Simulate the exact same query as the API endpoint
    const page = 'home';
    const restaurantSlug = 'coq-au-vin';
    let restaurantId = 1; // Default fallback

    console.log(`1. Input parameters:`);
    console.log(`   - page: ${page}`);
    console.log(`   - restaurantSlug: ${restaurantSlug}`);
    console.log(`   - default restaurantId: ${restaurantId}\n`);

    // Step 1: Look up restaurant by slug (same as API)
    console.log(`2. Looking up restaurant by slug...`);
    if (restaurantSlug) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
        select: { id: true, name: true, slug: true }
      });
      
      console.log(`   - Found restaurant:`, restaurant);
      
      if (restaurant) {
        restaurantId = restaurant.id;
        console.log(`   - Updated restaurantId to: ${restaurantId}`);
      } else {
        console.log(`   - No restaurant found with slug: ${restaurantSlug}`);
      }
    }
    console.log('');

    // Step 2: Query content blocks (same as API)
    console.log(`3. Querying content blocks...`);
    console.log(`   - restaurantId: ${restaurantId}`);
    console.log(`   - page: ${page}`);
    console.log(`   - isActive: true`);
    
    const blocks = await prisma.contentBlock.findMany({
      where: {
        restaurantId,
        page: page,
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    console.log(`   - Query result: ${blocks.length} blocks found`);
    
    if (blocks.length > 0) {
      console.log(`   - Blocks:`);
      blocks.forEach((block, index) => {
        console.log(`     ${index + 1}. ${block.blockType}: ${block.title} (Order: ${block.displayOrder})`);
      });
    } else {
      console.log(`   - No blocks found. Let's investigate...`);
      
      // Debug: Check all blocks for this restaurant
      console.log(`\n4. Debugging - All blocks for restaurant ${restaurantId}:`);
      const allBlocks = await prisma.contentBlock.findMany({
        where: { restaurantId },
        select: { 
          id: true,
          page: true, 
          blockType: true, 
          title: true, 
          displayOrder: true,
          isActive: true 
        }
      });
      
      console.log(`   - Total blocks for restaurant: ${allBlocks.length}`);
      allBlocks.forEach(block => {
        console.log(`     - Page: ${block.page}, Type: ${block.blockType}, Active: ${block.isActive}, Title: ${block.title}`);
      });

      // Debug: Check if any blocks exist for 'home' page regardless of restaurant
      console.log(`\n5. Debugging - All 'home' page blocks (any restaurant):`);
      const homeBlocks = await prisma.contentBlock.findMany({
        where: { page: 'home' },
        select: { 
          id: true,
          restaurantId: true,
          page: true, 
          blockType: true, 
          title: true, 
          displayOrder: true,
          isActive: true 
        }
      });
      
      console.log(`   - Total 'home' blocks: ${homeBlocks.length}`);
      homeBlocks.forEach(block => {
        console.log(`     - Restaurant: ${block.restaurantId}, Type: ${block.blockType}, Active: ${block.isActive}, Title: ${block.title}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProductionAPI(); 