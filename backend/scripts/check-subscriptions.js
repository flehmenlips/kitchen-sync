require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSubscriptions() {
  try {
    console.log('Checking subscriptions in LOCAL database...\n');

    // Get all subscriptions with restaurant info
    const subscriptions = await prisma.subscription.findMany({
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (subscriptions.length === 0) {
      console.log('No subscriptions found in the database.');
      return;
    }

    console.log(`Found ${subscriptions.length} subscriptions:\n`);
    
    subscriptions.forEach(sub => {
      console.log(`Restaurant: ${sub.restaurant.name} (ID: ${sub.restaurant.id})`);
      console.log(`  Plan: ${sub.plan}`);
      console.log(`  Status: ${sub.status}`);
      console.log(`  Seats: ${sub.seats}`);
      console.log(`  Current Period: ${sub.currentPeriodStart.toLocaleDateString()} - ${sub.currentPeriodEnd.toLocaleDateString()}`);
      console.log(`  Stripe Customer ID: ${sub.stripeCustomerId || 'Not set'}`);
      console.log(`  Stripe Subscription ID: ${sub.stripeSubId || 'Not set'}`);
      console.log('---');
    });

    // Also check which restaurants don't have subscriptions
    const restaurantsWithoutSubs = await prisma.restaurant.findMany({
      where: {
        subscription: null
      },
      select: {
        id: true,
        name: true
      }
    });

    if (restaurantsWithoutSubs.length > 0) {
      console.log(`\nRestaurants without subscriptions:`);
      restaurantsWithoutSubs.forEach(r => {
        console.log(`  - ${r.name} (ID: ${r.id})`);
      });
    }

  } catch (error) {
    console.error('Error checking subscriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptions(); 