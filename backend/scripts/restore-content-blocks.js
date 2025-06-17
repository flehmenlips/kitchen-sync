const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreContent() {
  try {
    console.log('Starting content restoration...');
    
    // Read the backup file
    const backupFile = path.join(__dirname, '../backups/content-blocks-backup-2025-06-16T06-58-23-583Z.json');
    const contentBlocks = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    // Group blocks by restaurant
    const restaurantBlocks = contentBlocks.reduce((acc, block) => {
      const restaurantSlug = block.restaurant.slug;
      if (!acc[restaurantSlug]) {
        acc[restaurantSlug] = {
          name: block.restaurant.name,
          slug: block.restaurant.slug,
          blocks: []
        };
      }
      acc[restaurantSlug].blocks.push(block);
      return acc;
    }, {});

    // Process each restaurant
    for (const [slug, data] of Object.entries(restaurantBlocks)) {
      console.log(`\nProcessing ${data.name}...`);

      // Create or update restaurant
      const restaurant = await prisma.restaurant.upsert({
        where: { slug },
        update: {},
        create: {
          name: data.name,
          slug: data.slug,
          isActive: true,
          restaurant_settings: {
            create: {
              // Default settings
              heroTitle: '',
              heroSubtitle: '',
              heroImageUrl: '',
              heroImagePublicId: '',
              aboutTitle: '',
              aboutDescription: ''
            }
          }
        }
      });

      // Process hero blocks
      const heroBlocks = data.blocks.filter(block => block.blockType === 'hero');
      for (const block of heroBlocks) {
        if (block.page === 'home') {
          await prisma.restaurantSettings.update({
            where: { restaurantId: restaurant.id },
            data: {
              heroTitle: block.title || '',
              heroSubtitle: block.subtitle || '',
              heroImageUrl: block.imageUrl || '',
              heroImagePublicId: block.imagePublicId || ''
            }
          });
        } else if (block.page === 'about') {
          await prisma.restaurantSettings.update({
            where: { restaurantId: restaurant.id },
            data: {
              aboutTitle: block.title || '',
              aboutDescription: block.subtitle || ''
            }
          });
        }
      }

      // Create pages
      const pages = [...new Set(data.blocks.map(block => block.page))];
      for (const pageName of pages) {
        const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        await prisma.page.upsert({
          where: {
            restaurantId_slug: {
              restaurantId: restaurant.id,
              slug: pageName
            }
          },
          update: {},
          create: {
            restaurantId: restaurant.id,
            slug: pageName,
            name: pageTitle,
            title: pageTitle,
            description: '',
            template: 'default',
            displayOrder: 0,
            isActive: true,
            isSystem: false
          }
        });
      }

      console.log(`✓ Created/updated ${pages.length} pages`);
      console.log(`✓ Migrated ${heroBlocks.length} hero blocks to restaurant settings`);
    }

    console.log('\nContent restoration completed successfully!');

  } catch (error) {
    console.error('Error during restoration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

restoreContent(); 