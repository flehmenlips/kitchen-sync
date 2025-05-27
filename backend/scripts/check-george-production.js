#!/usr/bin/env node

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

if (!databaseUrl || databaseUrl.includes('localhost')) {
  console.error('❌ Not using production database!');
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient();

async function checkGeorge() {
  console.log('🔍 Checking George\'s Production Status');
  console.log('=====================================\n');
  
  try {
    // Get George's info
    const george = await prisma.$queryRaw`
      SELECT id, email, name 
      FROM users 
      WHERE email = 'george@seabreeze.farm'
    `;
    
    if (!george || george.length === 0) {
      console.log('❌ George not found!');
      return;
    }
    
    console.log('✅ Found George:', george[0]);
    
    // Get his restaurant assignments
    const assignments = await prisma.$queryRaw`
      SELECT rs.*, r.name as restaurant_name 
      FROM restaurant_staff rs
      JOIN restaurants r ON rs.restaurant_id = r.id
      WHERE rs.user_id = ${george[0].id}
    `;
    
    console.log('\n📊 Restaurant Assignments:');
    assignments.forEach(a => {
      console.log(`   - ${a.restaurant_name} (ID: ${a.restaurant_id})`);
      console.log(`     Role: ${a.role}, Active: ${a.is_active}`);
    });
    
    // Check if activeRestaurantId column exists
    console.log('\n🔍 Checking if active_restaurant_id column exists...');
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'active_restaurant_id'
    `;
    
    if (columns.length === 0) {
      console.log('❌ Column active_restaurant_id does not exist in users table!');
      console.log('   The frontend won\'t be able to determine which restaurant to use.');
    } else {
      console.log('✅ Column exists');
    }
    
    // Check George's data
    console.log('\n📊 George\'s Data Summary:');
    const dataCounts = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM recipes WHERE user_id = ${george[0].id}) as recipes,
        (SELECT COUNT(*) FROM menus WHERE user_id = ${george[0].id}) as menus,
        (SELECT COUNT(*) FROM ingredients WHERE user_id = ${george[0].id}) as ingredients
    `;
    console.log('   Total recipes:', dataCounts[0].recipes);
    console.log('   Total menus:', dataCounts[0].menus);
    console.log('   Total ingredients:', dataCounts[0].ingredients);
    
    // Check what restaurant his data is assigned to
    const recipeRestaurants = await prisma.$queryRaw`
      SELECT DISTINCT restaurant_id, COUNT(*) as count 
      FROM recipes 
      WHERE user_id = ${george[0].id} 
      GROUP BY restaurant_id
    `;
    
    console.log('\n📍 Recipe Restaurant Distribution:');
    recipeRestaurants.forEach(r => {
      console.log(`   Restaurant ${r.restaurant_id}: ${r.count} recipes`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGeorge(); 