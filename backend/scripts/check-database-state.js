require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseState() {
  console.log('\n=== DATABASE STATE CHECK ===\n');

  try {
    // Check restaurants
    const restaurants = await prisma.restaurant.findMany();
    console.log(`Found ${restaurants.length} restaurants:`);
    restaurants.forEach(r => {
      console.log(`- ${r.name} (ID: ${r.id}, Status: ${r.onboardingStatus || 'Not connected'})`);
    });

    // Check users
    console.log('\n---');
    const users = await prisma.user.findMany();
    console.log(`\nFound ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}, Role: ${u.role})`);
    });

    // Check platform admins
    console.log('\n---');
    const platformAdmins = await prisma.platformAdmin.findMany();
    console.log(`\nFound ${platformAdmins.length} platform admins:`);
    platformAdmins.forEach(a => {
      console.log(`- ${a.name} (${a.email}, Role: ${a.role})`);
    });

    // Check subscriptions
    console.log('\n---');
    const subscriptions = await prisma.subscription.findMany();
    console.log(`\nFound ${subscriptions.length} subscriptions`);

    // If no restaurant but users exist, offer to create one
    if (restaurants.length === 0 && users.length > 0) {
      console.log('\n⚠️  No restaurants found but users exist!');
      console.log('You might need to create a restaurant for these users.');
      console.log('Run: node scripts/create-restaurant-for-users.js');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState(); 