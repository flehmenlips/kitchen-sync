require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSubscriptions() {
  try {
    const subscriptions = await prisma.$queryRaw`SELECT * FROM subscriptions`;
    console.log('Existing subscriptions:', subscriptions);
    console.log('Total count:', subscriptions.length);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptions(); 