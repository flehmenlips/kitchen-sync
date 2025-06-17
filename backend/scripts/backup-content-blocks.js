const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupContentBlocks() {
  try {
    console.log('Starting content blocks backup...');
    
    // Get all content blocks
    const contentBlocks = await prisma.contentBlock.findMany({
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `content-blocks-backup-${timestamp}.json`);

    // Write to file
    fs.writeFileSync(backupFile, JSON.stringify(contentBlocks, null, 2));
    
    console.log(`Backup completed successfully! File saved to: ${backupFile}`);
    console.log(`Total content blocks backed up: ${contentBlocks.length}`);

    // Print summary by restaurant
    const restaurantSummary = contentBlocks.reduce((acc, block) => {
      const restaurantName = block.restaurant?.name || 'Unknown Restaurant';
      acc[restaurantName] = (acc[restaurantName] || 0) + 1;
      return acc;
    }, {});

    console.log('\nContent blocks by restaurant:');
    Object.entries(restaurantSummary).forEach(([restaurant, count]) => {
      console.log(`${restaurant}: ${count} blocks`);
    });

    // Print summary by block type
    const blockTypeSummary = contentBlocks.reduce((acc, block) => {
      acc[block.blockType] = (acc[block.blockType] || 0) + 1;
      return acc;
    }, {});

    console.log('\nContent blocks by type:');
    Object.entries(blockTypeSummary).forEach(([type, count]) => {
      console.log(`${type}: ${count} blocks`);
    });

  } catch (error) {
    console.error('Error during backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupContentBlocks(); 