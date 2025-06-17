const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('=== USERS TABLE ===');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, name: true }
    });
    console.log('Users:', users);
    
    console.log('\n=== CUSTOMERS TABLE ===');
    const customers = await prisma.customer.findMany({
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    console.log('Customers:', customers);
    
    console.log('\n=== RESTAURANT STAFF ===');
    const staff = await prisma.restaurantStaff.findMany({
      include: { user: { select: { email: true } }, restaurant: { select: { name: true } } }
    });
    console.log('Restaurant Staff:', staff);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 