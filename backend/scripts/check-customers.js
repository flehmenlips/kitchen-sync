const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCustomers() {
  try {
    const count = await prisma.customer.count();
    console.log('Total customers:', count);
    
    const customers = await prisma.customer.findMany({ 
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\nCustomers in database:');
    customers.forEach(customer => {
      console.log(`- ${customer.email} (ID: ${customer.id}, Name: ${customer.firstName} ${customer.lastName}, Verified: ${customer.emailVerified})`);
    });
    
    // Check restaurant association
    const restaurantId = 1; // Default restaurant
    console.log(`\nChecking customers for restaurant ${restaurantId}...`);
    
    // Check if there are any users that should be customers
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    console.log(`\nTotal staff users: ${users.length}`);
    users.forEach(user => {
      console.log(`- ${user.email} (Role: ${user.role})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomers(); 