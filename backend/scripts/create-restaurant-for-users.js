require('dotenv').config({ path: '.env.local' });
const { PrismaClient, OnboardingStatus, SubscriptionPlan, SubscriptionStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function createRestaurantForUsers() {
  console.log('\n=== CREATING RESTAURANT FOR EXISTING USERS ===\n');

  try {
    // Check if restaurant already exists
    const existingRestaurant = await prisma.restaurant.findFirst();
    if (existingRestaurant) {
      console.log('Restaurant already exists!');
      return;
    }

    // Get all users
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.log('No users found!');
      return;
    }

    console.log(`Found ${users.length} users`);
    
    // Use the first user as the owner
    const owner = users[0];
    console.log(`Using ${owner.name} (${owner.email}) as restaurant owner`);

    // Create restaurant with platform fields
    const restaurant = await prisma.restaurant.create({
      data: {
        name: "Demo Restaurant",
        slug: "demo-restaurant",
        email: owner.email,
        phone: "(555) 123-4567",
        address: "123 Main Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        isActive: true,
        // Platform fields
        onboardingStatus: OnboardingStatus.ACTIVE,
        ownerName: owner.name,
        ownerEmail: owner.email,
        businessPhone: "(555) 123-4567",
        businessAddress: "123 Main Street, San Francisco, CA 94105",
        verifiedAt: new Date()
      }
    });

    console.log('✅ Restaurant created:', restaurant.name);

    // Create restaurant staff relationships for all users
    for (const user of users) {
      await prisma.restaurantStaff.create({
        data: {
          userId: user.id,
          restaurantId: restaurant.id,
          isActive: true
        }
      });
      console.log(`✅ Added ${user.name} as staff`);
    }

    // Create trial subscription
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

    const subscription = await prisma.subscription.create({
      data: {
        restaurantId: restaurant.id,
        plan: SubscriptionPlan.TRIAL,
        status: SubscriptionStatus.TRIAL,
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndDate,
        trialEndsAt: trialEndDate,
        seats: 5
      }
    });

    console.log('✅ Created trial subscription');

    // Create some initial data for the restaurant
    console.log('\nCreating initial data...');

    // Create restaurant settings
    const settings = await prisma.restaurantSettings.create({
      data: {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        tagline: "Welcome to Demo Restaurant",
        description: "Experience fine dining at its best",
        primaryColor: "#1976d2",
        secondaryColor: "#dc004e",
        logoUrl: null,
        heroImageUrl: null,
        cuisineType: "American",
        priceRange: "$$",
        openingHours: {
          monday: { open: "11:00", close: "22:00" },
          tuesday: { open: "11:00", close: "22:00" },
          wednesday: { open: "11:00", close: "22:00" },
          thursday: { open: "11:00", close: "22:00" },
          friday: { open: "11:00", close: "23:00" },
          saturday: { open: "11:00", close: "23:00" },
          sunday: { open: "11:00", close: "21:00" }
        }
      }
    });

    console.log('✅ Created restaurant settings');

    // Log platform action
    const platformAdmin = await prisma.platformAdmin.findFirst();
    if (platformAdmin) {
      await prisma.platformAction.create({
        data: {
          adminId: platformAdmin.id,
          action: 'CREATE_RESTAURANT',
          entityType: 'restaurant',
          entityId: restaurant.id,
          metadata: {
            restaurantName: restaurant.name,
            ownerEmail: owner.email,
            createdVia: 'migration_script'
          }
        }
      });
    }

    // Show summary
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
        },
        subscription: true
      }
    });

    console.log('\n📊 Restaurant Summary:');
    console.log('Name:', stats.name);
    console.log('Owner:', stats.ownerName);
    console.log('Status:', stats.onboardingStatus);
    console.log('Subscription:', stats.subscription.plan);
    console.log('Staff:', stats._count.staff);
    console.log('\n✅ Restaurant successfully created and connected to platform!');
    console.log('It should now appear in the platform admin portal.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRestaurantForUsers(); 