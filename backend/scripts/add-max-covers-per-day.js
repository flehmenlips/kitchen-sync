/**
 * Script to add max_covers_per_day column if it doesn't exist
 * Run with: node backend/scripts/add-max-covers-per-day.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumn() {
  try {
    console.log('🔍 Checking if max_covers_per_day column exists...\n');
    
    // Try to query the column directly using raw SQL
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'reservation_settings' 
        AND column_name = 'max_covers_per_day'
    `;

    if (result.length > 0) {
      console.log('✅ Column max_covers_per_day already exists!\n');
    } else {
      console.log('⚠️  Column does not exist. Adding it now...\n');
      
      await prisma.$executeRaw`
        ALTER TABLE reservation_settings 
        ADD COLUMN max_covers_per_day INTEGER
      `;
      
      console.log('✅ Column max_covers_per_day added successfully!\n');
    }

    // Verify it was added
    const verify = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'reservation_settings' 
        AND column_name = 'max_covers_per_day'
    `;

    if (verify.length > 0) {
      console.log('✅ Verification successful:');
      console.log(`   Column: ${verify[0].column_name}`);
      console.log(`   Type: ${verify[0].data_type}`);
      console.log(`   Nullable: ${verify[0].is_nullable}\n`);
      
      // Test reading from the column
      const testSettings = await prisma.reservationSettings.findFirst({
        select: {
          id: true,
          restaurantId: true,
          maxCoversPerDay: true
        }
      });
      
      if (testSettings) {
        console.log('✅ Prisma can read the column:');
        console.log(`   Restaurant ID: ${testSettings.restaurantId}`);
        console.log(`   Max Covers Per Day: ${testSettings.maxCoversPerDay ?? 'Not set'}\n`);
      }
    }

    console.log('✅ All checks passed! The maxCoversPerDay feature is ready to use.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2022') {
      console.error('\n   The column does not exist. Please run this SQL in pgAdmin:');
      console.error('   ALTER TABLE reservation_settings ADD COLUMN max_covers_per_day INTEGER;\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

addColumn();

