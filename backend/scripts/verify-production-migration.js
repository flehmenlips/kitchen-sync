#!/usr/bin/env node
require('dotenv').config({ path: '.env' }); // Use production env
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verifying Production Migration...\n');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    // 1. Check Platform Admin exists
    console.log('1️⃣  Checking platform admin...');
    const platformAdmin = await prisma.platformAdmin.findFirst({
      where: { email: 'george@seabreeze.farm' }
    });
    
    if (platformAdmin) {
      results.passed.push('✅ Platform admin exists');
      console.log(`   Found: ${platformAdmin.name} (${platformAdmin.role})`);
    } else {
      results.failed.push('❌ Platform admin not found');
    }

    // 2. Check all restaurants have platform fields
    console.log('\n2️⃣  Checking restaurant platform fields...');
    const restaurants = await prisma.restaurant.findMany();
    const restaurantsWithoutOwner = restaurants.filter(r => !r.ownerEmail);
    
    if (restaurantsWithoutOwner.length === 0) {
      results.passed.push('✅ All restaurants have owner information');
    } else {
      results.failed.push(`❌ ${restaurantsWithoutOwner.length} restaurants missing owner information`);
      restaurantsWithoutOwner.forEach(r => {
        console.log(`   - ${r.name} (ID: ${r.id})`);
      });
    }

    // 3. Check subscriptions
    console.log('\n3️⃣  Checking subscriptions...');
    const activeRestaurants = await prisma.restaurant.findMany({
      where: { isActive: true }
    });
    
    const subscriptions = await prisma.subscription.findMany();
    const restaurantIds = new Set(subscriptions.map(s => s.restaurantId));
    const restaurantsWithoutSub = activeRestaurants.filter(r => !restaurantIds.has(r.id));
    
    if (restaurantsWithoutSub.length === 0) {
      results.passed.push('✅ All active restaurants have subscriptions');
      console.log(`   Total subscriptions: ${subscriptions.length}`);
    } else {
      results.failed.push(`❌ ${restaurantsWithoutSub.length} active restaurants without subscriptions`);
      restaurantsWithoutSub.forEach(r => {
        console.log(`   - ${r.name} (ID: ${r.id})`);
      });
    }

    // 4. Check customer to diner migration
    console.log('\n4️⃣  Checking customer migration...');
    const customers = await prisma.customer.count();
    const diners = await prisma.diner.count();
    const dinerProfiles = await prisma.dinerRestaurantProfile.count();
    
    console.log(`   Customers: ${customers}`);
    console.log(`   Diners: ${diners}`);
    console.log(`   Diner profiles: ${dinerProfiles}`);
    
    if (diners > 0) {
      results.passed.push(`✅ ${diners} diners created`);
    } else if (customers === 0) {
      results.warnings.push('⚠️  No customers to migrate');
    } else {
      results.failed.push('❌ Customer to diner migration may have failed');
    }

    // 5. Check data integrity
    console.log('\n5️⃣  Checking data integrity...');
    
    // Check for orphaned records
    const orphanedStaff = await prisma.restaurantStaff.findMany({
      where: {
        OR: [
          { user: { is: null } },
          { restaurant: { is: null } }
        ]
      }
    });
    
    if (orphanedStaff.length === 0) {
      results.passed.push('✅ No orphaned staff records');
    } else {
      results.warnings.push(`⚠️  ${orphanedStaff.length} orphaned staff records found`);
    }

    // 6. Check reservation integrity
    console.log('\n6️⃣  Checking reservations...');
    const reservations = await prisma.reservation.count();
    const reservationsWithDiner = await prisma.reservation.count({
      where: { dinerId: { not: null } }
    });
    
    console.log(`   Total reservations: ${reservations}`);
    console.log(`   Reservations with diner: ${reservationsWithDiner}`);
    
    if (reservations > 0) {
      results.passed.push(`✅ ${reservations} reservations preserved`);
    }

    // 7. Performance check - ensure indexes exist
    console.log('\n7️⃣  Checking performance optimizations...');
    // This would need raw SQL to check indexes
    results.warnings.push('⚠️  Manual index verification needed');

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION VERIFICATION SUMMARY\n');
    
    console.log(`✅ Passed: ${results.passed.length}`);
    results.passed.forEach(msg => console.log(`   ${msg}`));
    
    if (results.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
      results.warnings.forEach(msg => console.log(`   ${msg}`));
    }
    
    if (results.failed.length > 0) {
      console.log(`\n❌ Failed: ${results.failed.length}`);
      results.failed.forEach(msg => console.log(`   ${msg}`));
      console.log('\n🚨 MIGRATION VERIFICATION FAILED - INVESTIGATE ISSUES');
      process.exit(1);
    } else {
      console.log('\n✨ MIGRATION VERIFICATION PASSED!');
    }

  } catch (error) {
    console.error('\n❌ Verification script error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 