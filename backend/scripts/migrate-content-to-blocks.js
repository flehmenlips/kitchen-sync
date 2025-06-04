const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateContent() {
  try {
    console.log('🔄 Starting content migration...');
    
    // Get existing restaurant settings
    const settings = await prisma.restaurantSettings.findFirst({
      where: { restaurantId: 1 }
    });
    
    if (!settings) {
      console.log('❌ No restaurant settings found');
      return;
    }
    
    console.log('📄 Found existing settings:');
    console.log('  Hero Title:', settings.heroTitle);
    console.log('  Hero Subtitle:', settings.heroSubtitle);
    console.log('  About Title:', settings.aboutTitle);
    console.log('  About Description:', settings.aboutDescription ? settings.aboutDescription.substring(0, 50) + '...' : 'None');
    
    // Handle home page content block
    if (settings.heroTitle || settings.heroSubtitle) {
      const existingHomeBlock = await prisma.contentBlock.findFirst({
        where: {
          restaurantId: 1,
          page: 'home',
          blockType: 'hero'
        }
      });
      
      if (existingHomeBlock) {
        const homeBlock = await prisma.contentBlock.update({
          where: { id: existingHomeBlock.id },
          data: {
            title: settings.heroTitle,
            subtitle: settings.heroSubtitle,
            content: settings.heroSubtitle,
            imageUrl: settings.heroImageUrl,
            buttonText: settings.heroCTAText,
            buttonLink: settings.heroCTALink,
            updatedAt: new Date()
          }
        });
        console.log('✅ Home page content updated (ID:', homeBlock.id, ')');
      } else {
        const homeBlock = await prisma.contentBlock.create({
          data: {
            restaurantId: 1,
            page: 'home',
            blockType: 'hero',
            title: settings.heroTitle,
            subtitle: settings.heroSubtitle,
            content: settings.heroSubtitle,
            imageUrl: settings.heroImageUrl,
            buttonText: settings.heroCTAText,
            buttonLink: settings.heroCTALink,
            displayOrder: 1,
            isActive: true
          }
        });
        console.log('✅ Home page content created (ID:', homeBlock.id, ')');
      }
    }
    
    // Handle about page content block
    if (settings.aboutTitle || settings.aboutDescription) {
      const existingAboutBlock = await prisma.contentBlock.findFirst({
        where: {
          restaurantId: 1,
          page: 'about',
          blockType: 'text'
        }
      });
      
      if (existingAboutBlock) {
        const aboutBlock = await prisma.contentBlock.update({
          where: { id: existingAboutBlock.id },
          data: {
            title: settings.aboutTitle,
            content: settings.aboutDescription,
            imageUrl: settings.aboutImageUrl,
            updatedAt: new Date()
          }
        });
        console.log('✅ About page content updated (ID:', aboutBlock.id, ')');
      } else {
        const aboutBlock = await prisma.contentBlock.create({
          data: {
            restaurantId: 1,
            page: 'about',
            blockType: 'text',
            title: settings.aboutTitle,
            content: settings.aboutDescription,
            imageUrl: settings.aboutImageUrl,
            displayOrder: 1,
            isActive: true
          }
        });
        console.log('✅ About page content created (ID:', aboutBlock.id, ')');
      }
    }
    
    // Verify the migration
    const blocks = await prisma.contentBlock.findMany({
      where: {
        restaurantId: 1,
        page: { in: ['home', 'about'] }
      }
    });
    
    console.log('\n📋 Content blocks after migration:');
    blocks.forEach(block => {
      console.log(`  ${block.page} (${block.blockType}): ${block.title || 'No title'}`);
    });
    
    console.log('\n🎉 Content migration completed successfully!');
    console.log('💡 Now refresh your Website Builder page to see your content!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateContent(); 