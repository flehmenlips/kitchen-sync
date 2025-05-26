#!/usr/bin/env node

/**
 * Check Multi-Tenant Status
 * 
 * This script checks the current state of the database
 * to see how ready it is for multi-tenant operation.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStatus() {
  console.log('🔍 KitchenSync Multi-Tenant Status Check');
  console.log('========================================\n');
  
  try {
    // Check restaurants
    const restaurants = await prisma.restaurant.findMany({
      include: {
        staff: true,
        _count: {
          select: {
            reservations: true,
            orders: true
          }
        }
      }
    });
    
    console.log(`📍 Restaurants: ${restaurants.length}`);
    restaurants.forEach(r => {
      console.log(`   - ${r.name} (ID: ${r.id})`);
      console.log(`     Staff: ${r.staff.length}, Reservations: ${r._count.reservations}, Orders: ${r._count.orders}`);
    });
    
    // Check users
    const users = await prisma.user.findMany({
      include: {
        restaurantStaff: true
      }
    });
    
    const staffUsers = users.filter(u => !u.isCustomer);
    const customerUsers = users.filter(u => u.isCustomer);
    
    console.log(`\n👥 Users: ${users.length} total`);
    console.log(`   - Staff: ${staffUsers.length}`);
    console.log(`   - Customers (in users table): ${customerUsers.length}`);
    
    // Check customers table
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: {
            sessions: true,
            restaurantLinks: true
          }
        }
      }
    });
    
    console.log(`\n🛍️  Customers (in customers table): ${customers.length}`);
    if (customers.length > 0) {
      console.log('   Sample customers:');
      customers.slice(0, 3).forEach(c => {
        console.log(`   - ${c.email} (Sessions: ${c._count.sessions}, Restaurant Links: ${c._count.restaurantLinks})`);
      });
    }
    
    // Check for customer_restaurants table
    try {
      const customerRestaurants = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM customer_restaurants;
      `;
      console.log(`\n🔗 Customer-Restaurant Links: ${customerRestaurants[0].count}`);
    } catch (error) {
      console.log('\n⚠️  customer_restaurants table does not exist yet');
    }
    
    // Check restaurant_staff
    const restaurantStaff = await prisma.restaurantStaff.findMany({
      include: {
        user: true,
        restaurant: true
      }
    });
    
    console.log(`\n👔 Restaurant Staff Assignments: ${restaurantStaff.length}`);
    if (restaurantStaff.length > 0) {
      restaurantStaff.forEach(rs => {
        console.log(`   - ${rs.user.email} → ${rs.restaurant.name} (${rs.role})`);
      });
    }
    
    // Check for tables missing restaurantId
    console.log('\n📊 Table Analysis:');
    
    const tables = [
      { name: 'recipes', hasRestaurantId: false },
      { name: 'ingredients', hasRestaurantId: false },
      { name: 'menus', hasRestaurantId: false },
      { name: 'categories', hasRestaurantId: false },
      { name: 'reservations', hasRestaurantId: true },
      { name: 'orders', hasRestaurantId: true }
    ];
    
    for (const table of tables) {
      try {
        const result = await prisma.$queryRaw`
          SELECT COUNT(*) as count,
                 COUNT(CASE WHEN restaurant_id IS NOT NULL THEN 1 END) as with_restaurant
          FROM ${table.name};
        `;
        
        const hasColumn = result[0].with_restaurant !== null;
        console.log(`   - ${table.name}: ${result[0].count} records` + 
                   (hasColumn ? ` (${result[0].with_restaurant} with restaurant_id)` : ' (no restaurant_id column)'));
      } catch (error) {
        console.log(`   - ${table.name}: Error checking - ${error.message}`);
      }
    }
    
    // Summary and recommendations
    console.log('\n📋 Summary:');
    
    const issues = [];
    
    if (customerUsers.length > 0) {
      issues.push(`- ${customerUsers.length} customers still in users table (need migration)`);
    }
    
    if (restaurants.length === 0) {
      issues.push('- No restaurants found (need at least one)');
    }
    
    if (restaurantStaff.length === 0 && staffUsers.length > 0) {
      issues.push('- No restaurant_staff assignments (staff not linked to restaurants)');
    }
    
    if (issues.length === 0) {
      console.log('✅ System appears ready for multi-tenant operation!');
    } else {
      console.log('⚠️  Issues to address:');
      issues.forEach(issue => console.log(issue));
      console.log('\n💡 Run `npm run db:migrate:multi-tenant` to fix these issues');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus(); 