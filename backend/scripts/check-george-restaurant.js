require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGeorgeRestaurant() {
  try {
    // Find George's user account
    const george = await prisma.user.findUnique({
      where: { email: 'george@seabreeze.farm' }
    });

    if (!george) {
      console.log('❌ George not found!');
      return;
    }

    console.log('✅ Found George:', { id: george.id, email: george.email, role: george.role });

    // Check restaurant staff assignments
    const staffAssignments = await prisma.restaurantStaff.findMany({
      where: { userId: george.id },
      include: {
        restaurant: true
      }
    });

    console.log('\n📋 Current restaurant assignments:');
    staffAssignments.forEach(sa => {
      console.log(`  - ${sa.restaurant.name} (ID: ${sa.restaurant.id}) - Role: ${sa.role}, Active: ${sa.isActive}`);
    });

    // Check if George has access to Coq au Vin
    const coqAuVin = await prisma.restaurant.findFirst({
      where: { name: 'Coq au Vin' }
    });

    if (!coqAuVin) {
      console.log('\n❌ Coq au Vin restaurant not found!');
      return;
    }

    const hasCoqAuVinAccess = staffAssignments.some(sa => sa.restaurantId === coqAuVin.id);

    if (!hasCoqAuVinAccess) {
      console.log('\n⚠️  George does not have access to Coq au Vin. Creating assignment...');
      
      await prisma.restaurantStaff.create({
        data: {
          userId: george.id,
          restaurantId: coqAuVin.id,
          role: 'OWNER',
          isActive: true
        }
      });

      console.log('✅ Created restaurant assignment for George');
    } else {
      console.log('\n✅ George has access to Coq au Vin');
    }

    // Check data counts
    const recipesCount = await prisma.recipe.count({
      where: { restaurantId: coqAuVin.id }
    });

    const prepTasksCount = await prisma.prepTask.count({
      where: { restaurantId: coqAuVin.id }
    });

    const prepColumnsCount = await prisma.prepColumn.count({
      where: { restaurantId: coqAuVin.id }
    });

    console.log('\n📊 Data counts for Coq au Vin:');
    console.log(`  - Recipes: ${recipesCount}`);
    console.log(`  - Prep Tasks: ${prepTasksCount}`);
    console.log(`  - Prep Columns: ${prepColumnsCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGeorgeRestaurant(); 