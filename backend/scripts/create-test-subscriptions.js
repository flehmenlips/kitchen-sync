const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestSubscriptions() {
  try {
    console.log('Creating test subscriptions...');

    // Get all restaurants
    const restaurants = await prisma.restaurant.findMany({
      select: { id: true, name: true }
    });

    if (restaurants.length === 0) {
      console.log('No restaurants found');
      return;
    }

    // Create subscriptions for each restaurant
    for (const restaurant of restaurants) {
      // Check if subscription already exists
      const existing = await prisma.subscription.findUnique({
        where: { restaurantId: restaurant.id }
      });

      if (existing) {
        console.log(`Subscription already exists for ${restaurant.name}`);
        continue;
      }

      // Assign different plans to different restaurants
      let plan;
      let status = 'ACTIVE';
      
      if (restaurant.id === 1) {
        plan = 'STARTER';
      } else if (restaurant.id === 2) {
        plan = 'PROFESSIONAL';
      } else if (restaurant.id === 3) {
        plan = 'TRIAL';
        status = 'TRIAL';
      } else {
        plan = 'STARTER';
      }

      const currentDate = new Date();
      const subscription = await prisma.subscription.create({
        data: {
          restaurantId: restaurant.id,
          plan,
          status,
          currentPeriodStart: currentDate,
          currentPeriodEnd: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days later
          seats: 5,
          billingEmail: `billing@${restaurant.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          billingName: `Billing - ${restaurant.name}`,
          ...(status === 'TRIAL' && {
            trialEndsAt: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
          })
        }
      });

      console.log(`Created ${plan} subscription for ${restaurant.name}`);

      // Create a couple of test invoices for active subscriptions
      if (status === 'ACTIVE') {
        // Last month's invoice
        const lastMonth = new Date(currentDate);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        await prisma.invoice.create({
          data: {
            subscriptionId: subscription.id,
            invoiceNumber: `INV-${restaurant.id}-001`,
            status: 'PAID',
            amount: plan === 'PROFESSIONAL' ? 149 : 49,
            tax: plan === 'PROFESSIONAL' ? 14.90 : 4.90,
            total: plan === 'PROFESSIONAL' ? 163.90 : 53.90,
            currency: 'USD',
            periodStart: lastMonth,
            periodEnd: currentDate,
            paidAt: new Date(lastMonth.getTime() + 3 * 24 * 60 * 60 * 1000) // Paid 3 days after period start
          }
        });

        console.log(`Created invoice for ${restaurant.name}`);
      }
    }

    console.log('Test subscriptions created successfully!');
  } catch (error) {
    console.error('Error creating test subscriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSubscriptions(); 