import apiService from './apiService';
import { getCurrentRestaurantSlug } from '../utils/subdomain';

export interface UnifiedRestaurantContent {
  // Restaurant info
  restaurant: {
    id: number;
    name: string;
    slug: string;
    description: string;
  };
  
  // Hero section (from ContentBlocks or RestaurantSettings)
  hero: {
    title: string;
    subtitle: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  
  // About section (from ContentBlocks or RestaurantSettings)
  about: {
    title: string;
    description: string;
    imageUrl?: string;
  };
  
  // Contact info (from RestaurantSettings)
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    openingHours?: any;
  };
  
  // Branding (from RestaurantSettings)
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontPrimary?: string;
    fontSecondary?: string;
  };
  
  // Social media (from RestaurantSettings)
  social: {
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
  };
  
  // SEO (from RestaurantSettings)
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    footerText?: string;
    hoursCardTitle?: string;
    locationCardTitle?: string;
    contactCardTitle?: string;
  };
  
  // Dynamic content blocks (from ContentBlocks)
  contentBlocks: Array<{
    id: number;
    blockType: string;
    title?: string;
    subtitle?: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    buttonText?: string;
    buttonLink?: string;
    settings?: any;
    displayOrder: number;
    isActive: boolean;
  }>;
}

class UnifiedContentService {
  /**
   * Get unified restaurant content that combines:
   * - Hero/About content from ContentBlocks (Website Builder)
   * - Contact/branding/social from RestaurantSettings (for backward compatibility)
   * - Dynamic content blocks from ContentBlocks
   */
  async getUnifiedContent(pageSlug: string = 'home'): Promise<UnifiedRestaurantContent> {
    let slug = getCurrentRestaurantSlug();
    
    console.log('[UnifiedContentService] Page slug:', pageSlug);
    console.log('[UnifiedContentService] Restaurant slug:', slug);
    console.log('[UnifiedContentService] Current URL:', window.location.href);
    console.log('[UnifiedContentService] URL search params:', window.location.search);
    
    // If slug is null, try to extract it manually from URL as fallback
    if (!slug) {
      const urlParams = new URLSearchParams(window.location.search);
      slug = urlParams.get('restaurant');
      console.log('[UnifiedContentService] Fallback slug extraction:', slug);
    }
    
    if (!slug) {
      console.error('[UnifiedContentService] Restaurant slug not found after all attempts');
      console.error('[UnifiedContentService] URL:', window.location.href);
      console.error('[UnifiedContentService] Search params:', window.location.search);
      throw new Error('Restaurant slug not found');
    }
    
    // Skip the non-existent unified endpoint and go directly to fallback
    console.log('[UnifiedContentService] Using fallback content method with slug:', slug);
    return this.getFallbackContent(slug, pageSlug);
  }
  
  /**
   * Fallback method that manually combines old RestaurantSettings with any available ContentBlocks
   */
  private async getFallbackContent(slug: string, pageSlug: string): Promise<UnifiedRestaurantContent> {
    try {
      console.log('[UnifiedContentService] Fetching fallback content for:', { slug, pageSlug });
      
      // Get restaurant settings (old system)
      console.log('[UnifiedContentService] Fetching restaurant settings...');
      const settingsResponse = await apiService.get(`/restaurant/public/slug/${slug}/settings`);
      const settings = settingsResponse.data;
      console.log('[UnifiedContentService] Restaurant settings loaded');
      
      // Try to get content blocks (new system)
      let contentBlocks = [];
      try {
        console.log('[UnifiedContentService] Fetching content blocks...');
        const blocksResponse = await apiService.get(`/content-blocks/public?page=${pageSlug}&restaurantSlug=${slug}`);
        contentBlocks = blocksResponse.data || [];
        console.log('[UnifiedContentService] Content blocks loaded:', contentBlocks.length, 'blocks');
      } catch (blockError) {
        console.warn('[UnifiedContentService] Could not fetch content blocks:', blockError);
      }
      
      // Find hero and about blocks from ContentBlocks
      const heroBlock = contentBlocks.find((block: any) => block.blockType === 'hero');
      const aboutBlock = contentBlocks.find((block: any) => block.blockType === 'text' && block.title?.toLowerCase().includes('about'));
      
      const result = {
        restaurant: {
          id: settings.restaurant?.id || 1,
          name: settings.restaurant?.name || 'Restaurant',
          slug: settings.restaurant?.slug || slug,
          description: settings.restaurant?.description || settings.tagline || 'Welcome to our restaurant'
        },
        hero: {
          title: heroBlock?.title || settings.heroTitle || 'Welcome to Our Restaurant',
          subtitle: heroBlock?.subtitle || settings.heroSubtitle || 'Experience culinary excellence',
          imageUrl: heroBlock?.imageUrl || settings.heroImageUrl,
          ctaText: heroBlock?.buttonText || settings.heroCTAText,
          ctaLink: heroBlock?.buttonLink || settings.heroCTALink
        },
        about: {
          title: aboutBlock?.title || settings.aboutTitle || 'About Us',
          description: aboutBlock?.content || settings.aboutDescription || 'Welcome to our restaurant, where we serve delicious food made with love and the finest ingredients.',
          imageUrl: aboutBlock?.imageUrl || settings.aboutImageUrl
        },
        contact: {
          phone: settings.contactPhone,
          email: settings.contactEmail,
          address: settings.contactAddress,
          city: settings.contactCity,
          state: settings.contactState,
          zip: settings.contactZip,
          openingHours: settings.openingHours
        },
        branding: {
          logoUrl: settings.logoUrl,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          accentColor: settings.accentColor,
          fontPrimary: settings.fontPrimary,
          fontSecondary: settings.fontSecondary
        },
        social: {
          facebookUrl: settings.facebookUrl,
          instagramUrl: settings.instagramUrl,
          twitterUrl: settings.twitterUrl
        },
        seo: {
          metaTitle: settings.metaTitle,
          metaDescription: settings.metaDescription,
          footerText: settings.footerText,
          hoursCardTitle: settings.hoursCardTitle,
          locationCardTitle: settings.locationCardTitle,
          contactCardTitle: settings.contactCardTitle
        },
        contentBlocks: contentBlocks
      };
      
      console.log('[UnifiedContentService] Returning unified content:', {
        contentBlocksCount: result.contentBlocks.length,
        restaurantName: result.restaurant.name
      });
      
      return result;
    } catch (error) {
      console.error('[UnifiedContentService] Error in fallback content fetch:', error);
      throw error;
    }
  }
}

export const unifiedContentService = new UnifiedContentService(); 