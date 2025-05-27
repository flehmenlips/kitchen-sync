require('dotenv').config({ path: '.env.local' });
const { PrismaClient, OnboardingStatus, SubscriptionPlan, SubscriptionStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function connectRestaurantToPlatform() {
  console.log('\n=== CONNECTING RESTAURANT TO PLATFORM ===\n');

  try {
    // Find the existing restaurant
    const restaurant = await prisma.restaurant.findFirst();
    
    if (!restaurant) {
      console.log('❌ No restaurant found in database!');
      return;
    }

    console.log('Found restaurant:', {
      id: restaurant.id,
      name: restaurant.name,
      email: restaurant.email
    });

    // Check if it already has platform fields
    if (restaurant.onboardingStatus) {
      console.log('✅ Restaurant already connected to platform!');
      console.log('Onboarding status:', restaurant.onboardingStatus);
      
      // Check if subscription exists
      const subscription = await prisma.subscription.findUnique({
        where: { restaurantId: restaurant.id }
      });
      
      if (subscription) {
        console.log('✅ Subscription exists:', subscription.plan, subscription.status);
      } else {
        console.log('⚠️  No subscription found, creating trial subscription...');
        await createTrialSubscription(restaurant.id);
      }
      
      return;
    }

    // Update restaurant with platform fields
    console.log('\nUpdating restaurant with platform fields...');
    
    // Get the first user as the owner
    const owner = await prisma.user.findFirst({
      where: { role: 'SuperAdmin' }
    }) || await prisma.user.findFirst();

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        onboardingStatus: OnboardingStatus.ACTIVE,
        ownerName: owner?.name || 'Restaurant Owner',
        ownerEmail: owner?.email || restaurant.email,
        businessPhone: restaurant.phone,
        businessAddress: restaurant.address,
        verifiedAt: new Date()
      }
    });

    console.log('✅ Restaurant updated with platform fields!');

    // Create trial subscription
    await createTrialSubscription(restaurant.id);

    // Show updated stats
    const stats = await prisma.restaurant.findUnique({
      where: { id: restaurant.id },
      include: {
        _count: {
          select: {
            staff: true,
            reservations: true,
            customers: true,
            orders: true
          }
        }
      }
    });

    console.log('\n📊 Restaurant Stats:');
    console.log('Staff:', stats._count.staff);
    console.log('Reservations:', stats._count.reservations);
    console.log('Customers:', stats._count.customers);
    console.log('Orders:', stats._count.orders);

    console.log('\n✅ Restaurant successfully connected to platform!');
    console.log('It should now appear in the platform admin portal.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTrialSubscription(restaurantId) {
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

  const subscription = await prisma.subscription.create({
    data: {
      restaurantId,
      plan: SubscriptionPlan.TRIAL,
      status: SubscriptionStatus.TRIAL,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEndDate,
      trialEndsAt: trialEndDate,
      seats: 5
    }
  });

  console.log('✅ Created trial subscription:', {
    plan: subscription.plan,
    trialEndsAt: subscription.trialEndsAt
  });

  return subscription;
}

// Run the script
connectRestaurantToPlatform(); 