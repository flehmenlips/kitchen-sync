const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSubscriptions() {
  try {
    console.log('Updating subscriptions with different plans...\n');

    // Update Samson Bistro to STARTER
    await prisma.subscription.update({
      where: { restaurantId: 1 },
      data: {
        plan: 'STARTER',
        status: 'ACTIVE'
      }
    });
    console.log('Updated Samson Bistro to STARTER plan');

    // Update Tim's Vegan Bistro to PROFESSIONAL
    await prisma.subscription.update({
      where: { restaurantId: 2 },
      data: {
        plan: 'PROFESSIONAL',
        status: 'ACTIVE'
      }
    });
    console.log("Updated Tim's Vegan Bistro to PROFESSIONAL plan");

    // Keep Rose Hip Cafe as TRIAL
    console.log('Kept Rose Hip Cafe as TRIAL plan');

    console.log('\nSubscriptions updated successfully!');
  } catch (error) {
    console.error('Error updating subscriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSubscriptions(); 