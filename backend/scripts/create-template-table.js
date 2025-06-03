const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTable() {
  try {
    console.log('Creating WebsiteTemplate table...');
    
    // Create the table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "WebsiteTemplate" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) UNIQUE NOT NULL,
        "displayName" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "category" VARCHAR(50) NOT NULL,
        "thumbnail" VARCHAR(500),
        "layoutConfig" JSONB NOT NULL DEFAULT '{}',
        "defaultColors" JSONB NOT NULL DEFAULT '{}',
        "defaultFonts" JSONB NOT NULL DEFAULT '{}',
        "defaultSpacing" JSONB NOT NULL DEFAULT '{}',
        "heroStyle" VARCHAR(50) NOT NULL DEFAULT 'standard',
        "menuStyle" VARCHAR(50) NOT NULL DEFAULT 'grid',
        "aboutStyle" VARCHAR(50) NOT NULL DEFAULT 'side-by-side',
        "navigationStyle" VARCHAR(50) NOT NULL DEFAULT 'standard',
        "headingStyle" VARCHAR(50) NOT NULL DEFAULT 'serif',
        "bodyStyle" VARCHAR(50) NOT NULL DEFAULT 'sans-serif',
        "letterSpacing" VARCHAR(50) NOT NULL DEFAULT 'normal',
        "textTransform" VARCHAR(50) NOT NULL DEFAULT 'none',
        "animationStyle" VARCHAR(50) NOT NULL DEFAULT 'none',
        "transitionSpeed" VARCHAR(50) NOT NULL DEFAULT 'normal',
        "features" TEXT[] DEFAULT '{}',
        "isPremium" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await prisma.$executeRawUnsafe(createTableSQL);
    console.log('✓ WebsiteTemplate table created');
    
    // Create indices
    try {
      await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "WebsiteTemplate_category_idx" ON "WebsiteTemplate"("category")');
      console.log('✓ Created category index');
    } catch (e) {
      console.log('Note: Category index may already exist');
    }
    
    try {
      await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "WebsiteTemplate_isActive_idx" ON "WebsiteTemplate"("isActive")');
      console.log('✓ Created isActive index');
    } catch (e) {
      console.log('Note: isActive index may already exist');
    }
    
    // Add templateId column to restaurant_settings
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "restaurant_settings" ADD COLUMN IF NOT EXISTS "templateId" INTEGER');
      console.log('✓ Added templateId column to restaurant_settings');
    } catch (e) {
      console.log('Note: templateId column may already exist');
    }
    
    // Add customCss column to restaurant_settings
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "restaurant_settings" ADD COLUMN IF NOT EXISTS "customCss" TEXT');
      console.log('✓ Added customCss column to restaurant_settings');
    } catch (e) {
      console.log('Note: customCss column may already exist');
    }
    
    console.log('\n✓ All database changes completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTable(); 