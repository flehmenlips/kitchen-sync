const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
const prisma = new PrismaClient();

async function fixMissingAboutBlock() {
  try {
    console.log('🔧 Fixing missing about content block...');
    
    // Get the about content from RestaurantSettings
    const settings = await prisma.restaurantSettings.findFirst({
      where: { restaurantId: 1 }
    });
    
    if (!settings) {
      console.log('❌ No restaurant settings found');
      return;
    }
    
    // Check if about block already exists
    const existingAbout = await prisma.contentBlock.findFirst({
      where: {
        restaurantId: 1,
        page: 'about'
      }
    });
    
    if (existingAbout) {
      console.log('✅ About content block already exists');
      return;
    }
    
    // Create the missing about content block
    const aboutBlock = await prisma.contentBlock.create({
      data: {
        restaurantId: 1,
        page: 'about',
        blockType: 'text',
        title: settings.aboutTitle || 'Our Story',
        content: settings.aboutDescription || '',
        imageUrl: settings.aboutImageUrl,
        displayOrder: 1,
        isActive: true
      }
    });
    
    console.log('✅ Created about content block (ID:', aboutBlock.id, ')');
    console.log('✅ Website Builder should now show both Hero & About content!');
    
  } catch (error) {
    console.error('❌ Error fixing about block:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingAboutBlock(); 