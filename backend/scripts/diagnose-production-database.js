#!/usr/bin/env node

/**
 * Production Database Diagnosis Script
 * 
 * This script checks the production database to identify
 * why content blocks are not showing for restaurants.
 */

const { PrismaClient } = require('@prisma/client');

async function diagnoseProduction() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚨 PRODUCTION DATABASE DIAGNOSIS');
    console.log('=================================');
    console.log('');
    
    // 1. Check ContentBlock table
    console.log('📊 CONTENT BLOCKS ANALYSIS:');
    try {
      const contentBlocksCount = await prisma.contentBlock.count();
      console.log(`   Total ContentBlocks: ${contentBlocksCount}`);
      
      if (contentBlocksCount > 0) {
        const blocksByRestaurant = await prisma.contentBlock.groupBy({
          by: ['restaurantId'],
          _count: { id: true }
        });
        
        console.log('   Blocks by restaurant:');
        for (const group of blocksByRestaurant) {
          const restaurant = await prisma.restaurant.findUnique({
            where: { id: group.restaurantId },
            select: { name: true, slug: true }
          });
          console.log(`     Restaurant ${group.restaurantId} (${restaurant?.slug}): ${group._count.id} blocks`);
        }
      }
    } catch (error) {
      console.log(`   ❌ ContentBlock table error: ${error.message}`);
    }
    
    console.log('');
    
    // 2. Check specific restaurant (Coq au Vin)
    console.log('🍷 COQ AU VIN ANALYSIS:');
    try {
      const coqAuVin = await prisma.restaurant.findUnique({
        where: { slug: 'coq-au-vin' },
        select: { id: true, name: true, isActive: true }
      });
      
      if (coqAuVin) {
        console.log(`   ✅ Restaurant found: ${coqAuVin.name} (ID: ${coqAuVin.id})`);
        console.log(`   Active: ${coqAuVin.isActive}`);
        
        const contentBlocks = await prisma.contentBlock.findMany({
          where: { restaurantId: coqAuVin.id },
          select: { id: true, page: true, blockType: true, title: true, isActive: true }
        });
        
        console.log(`   ContentBlocks: ${contentBlocks.length}`);
        if (contentBlocks.length > 0) {
          contentBlocks.forEach(block => {
            console.log(`     - ${block.blockType} on ${block.page}: "${block.title}" (Active: ${block.isActive})`);
          });
        }
        
        // Check RestaurantSettings
        const settings = await prisma.restaurantSettings.findUnique({
          where: { restaurantId: coqAuVin.id },
          select: { 
            id: true, 
            heroTitle: true, 
            aboutTitle: true, 
            contactPhone: true,
            websiteName: true
          }
        });
        
        if (settings) {
          console.log(`   ✅ RestaurantSettings found (ID: ${settings.id})`);
          console.log(`     Hero Title: "${settings.heroTitle}"`);
          console.log(`     About Title: "${settings.aboutTitle}"`);
          console.log(`     Website Name: "${settings.websiteName}"`);
        } else {
          console.log(`   ❌ No RestaurantSettings found`);
        }
        
      } else {
        console.log(`   ❌ Coq au Vin restaurant not found with slug 'coq-au-vin'`);
      }
    } catch (error) {
      console.log(`   ❌ Coq au Vin analysis error: ${error.message}`);
    }
    
    console.log('');
    
    // 3. Check all restaurants
    console.log('🏪 ALL RESTAURANTS ANALYSIS:');
    try {
      const restaurants = await prisma.restaurant.findMany({
        select: { id: true, name: true, slug: true, isActive: true },
        orderBy: { name: 'asc' }
      });
      
      console.log(`   Total restaurants: ${restaurants.length}`);
      console.log('   Restaurant list:');
      
      for (const restaurant of restaurants) {
        const contentBlocksCount = await prisma.contentBlock.count({
          where: { restaurantId: restaurant.id }
        });
        const settingsExists = await prisma.restaurantSettings.count({
          where: { restaurantId: restaurant.id }
        });
        
        console.log(`     ${restaurant.name} (${restaurant.slug}): ${contentBlocksCount} blocks, ${settingsExists} settings`);
      }
    } catch (error) {
      console.log(`   ❌ Restaurants analysis error: ${error.message}`);
    }
    
    console.log('');
    
    // 4. Migration status check
    console.log('🔄 MIGRATION STATUS:');
    try {
      // Check if any restaurant has both settings AND content blocks (migration in progress)
      const restaurantsWithBoth = await prisma.restaurant.findMany({
        where: {
          AND: [
            { restaurant_settings: { isNot: null } },
            { contentBlocks: { some: {} } }
          ]
        },
        select: { name: true, slug: true }
      });
      
      console.log(`   Restaurants with both settings and content blocks: ${restaurantsWithBoth.length}`);
      
      // Check restaurants with only settings (need migration)
      const restaurantsWithOnlySettings = await prisma.restaurant.findMany({
        where: {
          AND: [
            { restaurant_settings: { isNot: null } },
            { contentBlocks: { none: {} } }
          ]
        },
        select: { name: true, slug: true }
      });
      
      console.log(`   Restaurants with only settings (need migration): ${restaurantsWithOnlySettings.length}`);
      restaurantsWithOnlySettings.forEach(r => console.log(`     - ${r.name} (${r.slug})`));
      
    } catch (error) {
      console.log(`   ❌ Migration status error: ${error.message}`);
    }
    
    console.log('');
    console.log('🎯 RECOMMENDED ACTIONS:');
    
    const totalContentBlocks = await prisma.contentBlock.count();
    const totalSettings = await prisma.restaurantSettings.count();
    
    if (totalContentBlocks === 0 && totalSettings > 0) {
      console.log('   1. ⚠️  CRITICAL: No ContentBlocks found but RestaurantSettings exist');
      console.log('   2. 🔧 ACTION: Run migration script to convert RestaurantSettings to ContentBlocks');
      console.log('   3. 📝 COMMAND: node scripts/migrate-settings-to-content-blocks.js');
    } else if (totalContentBlocks > 0) {
      console.log('   1. ✅ ContentBlocks exist in database');
      console.log('   2. 🔍 Check API endpoints and restaurant slug detection');
    } else {
      console.log('   1. ❌ No data found - check database connection and schema');
    }
    
  } catch (error) {
    console.error('❌ DIAGNOSIS FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run diagnosis
diagnoseProduction().catch(console.error); 