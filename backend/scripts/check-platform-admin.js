const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPlatformAdmin() {
  try {
    console.log('Checking platform admin in LOCAL database...\n');

    const admin = await prisma.platformAdmin.findUnique({
      where: { email: 'george@seabreeze.farm' }
    });

    if (!admin) {
      console.log('Platform admin not found');
      return;
    }

    console.log('Platform Admin Details:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name: ${admin.name}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Created: ${admin.createdAt}`);
    console.log(`  Last Login: ${admin.lastLoginAt || 'Never'}`);

  } catch (error) {
    console.error('Error checking platform admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlatformAdmin(); 