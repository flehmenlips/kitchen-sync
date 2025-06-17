import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PageCreationData {
  name: string;
  slug: string;
  content: any;
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const websiteBuilderService = {
  async getWebsiteBuilderData(restaurantId: number) {
    // Temporary implementation - return basic data to prevent crashes
    console.log('⚠️  Using minimal websiteBuilderService - restaurantId:', restaurantId);
    
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
          restaurant_settings: true,
        }
      });

      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      return {
        restaurant,
        settings: restaurant.restaurant_settings,
        pages: [], // TODO: Implement proper page management
        message: 'Using minimal implementation - website builder functionality limited'
      };
    } catch (error) {
      console.error('Error in getWebsiteBuilderData:', error);
      throw error;
    }
  },

  async updateSettings(restaurantId: number, settings: any) {
    console.log('⚠️  Using minimal websiteBuilderService updateSettings');
    
    try {
      const updatedSettings = await prisma.restaurantSettings.upsert({
        where: { restaurantId },
        update: settings,
        create: {
          restaurantId,
          ...settings
        }
      });

      return updatedSettings;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw error;
    }
  },

  async createPage(restaurantId: number, pageData: PageCreationData) {
    console.log('⚠️  Using minimal websiteBuilderService createPage');
    
    // Temporary implementation - just return the data without actually creating
    return {
      id: 'temp-' + Date.now(),
      restaurantId,
      ...pageData,
      createdAt: new Date(),
      updatedAt: new Date(),
      message: 'Page creation temporarily disabled - using minimal implementation'
    };
  },

  async updatePage(restaurantId: number, slug: string, pageData: Partial<PageCreationData>) {
    console.log('⚠️  Using minimal websiteBuilderService updatePage');
    
    // Temporary implementation
    return {
      id: 'temp-' + Date.now(),
      restaurantId,
      slug,
      ...pageData,
      updatedAt: new Date(),
      message: 'Page update temporarily disabled - using minimal implementation'
    };
  },

  async deletePage(restaurantId: number, slug: string) {
    console.log('⚠️  Using minimal websiteBuilderService deletePage');
    
    // Temporary implementation - just log
    console.log(`Page deletion requested for slug: ${slug} in restaurant: ${restaurantId}`);
    return { message: 'Page deletion temporarily disabled - using minimal implementation' };
  },

  async getPageTemplates() {
    console.log('⚠️  Using minimal websiteBuilderService getPageTemplates');
    
    // Return basic templates
    return [
      {
        id: 'basic',
        name: 'Basic Page',
        description: 'Simple page template',
        isDefault: true
      },
      {
        id: 'menu',
        name: 'Menu Page',
        description: 'Template for menu pages',
        isDefault: false
      }
    ];
  }
};

export default websiteBuilderService; 