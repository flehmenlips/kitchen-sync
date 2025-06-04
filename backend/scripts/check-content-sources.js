const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
const prisma = new PrismaClient();

async function checkContentSources() {
  try {
    console.log('🔍 Checking content sources for restaurant ID 1...\n');
    
    console.log('=== RESTAURANT SETTINGS TABLE ===');
    const settings = await prisma.restaurantSettings.findFirst({
      where: { restaurantId: 1 }
    });
    
    if (settings) {
      console.log('✅ RestaurantSettings found:');
      console.log('  Hero Title:', settings.heroTitle || '(empty)');
      console.log('  Hero Subtitle:', settings.heroSubtitle || '(empty)');
      console.log('  Hero Image:', settings.heroImageUrl ? 'Yes' : 'No');
      console.log('  About Title:', settings.aboutTitle || '(empty)');
      console.log('  About Description:', settings.aboutDescription ? 
        settings.aboutDescription.substring(0, 100) + '...' : '(empty)');
      console.log('  About Image:', settings.aboutImageUrl ? 'Yes' : 'No');
    } else {
      console.log('❌ No RestaurantSettings found for restaurant ID 1');
    }
    
    console.log('\n=== CONTENT BLOCKS TABLE ===');
    const blocks = await prisma.contentBlock.findMany({
      where: { 
        restaurantId: 1,
        page: { in: ['home', 'about'] }
      },
      orderBy: { page: 'asc' }
    });
    
    if (blocks.length > 0) {
      console.log(`✅ Found ${blocks.length} content blocks:`);
      blocks.forEach(block => {
        console.log(`  ${block.page.toUpperCase()} (${block.blockType}):`);
        console.log(`    Title: ${block.title || '(empty)'}`);
        console.log(`    Subtitle: ${block.subtitle || '(empty)'}`);
        console.log(`    Content: ${block.content ? block.content.substring(0, 50) + '...' : '(empty)'}`);
        console.log(`    Image: ${block.imageUrl ? 'Yes' : 'No'}`);
        console.log(`    Active: ${block.isActive}`);
      });
    } else {
      console.log('❌ No ContentBlocks found for home/about pages');
    }
    
    console.log('\n=== API ENDPOINT TEST ===');
    console.log('Testing which API endpoint the live site is using...');
    
    // Test public settings endpoint (what customer portal uses)
    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:3001/api/restaurant/public/settings');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Public settings API working:');
        console.log('  Hero Title from API:', data.heroTitle || '(empty)');
        console.log('  Hero Subtitle from API:', data.heroSubtitle || '(empty)');
      }
    } catch (error) {
      console.log('❌ Could not test public settings API:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking content sources:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContentSources(); 