require('dotenv').config({ path: '.env' }); // Use production env
const { PrismaClient } = require('@prisma/client');

async function checkProductionCustomers() {
  console.log('Checking PRODUCTION database...');
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 30) + '...');
  
  const prisma = new PrismaClient();
  
  try {
    // Get customer count
    const customerCount = await prisma.customer.count();
    console.log('\nTotal customers in PRODUCTION:', customerCount);
    
    // Get some basic stats without exposing personal data
    const verifiedCount = await prisma.customer.count({
      where: { emailVerified: true }
    });
    
    const unverifiedCount = await prisma.customer.count({
      where: { emailVerified: false }
    });
    
    console.log('- Verified customers:', verifiedCount);
    console.log('- Unverified customers:', unverifiedCount);
    
    // Check recent customers (just count, no personal data)
    const recentCustomers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });
    
    console.log('- Customers created in last 7 days:', recentCustomers);
    
    // Check if customers have the restaurant association
    const customersWithReservations = await prisma.customer.findMany({
      select: {
        id: true,
        _count: {
          select: {
            sessions: true
          }
        }
      },
      take: 5
    });
    
    console.log('\nCustomer activity (first 5):');
    customersWithReservations.forEach(c => {
      console.log(`- Customer ID ${c.id}: ${c._count.sessions} sessions`);
    });
    
    // Check current user (staff)
    const staffCount = await prisma.user.count();
    const adminCount = await prisma.user.count({
      where: { role: { in: ['ADMIN', 'SUPERADMIN'] } }
    });
    
    console.log('\nStaff users in PRODUCTION:', staffCount);
    console.log('- Admin/SuperAdmin users:', adminCount);
    
  } catch (error) {
    console.error('Error checking production database:', error.message);
    console.error('Make sure you have the correct DATABASE_URL in .env file');
  } finally {
    await prisma.$disconnect();
  }
}

// Safety check
if (process.argv.includes('--confirm-production')) {
  checkProductionCustomers();
} else {
  console.log('This script checks the PRODUCTION database.');
  console.log('Run with --confirm-production flag to proceed.');
  console.log('Example: node scripts/check-production-customers.js --confirm-production');
} 