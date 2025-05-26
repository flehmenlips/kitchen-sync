#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load production environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});

async function checkReservationSchema() {
  console.log('🔍 Checking Reservation Schema');
  console.log('==============================\n');
  
  try {
    // Check if reservations table has customer_id column
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reservations'
      AND column_name IN ('customer_id', 'user_id', 'restaurant_id')
      ORDER BY column_name
    `;
    
    console.log('Reservation columns:');
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check foreign key constraints
    console.log('\nForeign key constraints:');
    const constraints = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'reservations'
      AND kcu.column_name = 'customer_id';
    `;
    
    if (constraints.length === 0) {
      console.log('  ❌ No foreign key constraint found for customer_id');
    } else {
      constraints.forEach(c => {
        console.log(`  ✅ ${c.column_name} -> ${c.foreign_table_name}.${c.foreign_column_name}`);
      });
    }
    
    // Test creating a reservation
    console.log('\nTesting reservation creation...');
    try {
      const testReservation = await prisma.reservation.create({
        data: {
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          customerPhone: '555-0123',
          customerId: 1, // Using Amora's ID
          restaurantId: 1,
          partySize: 2,
          reservationDate: new Date('2025-06-01'),
          reservationTime: '18:00',
          status: 'CONFIRMED',
          userId: 1 // This might be the issue - using staff user ID
        }
      });
      
      console.log(`  ✅ Test reservation created with ID: ${testReservation.id}`);
      
      // Clean up
      await prisma.reservation.delete({
        where: { id: testReservation.id }
      });
      console.log('  ✅ Test reservation cleaned up');
      
    } catch (error) {
      console.log(`  ❌ Failed to create reservation: ${error.message}`);
      if (error.meta) {
        console.log('     Meta:', JSON.stringify(error.meta, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 KitchenSync Reservation Schema Check');
  console.log('======================================');
  console.log(`Database: ${process.env.DATABASE_URL?.substring(0, 40)}...\n`);
  
  await checkReservationSchema();
}

main().catch(console.error); 