const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testCustomerMigration() {
  try {
    console.log('\n🔍 CUSTOMER MIGRATION TEST');
    console.log('=' .repeat(60));
    
    // 1. Check current state
    console.log('\n1. CURRENT STATE:');
    const totalUsers = await prisma.user.count();
    const customerUsers = await prisma.user.count({ where: { isCustomer: true } });
    const staffUsers = await prisma.user.count({ where: { isCustomer: false } });
    
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Customer users: ${customerUsers}`);
    console.log(`   Staff users: ${staffUsers}`);
    
    // 2. List customer users that will be migrated
    console.log('\n2. CUSTOMERS TO BE MIGRATED:');
    const customersToMigrate = await prisma.user.findMany({
      where: { isCustomer: true },
      include: { 
        customerProfile: true,
        customerReservations: true
      }
    });
    
    for (const customer of customersToMigrate) {
      console.log(`\n   Customer: ${customer.email}`);
      console.log(`   - Name: ${customer.name || 'Not set'}`);
      console.log(`   - Phone: ${customer.phone || 'Not set'}`);
      console.log(`   - Email Verified: ${customer.customerProfile?.emailVerified || false}`);
      console.log(`   - Reservations: ${customer.customerReservations.length}`);
    }
    
    // 3. Check for potential issues
    console.log('\n3. POTENTIAL ISSUES:');
    
    // Check for duplicate emails between staff and customers
    const allEmails = await prisma.user.findMany({
      select: { email: true, isCustomer: true }
    });
    
    const emailCounts = {};
    allEmails.forEach(u => {
      emailCounts[u.email] = (emailCounts[u.email] || 0) + 1;
    });
    
    const duplicates = Object.entries(emailCounts).filter(([email, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('   ⚠️  Duplicate emails found:');
      duplicates.forEach(([email, count]) => {
        console.log(`      - ${email} (${count} occurrences)`);
      });
    } else {
      console.log('   ✅ No duplicate emails found');
    }
    
    // Check for reservations that will need updating
    const reservationsToUpdate = await prisma.reservation.count({
      where: {
        customer: {
          isCustomer: true
        }
      }
    });
    console.log(`   - Reservations to update: ${reservationsToUpdate}`);
    
    // 4. Migration simulation
    console.log('\n4. MIGRATION SIMULATION:');
    console.log('   The following will happen during migration:');
    console.log(`   - ${customerUsers} customers will be moved to new customers table`);
    console.log(`   - ${reservationsToUpdate} reservations will be updated with new customer IDs`);
    console.log(`   - Customer profiles will be migrated to customer_preferences table`);
    console.log(`   - ${staffUsers} staff users will remain in users table`);
    
    // 5. Data that will be preserved
    console.log('\n5. DATA PRESERVATION:');
    console.log('   The following data will be preserved:');
    console.log('   - All customer emails and passwords');
    console.log('   - All reservation history');
    console.log('   - All customer preferences and notes');
    console.log('   - All order history');
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Migration test complete. Review the above before proceeding.');
    
  } catch (error) {
    console.error('❌ Error during migration test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCustomerMigration(); 