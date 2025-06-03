const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function insertTemplates() {
  try {
    console.log('Inserting website templates...');

    // Check if templates already exist
    const existingTemplates = await prisma.websiteTemplate.count();
    if (existingTemplates > 0) {
      console.log('Templates already exist. Skipping insertion.');
      return;
    }

    // Insert Fine Dining template
    const fineDining = await prisma.websiteTemplate.create({
      data: {
        name: 'fine-dining',
        displayName: 'Fine Dining',
        description: 'Elegant and minimalist template perfect for upscale restaurants, wine bars, and chef-driven establishments',
        category: 'premium',
        thumbnail: '/templates/fine-dining-preview.jpg',
        layoutConfig: {
          sections: ['hero', 'tagline', 'nav', 'about', 'menu-preview', 'reservations', 'hours', 'location'],
          layout: 'full-width',
          containerWidth: '1200px',
          sectionSpacing: 'large'
        },
        defaultColors: {
          primary: '#000000',
          secondary: '#ffffff',
          accent: '#666666',
          text: '#000000',
          background: '#fafaf8',
          hover: '#333333'
        },
        defaultFonts: {
          heading: 'Playfair Display, serif',
          body: 'Inter, sans-serif',
          special: 'Courier New, monospace'
        },
        defaultSpacing: {
          sectionPadding: '120px',
          elementSpacing: '48px',
          lineHeight: '1.8',
          paragraphSpacing: '24px'
        },
        heroStyle: 'minimal',
        menuStyle: 'elegant',
        aboutStyle: 'centered',
        navigationStyle: 'minimal',
        headingStyle: 'serif',
        bodyStyle: 'sans-serif',
        letterSpacing: 'wide',
        textTransform: 'none',
        animationStyle: 'elegant',
        transitionSpeed: 'slow',
        features: [
          'animated-underline',
          'hover-effects',
          'smooth-scroll',
          'parallax-sections',
          'sticky-navigation',
          'reservation-widget',
          'instagram-feed',
          'wine-list',
          'tasting-menu',
          'private-events'
        ],
        isPremium: true,
        isActive: true,
        sortOrder: 1
      }
    });
    console.log('✓ Fine Dining template created');

    // Insert Classic template
    const classic = await prisma.websiteTemplate.create({
      data: {
        name: 'classic',
        displayName: 'Classic',
        description: 'Traditional restaurant website with all essential features',
        category: 'classic',
        layoutConfig: {
          sections: ['hero', 'nav', 'about', 'menu', 'contact', 'hours'],
          layout: 'boxed',
          containerWidth: '1140px'
        },
        defaultColors: {
          primary: '#d32f2f',
          secondary: '#ffc107',
          accent: '#333333',
          text: '#212121',
          background: '#ffffff'
        },
        defaultFonts: {
          heading: 'Roboto, sans-serif',
          body: 'Roboto, sans-serif'
        },
        defaultSpacing: {
          sectionPadding: '60px',
          elementSpacing: '24px'
        },
        heroStyle: 'standard',
        menuStyle: 'grid',
        aboutStyle: 'side-by-side',
        navigationStyle: 'standard',
        headingStyle: 'sans-serif',
        bodyStyle: 'sans-serif',
        letterSpacing: 'normal',
        textTransform: 'none',
        animationStyle: 'none',
        transitionSpeed: 'normal',
        features: ['basic-menu', 'contact-form', 'google-maps', 'photo-gallery'],
        isPremium: false,
        isActive: true,
        sortOrder: 2
      }
    });
    console.log('✓ Classic template created');

    // Insert Modern template
    const modern = await prisma.websiteTemplate.create({
      data: {
        name: 'modern',
        displayName: 'Modern',
        description: 'Clean and contemporary design with bold typography',
        category: 'modern',
        layoutConfig: {
          sections: ['nav', 'hero', 'features', 'menu', 'testimonials', 'contact'],
          layout: 'full-width',
          containerWidth: '1280px'
        },
        defaultColors: {
          primary: '#2196f3',
          secondary: '#ff5722',
          accent: '#455a64',
          text: '#263238',
          background: '#f5f5f5'
        },
        defaultFonts: {
          heading: 'Montserrat, sans-serif',
          body: 'Open Sans, sans-serif'
        },
        defaultSpacing: {
          sectionPadding: '80px',
          elementSpacing: '32px'
        },
        heroStyle: 'video',
        menuStyle: 'tabs',
        aboutStyle: 'alternating',
        navigationStyle: 'sticky',
        headingStyle: 'sans-serif',
        bodyStyle: 'sans-serif',
        letterSpacing: 'normal',
        textTransform: 'none',
        animationStyle: 'subtle',
        transitionSpeed: 'normal',
        features: ['video-background', 'menu-filters', 'online-ordering', 'loyalty-program'],
        isPremium: false,
        isActive: true,
        sortOrder: 3
      }
    });
    console.log('✓ Modern template created');

    console.log('\nAll templates inserted successfully!');
  } catch (error) {
    console.error('Error inserting templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
insertTemplates(); 