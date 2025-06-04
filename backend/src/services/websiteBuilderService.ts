import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WebsiteBuilderData {
  // Site-wide settings from RestaurantSettings
  settings: {
    // Branding
    websiteName?: string;
    tagline?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontPrimary?: string;
    fontSecondary?: string;
    logoUrl?: string;
    logoPublicId?: string;
    
    // Contact & Hours
    contactPhone?: string;
    contactEmail?: string;
    contactAddress?: string;
    contactCity?: string;
    contactState?: string;
    contactZip?: string;
    openingHours?: any;
    
    // Menu Display
    menuDisplayMode?: string;
    activeMenuIds?: number[];
    
    // Social & Footer
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    footerText?: string;
    
    // SEO
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  
  // Pages from ContentBlocks
  pages: WebsiteBuilderPage[];
}

export interface WebsiteBuilderPage {
  id: string; // Virtual ID for new pages, 'home'/'about' for system pages
  name: string;
  slug: string;
  url: string;
  isSystem: boolean; // true for home/about, false for custom pages
  isActive: boolean;
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  blocks: WebsiteBuilderBlock[];
}

export interface WebsiteBuilderBlock {
  id: number;
  blockType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  imagePublicId?: string;
  videoUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: string;
  settings?: any;
  displayOrder: number;
  isActive: boolean;
}

export interface PageCreationData {
  name: string;
  slug: string;
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const websiteBuilderService = {
  // Get all website builder data (settings + pages)
  async getWebsiteBuilderData(restaurantId: number = 1): Promise<WebsiteBuilderData> {
    try {
      // Get restaurant settings
      let settingsData = await prisma.restaurantSettings.findUnique({
        where: { restaurantId }
      });

      // If no settings exist, create default ones
      if (!settingsData) {
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: restaurantId },
          select: { name: true }
        });
        
        const restaurantName = restaurant?.name || 'Your Restaurant';
        
        settingsData = await prisma.restaurantSettings.create({
          data: {
            restaurantId,
            websiteName: restaurantName,
            tagline: 'Fresh, local ingredients meet culinary excellence',
            heroTitle: `Welcome to ${restaurantName}`,
            heroSubtitle: 'Experience culinary excellence',
            heroCTAText: 'Make a Reservation',
            heroCTALink: '/customer/reservations/new',
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e',
            accentColor: '#333333',
            fontPrimary: 'Roboto, sans-serif',
            fontSecondary: 'Playfair Display, serif',
            openingHours: {
              monday: { open: '11:00 AM', close: '9:00 PM' },
              tuesday: { open: '11:00 AM', close: '9:00 PM' },
              wednesday: { open: '11:00 AM', close: '9:00 PM' },
              thursday: { open: '11:00 AM', close: '9:00 PM' },
              friday: { open: '11:00 AM', close: '10:00 PM' },
              saturday: { open: '11:00 AM', close: '10:00 PM' },
              sunday: { open: '10:00 AM', close: '9:00 PM' }
            }
          }
        });
      }
      
      // Get content blocks grouped by page
      const contentBlocks = await prisma.contentBlock.findMany({
        where: {
          restaurantId,
          isActive: true
        },
        orderBy: [
          { page: 'asc' },
          { displayOrder: 'asc' }
        ]
      });
      
      // Group blocks by page
      const pageBlocks = contentBlocks.reduce((acc, block) => {
        if (!acc[block.page]) {
          acc[block.page] = [];
        }
        acc[block.page].push({
          id: block.id,
          blockType: block.blockType,
          title: block.title || undefined,
          subtitle: block.subtitle || undefined,
          content: block.content || undefined,
          imageUrl: block.imageUrl || undefined,
          imagePublicId: block.imagePublicId || undefined,
          videoUrl: block.videoUrl || undefined,
          buttonText: block.buttonText || undefined,
          buttonLink: block.buttonLink || undefined,
          buttonStyle: block.buttonStyle || undefined,
          settings: block.settings || undefined,
          displayOrder: block.displayOrder,
          isActive: block.isActive
        });
        return acc;
      }, {} as Record<string, WebsiteBuilderBlock[]>);
      
      // Get unique pages
      const uniquePages = await prisma.contentBlock.findMany({
        where: { restaurantId },
        select: { page: true },
        distinct: ['page']
      });
      
      // Create page list with system and custom pages
      const pages: WebsiteBuilderPage[] = [];
      
      // System pages (always present)
      const systemPages = [
        { id: 'home', name: 'Home', slug: 'home', url: '/', order: 0 },
        { id: 'about', name: 'About', slug: 'about', url: '/about', order: 1 },
        { id: 'menu', name: 'Menu', slug: 'menu', url: '/menu', order: 2 },
        { id: 'contact', name: 'Contact', slug: 'contact', url: '/contact', order: 3 }
      ];
      
      systemPages.forEach(sysPage => {
        pages.push({
          id: sysPage.id,
          name: sysPage.name,
          slug: sysPage.slug,
          url: sysPage.url,
          isSystem: true,
          isActive: true,
          displayOrder: sysPage.order,
          blocks: pageBlocks[sysPage.slug] || []
        });
      });
      
      // Custom pages
      uniquePages.forEach((page, index) => {
        if (!['home', 'about', 'menu', 'contact'].includes(page.page)) {
          // Generate virtual ID for custom pages
          const virtualId = Math.abs(page.page.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0)).toString();
          
          pages.push({
            id: virtualId,
            name: this.formatPageName(page.page),
            slug: page.page,
            url: `/${page.page}`,
            isSystem: false,
            isActive: true,
            displayOrder: 10 + index, // Custom pages after system pages
            blocks: pageBlocks[page.page] || []
          });
        }
      });
      
      return {
        settings: {
          // Branding
          websiteName: settingsData.websiteName || undefined,
          tagline: settingsData.tagline || undefined,
          primaryColor: settingsData.primaryColor || undefined,
          secondaryColor: settingsData.secondaryColor || undefined,
          accentColor: settingsData.accentColor || undefined,
          fontPrimary: settingsData.fontPrimary || undefined,
          fontSecondary: settingsData.fontSecondary || undefined,
          logoUrl: settingsData.logoUrl || undefined,
          logoPublicId: settingsData.logoPublicId || undefined,
          
          // Contact & Hours
          contactPhone: settingsData.contactPhone || undefined,
          contactEmail: settingsData.contactEmail || undefined,
          contactAddress: settingsData.contactAddress || undefined,
          contactCity: settingsData.contactCity || undefined,
          contactState: settingsData.contactState || undefined,
          contactZip: settingsData.contactZip || undefined,
          openingHours: settingsData.openingHours,
          
          // Menu Display
          menuDisplayMode: settingsData.menuDisplayMode || undefined,
          activeMenuIds: settingsData.activeMenuIds || undefined,
          
          // Social & Footer
          facebookUrl: settingsData.facebookUrl || undefined,
          instagramUrl: settingsData.instagramUrl || undefined,
          twitterUrl: settingsData.twitterUrl || undefined,
          footerText: settingsData.footerText || undefined,
          
          // SEO
          metaTitle: settingsData.metaTitle || undefined,
          metaDescription: settingsData.metaDescription || undefined,
          metaKeywords: settingsData.metaKeywords || undefined
        },
        pages: pages.sort((a, b) => a.displayOrder - b.displayOrder)
      };
    } catch (error) {
      console.error('Error fetching website builder data:', error);
      throw error;
    }
  },
  
  // Update restaurant settings
  async updateSettings(restaurantId: number = 1, settings: Partial<WebsiteBuilderData['settings']>) {
    try {
      return await prisma.restaurantSettings.update({
        where: { restaurantId },
        data: settings
      });
    } catch (error) {
      console.error('Error updating website builder settings:', error);
      throw error;
    }
  },
  
  // Create a new page
  async createPage(restaurantId: number = 1, pageData: PageCreationData): Promise<WebsiteBuilderPage> {
    try {
      // Validate slug is unique
      const existingPage = await prisma.contentBlock.findFirst({
        where: {
          restaurantId,
          page: pageData.slug
        }
      });
      
      if (existingPage) {
        throw new Error(`Page with slug '${pageData.slug}' already exists`);
      }
      
      // Create initial hero block for the page
      const heroBlock = await prisma.contentBlock.create({
        data: {
          restaurantId,
          page: pageData.slug,
          blockType: 'hero',
          title: pageData.name,
          subtitle: `Welcome to our ${pageData.name.toLowerCase()} page`,
          content: '',
          displayOrder: 0,
          isActive: true,
          settings: {
            template: pageData.template || 'default'
          }
        }
      });
      
      // Generate virtual ID
      const virtualId = Math.abs(pageData.slug.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)).toString();
      
      return {
        id: virtualId,
        name: pageData.name,
        slug: pageData.slug,
        url: `/${pageData.slug}`,
        isSystem: false,
        isActive: true,
        displayOrder: 100, // New pages at end
        metaTitle: pageData.metaTitle,
        metaDescription: pageData.metaDescription,
        blocks: [{
          id: heroBlock.id,
          blockType: heroBlock.blockType,
          title: heroBlock.title || undefined,
          subtitle: heroBlock.subtitle || undefined,
          content: heroBlock.content || undefined,
          imageUrl: heroBlock.imageUrl || undefined,
          imagePublicId: heroBlock.imagePublicId || undefined,
          videoUrl: heroBlock.videoUrl || undefined,
          buttonText: heroBlock.buttonText || undefined,
          buttonLink: heroBlock.buttonLink || undefined,
          buttonStyle: heroBlock.buttonStyle || undefined,
          settings: heroBlock.settings || undefined,
          displayOrder: heroBlock.displayOrder,
          isActive: heroBlock.isActive
        }]
      };
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  },
  
  // Delete a page (and all its blocks)
  async deletePage(restaurantId: number = 1, pageSlug: string): Promise<void> {
    try {
      // Don't allow deletion of system pages
      if (['home', 'about', 'menu', 'contact'].includes(pageSlug)) {
        throw new Error('Cannot delete system pages');
      }
      
      // Delete all blocks for this page
      await prisma.contentBlock.deleteMany({
        where: {
          restaurantId,
          page: pageSlug
        }
      });
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  },
  
  // Get page templates
  async getPageTemplates() {
    return [
      {
        id: 'default',
        name: 'Default Page',
        description: 'Simple page with hero section and content',
        blocks: ['hero', 'text']
      },
      {
        id: 'services',
        name: 'Services Page',
        description: 'Page with hero, features grid, and call-to-action',
        blocks: ['hero', 'features', 'cta']
      },
      {
        id: 'gallery',
        name: 'Gallery Page',
        description: 'Page with hero and image gallery',
        blocks: ['hero', 'gallery']
      },
      {
        id: 'contact',
        name: 'Contact Page',
        description: 'Page with contact information and map',
        blocks: ['hero', 'contact', 'map']
      }
    ];
  },
  
  // Helper function to format page names
  formatPageName(slug: string): string {
    return slug.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}; 