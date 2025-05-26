const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('\n--- STAFF USERS ---');
  const staffUsers = await prisma.user.findMany({
    where: { isCustomer: false },
    select: { id: true, email: true, name: true, role: true }
  });
  console.table(staffUsers);

  console.log('\n--- CUSTOMER USERS ---');
  const customerUsers = await prisma.user.findMany({
    where: { isCustomer: true },
    include: { customerProfile: true }
  });
  console.table(customerUsers.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    emailVerified: u.customerProfile?.emailVerified || false
  })));

  console.log('\n--- TOTAL COUNTS ---');
  console.log(`Staff users: ${staffUsers.length}`);
  console.log(`Customer users: ${customerUsers.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 