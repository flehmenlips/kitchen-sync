const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRestaurantSetup() {
  try {
    // Try to find users
    console.log('Looking for users...');
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'george' } },
          { name: { contains: 'George' } }
        ]
      },
      include: {
        restaurantStaff: {
          include: {
            restaurant: true
          }
        }
      }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`\nUser: ${user.email}`);
      console.log(`- ID: ${user.id}`);
      console.log(`- Name: ${user.name}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Restaurant Staff Relationships: ${user.restaurantStaff.length}`);
      
      user.restaurantStaff.forEach(staff => {
        console.log(`  * Restaurant: ${staff.restaurant.name} (ID: ${staff.restaurantId})`);
        console.log(`    Role: ${staff.role}, Active: ${staff.isActive}`);
      });
    });

    // Check if Coq au Vin exists
    const coqAuVin = await prisma.restaurant.findFirst({
      where: { name: { contains: 'Coq au Vin' } },
      include: {
        subscription: true,
        settings: true,
        _count: {
          select: {
            staff: true,
            menus: true,
            recipes: true
          }
        }
      }
    });

    if (coqAuVin) {
      console.log('\n=== Coq au Vin Restaurant ===');
      console.log('- ID:', coqAuVin.id);
      console.log('- Name:', coqAuVin.name);
      console.log('- Slug:', coqAuVin.slug);
      console.log('- Active:', coqAuVin.isActive);
      console.log('- Owner Email:', coqAuVin.ownerEmail);
      console.log('- Staff count:', coqAuVin._count.staff);
      console.log('- Menu count:', coqAuVin._count.menus);
      console.log('- Recipe count:', coqAuVin._count.recipes);
      console.log('- Has settings:', !!coqAuVin.settings);
      console.log('- Has subscription:', !!coqAuVin.subscription);
      
      if (coqAuVin.subscription) {
        console.log('\nSubscription:');
        console.log('- Plan:', coqAuVin.subscription.plan);
        console.log('- Status:', coqAuVin.subscription.status);
        console.log('- Trial ends:', coqAuVin.subscription.trialEndsAt);
      }

      // Check staff members
      const staff = await prisma.restaurantStaff.findMany({
        where: { restaurantId: coqAuVin.id },
        include: { user: true }
      });

      console.log('\nStaff Members:');
      staff.forEach(s => {
        console.log(`- ${s.user.email} (${s.user.name}) - Role: ${s.role}, Active: ${s.isActive}`);
      });
    } else {
      console.log('\nCoq au Vin restaurant not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRestaurantSetup(); 