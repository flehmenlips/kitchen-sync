const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Set up Prisma with the local database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.NODE_ENV === 'production' 
        ? process.env.DATABASE_URL 
        : `file:${path.join(__dirname, 'database/dev.db')}`
    }
  }
});

async function checkContentBlocks() {
  try {
    console.log('=== CONTENT BLOCKS ANALYSIS ===\n');
    
    // Get all content blocks for Coq au Vin restaurant (ID: 3)
    const restaurantId = 3;
    const blocks = await prisma.contentBlock.findMany({
      where: { restaurantId },
      orderBy: [{ page: 'asc' }, { displayOrder: 'asc' }]
    });
    
    console.log(`Found ${blocks.length} content blocks for restaurant ${restaurantId}\n`);
    
    // Group by page
    const blocksByPage = {};
    blocks.forEach(block => {
      const page = block.page || 'NULL';
      if (!blocksByPage[page]) {
        blocksByPage[page] = [];
      }
      blocksByPage[page].push(block);
    });
    
    // Show page breakdown
    console.log('CONTENT BLOCKS BY PAGE:');
    console.log('======================');
    
    Object.keys(blocksByPage).sort().forEach(page => {
      const pageBlocks = blocksByPage[page];
      console.log(`\n📄 PAGE: ${page} (${pageBlocks.length} blocks)`);
      
      pageBlocks.forEach(block => {
        console.log(`  • ID: ${block.id} | Type: ${block.blockType} | Title: "${block.title || 'No Title'}" | Order: ${block.displayOrder}`);
      });
    });
    
    // Show blockType breakdown
    console.log('\n\nCONTENT BLOCKS BY TYPE:');
    console.log('======================');
    
    const blocksByType = {};
    blocks.forEach(block => {
      const type = block.blockType || 'NULL';
      if (!blocksByType[type]) {
        blocksByType[type] = [];
      }
      blocksByType[type].push(block);
    });
    
    Object.keys(blocksByType).sort().forEach(type => {
      const typeBlocks = blocksByType[type];
      console.log(`\n🔧 TYPE: ${type} (${typeBlocks.length} blocks)`);
      
      typeBlocks.forEach(block => {
        console.log(`  • ID: ${block.id} | Page: ${block.page} | Title: "${block.title || 'No Title'}"`);
      });
    });
    
    // Check for potential issues
    console.log('\n\nPOTENTIAL ISSUES:');
    console.log('================');
    
    const issues = [];
    
    // Check for blocks with no page association
    const noPageBlocks = blocks.filter(b => !b.page);
    if (noPageBlocks.length > 0) {
      issues.push(`${noPageBlocks.length} blocks have no page association`);
    }
    
    // Check for page-type blocks that should define pages
    const pageTypeBlocks = blocks.filter(b => b.blockType === 'page');
    console.log(`Found ${pageTypeBlocks.length} page-defining blocks:`);
    pageTypeBlocks.forEach(block => {
      console.log(`  • Page: ${block.page} | Title: "${block.title}"`);
    });
    
    // Check for content blocks that should belong to specific pages
    const contentBlocks = blocks.filter(b => b.blockType !== 'page');
    console.log(`\nFound ${contentBlocks.length} content blocks (non-page):`);
    contentBlocks.forEach(block => {
      console.log(`  • Page: ${block.page} | Type: ${block.blockType} | Title: "${block.title || 'No Title'}"`);
    });
    
    if (issues.length === 0) {
      console.log('✅ No obvious issues found!');
    } else {
      console.log('⚠️  Issues found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
  } catch (error) {
    console.error('Error checking content blocks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContentBlocks(); 