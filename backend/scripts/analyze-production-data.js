#!/usr/bin/env node
require('dotenv').config({ path: '.env' }); // Use production env
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeProductionData() {
  console.log('📊 Analyzing Production Database...\n');
  console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set');
  console.log('='.repeat(50) + '\n');

  try {
    // 1. Users Analysis
    console.log('👥 USERS ANALYSIS');
    const users = await prisma.user.findMany({
      include: {
        restaurantStaff: {
          include: {
            restaurant: true
          }
        }
      }
    });
    
    console.log(`Total users: ${users.length}`);
    
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Users by role:');
    Object.entries(usersByRole).forEach(([role, count]) => {
      console.log(`  - ${role}: ${count}`);
    });
    
    console.log('\nPotential restaurant owners (SUPERADMIN users):');
    users.filter(u => u.role === 'SUPERADMIN').forEach(user => {
      const restaurants = user.restaurantStaff.map(rs => rs.restaurant.name).join(', ');
      console.log(`  - ${user.name} (${user.email}) - Restaurants: ${restaurants || 'None'}`);
    });

    // 2. Restaurants Analysis
    console.log('\n🏪 RESTAURANTS ANALYSIS');
    const restaurants = await prisma.restaurant.findMany({
      include: {
        restaurantStaff: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            menus: true,
            recipes: true,
            reservations: true,
            customers: true
          }
        }
      }
    });
    
    console.log(`Total restaurants: ${restaurants.length}`);
    console.log(`Active restaurants: ${restaurants.filter(r => r.isActive).length}`);
    
    console.log('\nRestaurant details:');
    restaurants.forEach(restaurant => {
      console.log(`\n  ${restaurant.name} (ID: ${restaurant.id})`);
      console.log(`    - Active: ${restaurant.isActive}`);
      console.log(`    - Staff: ${restaurant.restaurantStaff.length}`);
      console.log(`    - Menus: ${restaurant._count.menus}`);
      console.log(`    - Recipes: ${restaurant._count.recipes}`);
      console.log(`    - Reservations: ${restaurant._count.reservations}`);
      console.log(`    - Customers: ${restaurant._count.customers}`);
      
      const owner = restaurant.restaurantStaff.find(rs => rs.user.role === 'SUPERADMIN');
      if (owner) {
        console.log(`    - Owner: ${owner.user.name} (${owner.user.email})`);
      } else {
        console.log(`    - Owner: ⚠️  No SUPERADMIN found`);
      }
    });

    // 3. Customers Analysis
    console.log('\n👤 CUSTOMERS ANALYSIS');
    const customers = await prisma.customer.findMany({
      include: {
        restaurant: true,
        _count: {
          select: {
            reservations: true
          }
        }
      }
    });
    
    console.log(`Total customers: ${customers.length}`);
    
    const customersByRestaurant = customers.reduce((acc, customer) => {
      const restaurantName = customer.restaurant.name;
      acc[restaurantName] = (acc[restaurantName] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nCustomers by restaurant:');
    Object.entries(customersByRestaurant).forEach(([restaurant, count]) => {
      console.log(`  - ${restaurant}: ${count}`);
    });
    
    const customersWithEmail = customers.filter(c => c.email);
    console.log(`\nCustomers with email: ${customersWithEmail.length}`);
    console.log(`Customers without email: ${customers.length - customersWithEmail.length}`);
    
    // Check for duplicate emails
    const emailCounts = {};
    customersWithEmail.forEach(c => {
      emailCounts[c.email] = (emailCounts[c.email] || 0) + 1;
    });
    
    const duplicateEmails = Object.entries(emailCounts).filter(([_, count]) => count > 1);
    if (duplicateEmails.length > 0) {
      console.log('\n⚠️  Duplicate customer emails found:');
      duplicateEmails.forEach(([email, count]) => {
        console.log(`  - ${email}: ${count} occurrences`);
      });
    }

    // 4. Data Volume Summary
    console.log('\n📈 DATA VOLUME SUMMARY');
    const counts = await Promise.all([
      prisma.recipe.count(),
      prisma.ingredient.count(),
      prisma.menu.count(),
      prisma.reservation.count(),
      prisma.prepTask.count(),
      prisma.issue.count()
    ]);
    
    console.log(`  - Recipes: ${counts[0]}`);
    console.log(`  - Ingredients: ${counts[1]}`);
    console.log(`  - Menus: ${counts[2]}`);
    console.log(`  - Reservations: ${counts[3]}`);
    console.log(`  - Prep Tasks: ${counts[4]}`);
    console.log(`  - Issues: ${counts[5]}`);

    // 5. Migration Readiness Check
    console.log('\n✅ MIGRATION READINESS CHECK');
    
    const issues = [];
    
    // Check for restaurants without owners
    const restaurantsWithoutOwner = restaurants.filter(r => {
      return !r.restaurantStaff.some(rs => rs.user.role === 'SUPERADMIN');
    });
    
    if (restaurantsWithoutOwner.length > 0) {
      issues.push(`${restaurantsWithoutOwner.length} restaurants without SUPERADMIN owner`);
    }
    
    // Check for active restaurants
    if (restaurants.filter(r => r.isActive).length === 0) {
      issues.push('No active restaurants found');
    }
    
    // Check if george@seabreeze.farm exists
    const georgeUser = users.find(u => u.email === 'george@seabreeze.farm');
    if (!georgeUser) {
      issues.push('Platform admin user (george@seabreeze.farm) not found');
    }
    
    if (issues.length === 0) {
      console.log('✅ All checks passed - ready for migration!');
    } else {
      console.log('⚠️  Issues found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }

  } catch (error) {
    console.error('❌ Error analyzing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run analysis
analyzeProductionData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 