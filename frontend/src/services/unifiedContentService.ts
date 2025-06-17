import { customerApi } from './customerApi';
import { restaurantSettingsService } from './restaurantSettingsService';
import { getCurrentRestaurantSlug } from '../utils/subdomain';

export interface UnifiedRestaurantContent {
  restaurant: {
    id: number;
    name: string;
    slug: string;
  };
  hero: {
    title: string;
    subtitle: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  about: {
    title: string;
    description: string;
    imageUrl?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    openingHours?: {
      [key: string]: {
        open: string;
        close: string;
      };
    };
  };
  pages: Array<{
    id: number;
    title: string;
    slug: string;
    description?: string;
    template?: string;
    displayOrder: number;
    isActive: boolean;
    isSystem: boolean;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  }>;
}

export const unifiedContentService = {
  async getUnifiedContent(pageSlug: string): Promise<UnifiedRestaurantContent> {
    try {
      // Use the working restaurant settings API instead of the non-existent unified-content endpoint
      const settings = await restaurantSettingsService.getPublicSettings();
      
      // Transform restaurant settings into unified content format
      const unifiedContent: UnifiedRestaurantContent = {
        restaurant: {
          id: settings.restaurant?.id || 0,
          name: settings.restaurant?.name || 'Restaurant',
          slug: settings.restaurant?.slug || 'restaurant'
        },
        hero: {
          title: settings.heroTitle || settings.websiteName || settings.restaurant?.name || 'Welcome',
          subtitle: settings.heroSubtitle || settings.tagline || 'Experience culinary excellence',
          imageUrl: settings.heroImageUrl || '',
          ctaText: settings.heroCTAText || 'Make a Reservation',
          ctaLink: settings.heroCTALink || '/reservations/new'
        },
        about: {
          title: settings.aboutTitle || 'About Us',
          description: settings.aboutDescription || 'Fresh, local ingredients meet culinary excellence',
          imageUrl: settings.aboutImageUrl || ''
        },
        contact: {
          phone: settings.contactPhone || '',
          email: settings.contactEmail || '',
          address: settings.contactAddress || '',
          city: settings.contactCity || '',
          state: settings.contactState || '',
          zip: settings.contactZip || '',
          openingHours: settings.openingHours || {}
        },
        pages: [] // TODO: Add pages when needed
      };
      
      return unifiedContent;
    } catch (error) {
      console.error('Error fetching unified content:', error);
      throw error;
    }
  }
}; 