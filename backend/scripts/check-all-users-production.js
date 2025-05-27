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

async function checkAllUsers() {
  console.log('🔍 Checking All Users in Production');
  console.log('==================================\n');
  
  try {
    // Get all users
    const users = await prisma.$queryRaw`
      SELECT id, email, name, role 
      FROM users 
      ORDER BY id
    `;
    
    console.log(`Found ${users.length} users:\n`);
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.name || 'No name'} (${user.email})`);
      console.log(`   ID: ${user.id}, Role: ${user.role}`);
      
      // Check restaurant assignments
      const assignments = await prisma.$queryRaw`
        SELECT rs.*, r.name as restaurant_name, r.id as restaurant_id
        FROM restaurant_staff rs
        JOIN restaurants r ON rs.restaurant_id = r.id
        WHERE rs.user_id = ${user.id}
      `;
      
      if (assignments.length > 0) {
        console.log(`   Restaurant Assignments:`);
        assignments.forEach(a => {
          console.log(`   - ${a.restaurant_name} (ID: ${a.restaurant_id}, Role: ${a.role}, Active: ${a.is_active})`);
        });
      } else {
        console.log(`   ❌ No restaurant assignments`);
      }
      
      // Check data counts
      const dataCounts = await prisma.$queryRaw`
        SELECT 
          (SELECT COUNT(*) FROM recipes WHERE user_id = ${user.id}) as recipes,
          (SELECT COUNT(*) FROM menus WHERE user_id = ${user.id}) as menus,
          (SELECT COUNT(*) FROM ingredients WHERE user_id = ${user.id}) as ingredients,
          (SELECT COUNT(*) FROM categories WHERE user_id = ${user.id}) as categories,
          (SELECT COUNT(*) FROM prep_columns WHERE user_id = ${user.id}) as prep_columns
      `;
      
      const counts = dataCounts[0];
      const totalData = parseInt(counts.recipes) + parseInt(counts.menus) + 
                       parseInt(counts.ingredients) + parseInt(counts.categories) + 
                       parseInt(counts.prep_columns);
      
      if (totalData > 0) {
        console.log(`   Data Summary:`);
        console.log(`   - Recipes: ${counts.recipes}`);
        console.log(`   - Menus: ${counts.menus}`);
        console.log(`   - Ingredients: ${counts.ingredients}`);
        console.log(`   - Categories: ${counts.categories}`);
        console.log(`   - Prep Columns: ${counts.prep_columns}`);
        
        // Check what restaurant their data is assigned to
        if (parseInt(counts.recipes) > 0) {
          const recipeRestaurants = await prisma.$queryRaw`
            SELECT DISTINCT r.restaurant_id, rest.name 
            FROM recipes r
            LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
            WHERE r.user_id = ${user.id}
          `;
          
          console.log(`   Recipe Restaurants:`);
          recipeRestaurants.forEach(rr => {
            console.log(`   - Restaurant ${rr.name || 'Unknown'} (ID: ${rr.restaurant_id})`);
          });
        }
      } else {
        console.log(`   📊 No data found for this user`);
      }
    }
    
    // Summary of restaurants
    console.log('\n\n📊 Restaurant Summary:');
    const restaurants = await prisma.$queryRaw`
      SELECT id, name, is_active,
        (SELECT COUNT(*) FROM restaurant_staff WHERE restaurant_id = r.id) as staff_count
      FROM restaurants r
      ORDER BY id
    `;
    
    restaurants.forEach(r => {
      console.log(`\n🏪 ${r.name} (ID: ${r.id})`);
      console.log(`   Active: ${r.is_active}`);
      console.log(`   Staff Count: ${r.staff_count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers(); 