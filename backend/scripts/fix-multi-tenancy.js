#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMultiTenancy() {
  console.log('🔧 Fixing Multi-Tenancy Issues...\n');
  
  try {
    // 1. Change all SUPERADMIN users to ADMIN (except platform admins)
    console.log('1️⃣  Converting SUPERADMIN users to ADMIN...');
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPERADMIN' }
    });
    
    for (const user of superAdmins) {
      // Skip george@seabreeze.farm as they might be a platform admin
      if (user.email === 'george@seabreeze.farm') {
        console.log(`   - Skipping ${user.email} (platform admin)`);
        continue;
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
      console.log(`   ✅ Updated ${user.name} (${user.email}) from SUPERADMIN to ADMIN`);
    }
    
    // 2. Ensure each restaurant has unique settings
    console.log('\n2️⃣  Checking restaurant settings...');
    const restaurants = await prisma.restaurant.findMany({
      include: {
        settings: true
      }
    });
    
    for (const restaurant of restaurants) {
      if (!restaurant.settings) {
        console.log(`   - Creating settings for ${restaurant.name}...`);
        await prisma.restaurantSettings.create({
          data: {
            restaurantId: restaurant.id,
            websiteName: restaurant.name,
            tagline: `Welcome to ${restaurant.name}`,
            heroTitle: restaurant.name,
            heroSubtitle: `Experience our exceptional cuisine`,
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e',
            openingHours: {
              monday: { open: "11:00", close: "22:00" },
              tuesday: { open: "11:00", close: "22:00" },
              wednesday: { open: "11:00", close: "22:00" },
              thursday: { open: "11:00", close: "22:00" },
              friday: { open: "11:00", close: "23:00" },
              saturday: { open: "11:00", close: "23:00" },
              sunday: { open: "11:00", close: "21:00" }
            }
          }
        });
        console.log(`   ✅ Created settings for ${restaurant.name}`);
      }
    }
    
    // 3. Verify staff assignments are restaurant-specific
    console.log('\n3️⃣  Verifying staff assignments...');
    const staffAssignments = await prisma.restaurantStaff.findMany({
      include: {
        user: true,
        restaurant: true
      }
    });
    
    const userRestaurantMap = {};
    staffAssignments.forEach(assignment => {
      if (!userRestaurantMap[assignment.userId]) {
        userRestaurantMap[assignment.userId] = [];
      }
      userRestaurantMap[assignment.userId].push(assignment.restaurant.name);
    });
    
    console.log('   Staff assignments by user:');
    Object.entries(userRestaurantMap).forEach(([userId, restaurants]) => {
      const user = staffAssignments.find(a => a.userId === parseInt(userId))?.user;
      console.log(`   - ${user?.name} (${user?.email}): ${restaurants.join(', ')}`);
    });
    
    // 4. Check for data leakage
    console.log('\n4️⃣  Checking for potential data leakage...');
    
    // Check recipes without restaurant association
    const recipesWithoutRestaurant = await prisma.recipe.count({
      where: { restaurantId: null }
    });
    
    if (recipesWithoutRestaurant > 0) {
      console.log(`   ⚠️  Found ${recipesWithoutRestaurant} recipes without restaurant association`);
    }
    
    // Check menus without restaurant association
    const menusWithoutRestaurant = await prisma.menu.count({
      where: { restaurantId: null }
    });
    
    if (menusWithoutRestaurant > 0) {
      console.log(`   ⚠️  Found ${menusWithoutRestaurant} menus without restaurant association`);
    }
    
    console.log('\n✨ Multi-tenancy fixes completed!');
    
    // 5. Summary
    console.log('\n📊 Summary:');
    console.log(`   - Total restaurants: ${restaurants.length}`);
    console.log(`   - Total users: ${await prisma.user.count()}`);
    console.log(`   - Total staff assignments: ${staffAssignments.length}`);
    
    console.log('\n💡 Next steps:');
    console.log('   1. Test login with each restaurant account');
    console.log('   2. Verify each restaurant only sees their own data');
    console.log('   3. Clear browser cache/localStorage if seeing stale data');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMultiTenancy(); 