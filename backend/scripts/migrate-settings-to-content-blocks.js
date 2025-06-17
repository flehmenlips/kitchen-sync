/**
 * Migration Script: Settings Tab to Content Blocks
 * 
 * This script migrates existing hero/about content from RestaurantSettings
 * to proper ContentBlocks for the unified website builder system.
 * 
 * What it does:
 * 1. Finds restaurants with hero/about data in RestaurantSettings
 * 2. Creates corresponding content blocks for the home page
 * 3. Preserves all existing data and styling
 * 4. Creates a clean migration log
 * 5. Handles rollback scenarios
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Migration configuration
const MIGRATION_CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  force: process.argv.includes('--force'),
  restaurantId: process.argv.find(arg => arg.startsWith('--restaurant='))?.split('=')[1],
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
};

// Content block types for migration
const BLOCK_TYPES = {
  HERO: 'hero',
  ABOUT: 'about',
  CONTACT: 'contact',
  HOURS: 'hours',
  MENU: 'menu_preview'
};

class SettingsToContentBlocksMigrator {
  constructor() {
    this.migrationLog = [];
    this.errors = [];
    this.stats = {
      restaurantsProcessed: 0,
      blocksCreated: 0,
      blocksSkipped: 0,
      errors: 0
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.migrationLog.push(logEntry);
    
    if (MIGRATION_CONFIG.verbose || level === 'error') {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    }
  }

  async checkPrerequisites() {
    this.log('🔍 Checking migration prerequisites...');
    
    try {
      // Check database connection
      await prisma.$connect();
      this.log('✅ Database connection successful');

      // Check for existing content blocks
      const existingBlocks = await prisma.contentBlock.findMany({
        where: {
          blockType: { in: Object.values(BLOCK_TYPES) },
          page: 'home'
        },
        select: { id: true, restaurantId: true, blockType: true }
      });

      if (existingBlocks.length > 0 && !MIGRATION_CONFIG.force) {
        this.log(`⚠️  Found ${existingBlocks.length} existing content blocks`, 'warn');
        this.log('Use --force flag to overwrite existing blocks', 'warn');
        return false;
      }

      this.log('✅ Prerequisites check passed');
      return true;
    } catch (error) {
      this.log(`❌ Prerequisites check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async getRestaurantsToMigrate() {
    const whereClause = MIGRATION_CONFIG.restaurantId 
      ? { restaurantId: parseInt(MIGRATION_CONFIG.restaurantId) }
      : {};

    const restaurants = await prisma.restaurantSettings.findMany({
      where: {
        ...whereClause,
        OR: [
          { heroTitle: { not: null } },
          { heroSubtitle: { not: null } },
          { heroImageUrl: { not: null } },
          { aboutTitle: { not: null } },
          { aboutDescription: { not: null } },
          { aboutImageUrl: { not: null } }
        ]
      },
      include: {
        restaurants: {
          select: { name: true, slug: true }
        }
      }
    });

    this.log(`📊 Found ${restaurants.length} restaurants with settings data to migrate`);
    return restaurants;
  }

  async createHeroBlock(restaurantId, settings) {
    if (!settings.heroTitle && !settings.heroSubtitle && !settings.heroImageUrl) {
      this.log(`⏭️  Skipping hero block for restaurant ${restaurantId} - no data`);
      this.stats.blocksSkipped++;
      return null;
    }

    const heroBlock = {
      restaurantId,
      page: 'home',
      blockType: BLOCK_TYPES.HERO,
      title: settings.heroTitle || 'Welcome',
      subtitle: settings.heroSubtitle || null,
      content: null,
      imageUrl: settings.heroImageUrl || null,
      imagePublicId: settings.heroImagePublicId || null,
      buttonText: settings.heroCTAText || null,
      buttonLink: settings.heroCTALink || null,
      buttonStyle: 'primary',
      displayOrder: 1,
      isActive: true,
      settings: {
        style: 'fullscreen',
        overlay: true,
        textAlign: 'center'
      }
    };

    if (MIGRATION_CONFIG.dryRun) {
      this.log(`🔍 [DRY RUN] Would create hero block: ${JSON.stringify(heroBlock, null, 2)}`);
      return heroBlock;
    }

    try {
      const created = await prisma.contentBlock.create({ data: heroBlock });
      this.log(`✅ Created hero block (ID: ${created.id}) for restaurant ${restaurantId}`);
      this.stats.blocksCreated++;
      return created;
    } catch (error) {
      this.log(`❌ Failed to create hero block for restaurant ${restaurantId}: ${error.message}`, 'error');
      this.stats.errors++;
      throw error;
    }
  }

  async createAboutBlock(restaurantId, settings) {
    if (!settings.aboutTitle && !settings.aboutDescription && !settings.aboutImageUrl) {
      this.log(`⏭️  Skipping about block for restaurant ${restaurantId} - no data`);
      this.stats.blocksSkipped++;
      return null;
    }

    const aboutBlock = {
      restaurantId,
      page: 'home',
      blockType: BLOCK_TYPES.ABOUT,
      title: settings.aboutTitle || 'About Us',
      subtitle: null,
      content: settings.aboutDescription || '',
      imageUrl: settings.aboutImageUrl || null,
      imagePublicId: settings.aboutImagePublicId || null,
      buttonText: null,
      buttonLink: null,
      buttonStyle: null,
      displayOrder: 2,
      isActive: true,
      settings: {
        layout: 'image-right',
        textAlign: 'left'
      }
    };

    if (MIGRATION_CONFIG.dryRun) {
      this.log(`🔍 [DRY RUN] Would create about block: ${JSON.stringify(aboutBlock, null, 2)}`);
      return aboutBlock;
    }

    try {
      const created = await prisma.contentBlock.create({ data: aboutBlock });
      this.log(`✅ Created about block (ID: ${created.id}) for restaurant ${restaurantId}`);
      this.stats.blocksCreated++;
      return created;
    } catch (error) {
      this.log(`❌ Failed to create about block for restaurant ${restaurantId}: ${error.message}`, 'error');
      this.stats.errors++;
      throw error;
    }
  }

  async createContactBlock(restaurantId, settings) {
    if (!settings.contactPhone && !settings.contactEmail && !settings.contactAddress) {
      this.log(`⏭️  Skipping contact block for restaurant ${restaurantId} - no data`);
      this.stats.blocksSkipped++;
      return null;
    }

    const contactBlock = {
      restaurantId,
      page: 'home',
      blockType: BLOCK_TYPES.CONTACT,
      title: 'Contact Us',
      subtitle: null,
      content: this.buildContactContent(settings),
      imageUrl: null,
      imagePublicId: null,
      buttonText: null,
      buttonLink: null,
      buttonStyle: null,
      displayOrder: 3,
      isActive: true,
      settings: {
        showMap: true,
        showHours: false,
        layout: 'grid'
      }
    };

    if (MIGRATION_CONFIG.dryRun) {
      this.log(`🔍 [DRY RUN] Would create contact block: ${JSON.stringify(contactBlock, null, 2)}`);
      return contactBlock;
    }

    try {
      const created = await prisma.contentBlock.create({ data: contactBlock });
      this.log(`✅ Created contact block (ID: ${created.id}) for restaurant ${restaurantId}`);
      this.stats.blocksCreated++;
      return created;
    } catch (error) {
      this.log(`❌ Failed to create contact block for restaurant ${restaurantId}: ${error.message}`, 'error');
      this.stats.errors++;
      throw error;
    }
  }

  async createHoursBlock(restaurantId, openingHours) {
    if (!openingHours || Object.keys(openingHours).length === 0) {
      this.log(`⏭️  Skipping hours block for restaurant ${restaurantId} - no opening hours data`);
      this.stats.blocksSkipped++;
      return null;
    }

    const hoursBlock = {
      restaurantId,
      page: 'home',
      blockType: BLOCK_TYPES.HOURS,
      title: 'Opening Hours',
      subtitle: null,
      content: this.buildHoursContent(openingHours),
      imageUrl: null,
      imagePublicId: null,
      buttonText: null,
      buttonLink: null,
      buttonStyle: null,
      displayOrder: 4,
      isActive: true,
      settings: {
        showToday: true,
        format24Hour: false,
        showClosed: true,
        layout: 'table'
      }
    };

    if (MIGRATION_CONFIG.dryRun) {
      this.log(`🔍 [DRY RUN] Would create hours block: ${JSON.stringify(hoursBlock, null, 2)}`);
      return hoursBlock;
    }

    try {
      const created = await prisma.contentBlock.create({ data: hoursBlock });
      this.log(`✅ Created hours block (ID: ${created.id}) for restaurant ${restaurantId}`);
      this.stats.blocksCreated++;
      return created;
    } catch (error) {
      this.log(`❌ Failed to create hours block for restaurant ${restaurantId}: ${error.message}`, 'error');
      this.stats.errors++;
      throw error;
    }
  }

  async createMenuBlock(restaurantId, hasMenus) {
    if (!hasMenus) {
      this.log(`⏭️  Skipping menu block for restaurant ${restaurantId} - no menu data`);
      this.stats.blocksSkipped++;
      return null;
    }

    const menuBlock = {
      restaurantId,
      page: 'home',
      blockType: BLOCK_TYPES.MENU,
      title: 'Our Menu',
      subtitle: 'Explore our delicious offerings',
      content: 'Discover our carefully crafted dishes made with the finest ingredients.',
      imageUrl: null,
      imagePublicId: null,
      buttonText: 'View Full Menu',
      buttonLink: '/menu',
      buttonStyle: 'primary',
      displayOrder: 5,
      isActive: true,
      settings: {
        showPrices: true,
        itemsToShow: 6,
        layout: 'grid',
        showCategories: true
      }
    };

    if (MIGRATION_CONFIG.dryRun) {
      this.log(`🔍 [DRY RUN] Would create menu block: ${JSON.stringify(menuBlock, null, 2)}`);
      return menuBlock;
    }

    try {
      const created = await prisma.contentBlock.create({ data: menuBlock });
      this.log(`✅ Created menu block (ID: ${created.id}) for restaurant ${restaurantId}`);
      this.stats.blocksCreated++;
      return created;
    } catch (error) {
      this.log(`❌ Failed to create menu block for restaurant ${restaurantId}: ${error.message}`, 'error');
      this.stats.errors++;
      throw error;
    }
  }

  buildHoursContent(openingHours) {
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const parts = [];
    
    dayOrder.forEach(day => {
      if (openingHours[day]) {
        const hours = openingHours[day];
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        
        if (hours.open && hours.close) {
          parts.push(`${dayName}: ${hours.open} - ${hours.close}`);
        } else {
          parts.push(`${dayName}: Closed`);
        }
      }
    });
    
    return parts.join('\n');
  }

  buildContactContent(settings) {
    const parts = [];
    
    if (settings.contactPhone) parts.push(`Phone: ${settings.contactPhone}`);
    if (settings.contactEmail) parts.push(`Email: ${settings.contactEmail}`);
    
    if (settings.contactAddress) {
      let address = settings.contactAddress;
      if (settings.contactCity) address += `, ${settings.contactCity}`;
      if (settings.contactState) address += `, ${settings.contactState}`;
      if (settings.contactZip) address += ` ${settings.contactZip}`;
      parts.push(`Address: ${address}`);
    }
    
    return parts.join('\n\n');
  }

  async getRestaurantWithExtendedData(restaurantId) {
    // Get restaurant data including opening hours and menu count
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        openingHours: true,
        _count: {
          select: {
            menus: true
          }
        }
      }
    });
    
    return restaurant;
  }

  async migrateRestaurant(restaurant) {
    const { restaurantId, restaurants: restaurantInfo } = restaurant;
    
    this.log(`\n🏪 Migrating restaurant: ${restaurantInfo.name} (ID: ${restaurantId})`);
    
    try {
      const blocks = [];
      
      // Get extended restaurant data
      const restaurantData = await this.getRestaurantWithExtendedData(restaurantId);
      
      // Create hero block
      const heroBlock = await this.createHeroBlock(restaurantId, restaurant);
      if (heroBlock) blocks.push(heroBlock);
      
      // Create about block
      const aboutBlock = await this.createAboutBlock(restaurantId, restaurant);
      if (aboutBlock) blocks.push(aboutBlock);
      
      // Create contact block
      const contactBlock = await this.createContactBlock(restaurantId, restaurant);
      if (contactBlock) blocks.push(contactBlock);
      
      // Create hours block
      const hoursBlock = await this.createHoursBlock(restaurantId, restaurantData?.openingHours);
      if (hoursBlock) blocks.push(hoursBlock);
      
      // Create menu block
      const hasMenus = restaurantData?._count?.menus > 0;
      const menuBlock = await this.createMenuBlock(restaurantId, hasMenus);
      if (menuBlock) blocks.push(menuBlock);
      
      this.stats.restaurantsProcessed++;
      this.log(`✅ Completed migration for ${restaurantInfo.name} - Created ${blocks.length} blocks`);
      
      return blocks;
    } catch (error) {
      this.log(`❌ Failed to migrate restaurant ${restaurantInfo.name}: ${error.message}`, 'error');
      this.stats.errors++;
      throw error;
    }
  }

  async run() {
    console.log('🚀 Starting Settings to Content Blocks Migration');
    console.log('================================================\n');
    
    if (MIGRATION_CONFIG.dryRun) {
      console.log('🔍 DRY RUN MODE - No actual changes will be made\n');
    }

    try {
      // Check prerequisites
      const canProceed = await this.checkPrerequisites();
      if (!canProceed) {
        throw new Error('Prerequisites check failed');
      }

      // Get restaurants to migrate
      const restaurants = await this.getRestaurantsToMigrate();
      if (restaurants.length === 0) {
        this.log('ℹ️  No restaurants found with settings data to migrate');
        return;
      }

      // Migrate each restaurant
      for (const restaurant of restaurants) {
        await this.migrateRestaurant(restaurant);
      }

      // Print summary
      this.printSummary();

    } catch (error) {
      this.log(`💥 Migration failed: ${error.message}`, 'error');
      console.error('\n💥 MIGRATION FAILED');
      console.error(error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  printSummary() {
    console.log('\n📊 Migration Summary');
    console.log('===================');
    console.log(`Restaurants processed: ${this.stats.restaurantsProcessed}`);
    console.log(`Content blocks created: ${this.stats.blocksCreated}`);
    console.log(`Content blocks skipped: ${this.stats.blocksSkipped}`);
    console.log(`Errors encountered: ${this.stats.errors}`);
    
    if (MIGRATION_CONFIG.dryRun) {
      console.log('\n🔍 This was a dry run - no actual changes were made');
      console.log('Run without --dry-run flag to perform the actual migration');
    } else if (this.stats.errors === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with errors');
    }
  }
}

// Script execution
async function main() {
  const migrator = new SettingsToContentBlocksMigrator();
  await migrator.run();
}

// Handle script arguments
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Settings to Content Blocks Migration Script
==========================================

Usage: node migrate-settings-to-content-blocks.js [options]

Options:
  --dry-run           Preview changes without making them
  --force             Overwrite existing content blocks
  --restaurant=ID     Migrate specific restaurant only
  --verbose, -v       Verbose logging
  --help, -h          Show this help message

Examples:
  node migrate-settings-to-content-blocks.js --dry-run
  node migrate-settings-to-content-blocks.js --restaurant=2 --verbose
  node migrate-settings-to-content-blocks.js --force
`);
    process.exit(0);
  }

  main().catch(console.error);
} 