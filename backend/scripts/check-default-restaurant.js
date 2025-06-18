const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDefaultRestaurant() {
  try {
    console.log('Checking default restaurant (ID: 1)...');
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: 1 },
      select: { name: true, slug: true }
    });
    console.log('Restaurant ID 1:', restaurant);
    
    const blocks = await prisma.contentBlock.findMany({
      where: { restaurantId: 1, page: 'home', isActive: true },
      select: { id: true, title: true, blockType: true }
    });
    console.log('Blocks for restaurant 1:', blocks);
    
    // Test the exact query our API uses
    const coqAuVin = await prisma.restaurant.findUnique({
      where: { slug: 'coq-au-vin' },
      select: { id: true }
    });
    console.log('Coq au Vin lookup result:', coqAuVin);
    
    if (coqAuVin) {
      const coqBlocks = await prisma.contentBlock.findMany({
        where: {
          restaurantId: coqAuVin.id,
          page: 'home',
          isActive: true
        },
        orderBy: {
          displayOrder: 'asc'
        }
      });
      console.log('Coq au Vin blocks (exact API query):', coqBlocks.length);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkDefaultRestaurant(); 