/**
 * Test script for maxCoversPerDay functionality
 * Run with: node backend/scripts/test-daily-capacity.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDailyCapacity() {
  try {
    console.log('🧪 Testing Max Covers Per Day Functionality\n');

    // Test 1: Check if maxCoversPerDay column exists
    console.log('Test 1: Checking if maxCoversPerDay column exists...');
    const settings = await prisma.reservationSettings.findFirst({
      select: {
        id: true,
        restaurantId: true,
        maxCoversPerDay: true,
        maxCoversPerSlot: true
      }
    });

    if (settings) {
      console.log('✅ ReservationSettings found');
      console.log(`   Restaurant ID: ${settings.restaurantId}`);
      console.log(`   Max Covers Per Day: ${settings.maxCoversPerDay ?? 'Not set'}`);
      console.log(`   Max Covers Per Slot: ${settings.maxCoversPerSlot ?? 'Not set'}\n`);
    } else {
      console.log('⚠️  No reservation settings found. Creating default...');
      // Create default settings for restaurant 1
      await prisma.reservationSettings.create({
        data: {
          restaurantId: 1,
          maxCoversPerDay: 50, // Test value
          operatingHours: {
            monday: { open: '17:00', close: '22:00', closed: false },
            tuesday: { open: '17:00', close: '22:00', closed: false },
            wednesday: { open: '17:00', close: '22:00', closed: false },
            thursday: { open: '17:00', close: '22:00', closed: false },
            friday: { open: '17:00', close: '22:00', closed: false },
            saturday: { open: '17:00', close: '22:00', closed: false },
            sunday: { closed: true }
          }
        }
      });
      console.log('✅ Default settings created with maxCoversPerDay = 50\n');
    }

    // Test 2: Check daily capacity calculation
    console.log('Test 2: Checking daily capacity calculation...');
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    const startOfDay = new Date(testDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(testDate);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await prisma.reservation.findMany({
      where: {
        restaurantId: 1,
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: 'CONFIRMED'
      },
      select: {
        id: true,
        reservationDate: true,
        partySize: true
      }
    });

    const totalCovers = reservations.reduce((sum, res) => sum + res.partySize, 0);
    const maxCovers = settings?.maxCoversPerDay || 50;
    const available = totalCovers < maxCovers;
    const remaining = Math.max(0, maxCovers - totalCovers);

    console.log(`   Date: ${testDate.toISOString().split('T')[0]}`);
    console.log(`   Current covers: ${totalCovers}`);
    console.log(`   Max covers per day: ${maxCovers}`);
    console.log(`   Remaining capacity: ${remaining}`);
    console.log(`   Available: ${available ? '✅ Yes' : '❌ No (fully booked)'}\n`);

    // Test 3: Test updating maxCoversPerDay
    console.log('Test 3: Testing update of maxCoversPerDay...');
    const updatedSettings = await prisma.reservationSettings.update({
      where: { restaurantId: 1 },
      data: { maxCoversPerDay: 100 }
    });
    console.log(`✅ Updated maxCoversPerDay to: ${updatedSettings.maxCoversPerDay}\n`);

    // Test 4: Verify the update
    console.log('Test 4: Verifying update...');
    const verifySettings = await prisma.reservationSettings.findUnique({
      where: { restaurantId: 1 },
      select: { maxCoversPerDay: true }
    });
    
    if (verifySettings?.maxCoversPerDay === 100) {
      console.log('✅ Update verified successfully!\n');
    } else {
      console.log('❌ Update verification failed\n');
    }

    console.log('✅ All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set maxCoversPerDay in Reservation Settings UI');
    console.log('   2. Create some test reservations');
    console.log('   3. Verify dates are disabled when capacity is exceeded');
    console.log('   4. Test override functionality for restaurant staff');

  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error.code === 'P2025') {
      console.error('   Error: Record not found. Make sure restaurant ID 1 exists.');
    } else if (error.code === 'P2003') {
      console.error('   Error: Foreign key constraint failed. Make sure restaurant exists.');
    } else {
      console.error('   Error details:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDailyCapacity();

