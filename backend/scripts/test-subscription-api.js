const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSubscriptionQuery() {
  try {
    console.log('Testing subscription query...\n');

    // Test the exact query used in the API
    const where = {};
    
    const total = await prisma.subscription.count({ where });
    console.log(`Total subscriptions: ${total}`);

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerEmail: true,
            ownerName: true
          }
        },
        _count: {
          select: {
            invoices: true,
            usageRecords: true
          }
        }
      },
      take: 20,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\nFound ${subscriptions.length} subscriptions:`);
    subscriptions.forEach(sub => {
      console.log(`- ${sub.restaurant.name}: ${sub.plan} (${sub.status})`);
    });

  } catch (error) {
    console.error('Error in subscription query:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSubscriptionQuery(); 