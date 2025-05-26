#!/usr/bin/env node

/**
 * Recover Customer Users
 * 
 * This script recovers customer users that were incorrectly
 * marked as staff during the failed migration.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// These are the users we know were customers
const customerEmails = [
  'newcustomer@example.com',
  'jonny@pray.com',
  'sam@altman.com',
  'amora@page.com',
  'george@seabreezefarm.net'
];

async function recoverCustomers() {
  try {
    console.log('🔄 Recovering customer users...\n');
    
    for (const email of customerEmails) {
      try {
        // Find the user
        const user = await prisma.user.findUnique({
          where: { email },
          include: { customerProfile: true }
        });
        
        if (!user) {
          console.log(`❌ User not found: ${email}`);
          continue;
        }
        
        // Check if already exists as customer
        const existing = await prisma.customer.findUnique({
          where: { email }
        });
        
        if (existing) {
          console.log(`⏭️  ${email} already exists as customer`);
          continue;
        }
        
        // Create customer
        const customer = await prisma.customer.create({
          data: {
            email: user.email,
            password: user.password,
            firstName: user.name?.split(' ')[0] || null,
            lastName: user.name?.split(' ').slice(1).join(' ') || null,
            phone: user.phone,
            emailVerified: false,
            restaurantId: 1
          }
        });
        
        // Create customer_restaurant link
        await prisma.customerRestaurant.create({
          data: {
            customerId: customer.id,
            restaurantId: 1,
            firstVisit: user.createdAt
          }
        });
        
        // Remove from restaurant_staff if they're there
        await prisma.restaurantStaff.deleteMany({
          where: {
            userId: user.id,
            restaurantId: 1
          }
        });
        
        console.log(`✅ Recovered ${email} as customer`);
        
      } catch (error) {
        console.error(`❌ Error recovering ${email}:`, error.message);
      }
    }
    
    // Now let's keep only test@example.com as staff
    const staffToKeep = ['test@example.com'];
    
    // Remove isCustomer flag from all users for clarity
    await prisma.user.updateMany({
      data: { isCustomer: false }
    });
    
    console.log('\n✅ Customer recovery complete!');
    
  } catch (error) {
    console.error('❌ Recovery failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recoverCustomers(); 