#!/usr/bin/env node

/**
 * Fix George's Active Restaurant
 * Ensures George has the correct active restaurant set
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Use production database from .env
const envContent = fs.readFileSync('./.env', 'utf8');
const databaseUrl = envContent
  .split('\n')
  .find(line => line.startsWith('DATABASE_URL'))
  ?.split('=')[1]
  ?.replace(/"/g, '')
  ?.trim();

if (!databaseUrl) {
  console.error('❌ Could not find DATABASE_URL in backend/.env');
  process.exit(1);
}

// Allow both local and production
process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient();

async function fixGeorgeActiveRestaurant() {
  console.log('🔧 Fixing George\'s Active Restaurant');
  console.log('===================================\n');
  
  try {
    // 1. Find George
    const george = await prisma.user.findUnique({
      where: { email: 'george@seabreeze.farm' },
      include: {
        restaurantStaff: {
          include: {
            restaurant: true
          }
        }
      }
    });
    
    if (!george) {
      console.log('❌ George not found!');
      return;
    }
    
    console.log(`✅ Found George (ID: ${george.id})`);
    console.log(`   Active Restaurant ID: ${george.activeRestaurantId || 'NOT SET'}`);
    console.log(`   Restaurant Assignments: ${george.restaurantStaff.length}`);
    
    // 2. List his restaurant assignments
    if (george.restaurantStaff.length > 0) {
      console.log('\n📊 Restaurant Assignments:');
      george.restaurantStaff.forEach(staff => {
        console.log(`   - ${staff.restaurant.name} (ID: ${staff.restaurant.id})`);
        console.log(`     Role: ${staff.role}`);
        console.log(`     Active: ${staff.isActive}`);
      });
      
      // 3. Find Coq au Vin
      const coqAuVin = george.restaurantStaff.find(staff => 
        staff.restaurant.name === 'Coq au Vin' && staff.isActive
      );
      
      if (coqAuVin) {
        console.log(`\n✅ Found active assignment to Coq au Vin (ID: ${coqAuVin.restaurant.id})`);
        
        // 4. Update activeRestaurantId if needed
        if (george.activeRestaurantId !== coqAuVin.restaurant.id) {
          console.log('\n🔄 Updating activeRestaurantId...');
          await prisma.user.update({
            where: { id: george.id },
            data: { activeRestaurantId: coqAuVin.restaurant.id }
          });
          console.log('✅ Updated activeRestaurantId to:', coqAuVin.restaurant.id);
        } else {
          console.log('✅ activeRestaurantId is already correct');
        }
      } else {
        console.log('\n❌ No active assignment to Coq au Vin found!');
      }
    } else {
      console.log('\n❌ George has no restaurant assignments!');
    }
    
    // 5. Final verification
    const updatedGeorge = await prisma.user.findUnique({
      where: { id: george.id },
      select: {
        id: true,
        email: true,
        activeRestaurantId: true
      }
    });
    
    console.log('\n📋 Final Status:');
    console.log(`   User ID: ${updatedGeorge.id}`);
    console.log(`   Email: ${updatedGeorge.email}`);
    console.log(`   Active Restaurant ID: ${updatedGeorge.activeRestaurantId || 'NOT SET'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixGeorgeActiveRestaurant(); 