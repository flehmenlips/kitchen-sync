import { api } from './api';
import { customerApi } from './customerApi';

export interface RestaurantSettings {
  id: number;
  restaurantId: number;
  
  // Website Branding
  websiteName?: string;
  tagline?: string;
  logoUrl?: string;
  logoPublicId?: string;
  
  // Hero Section
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  heroImagePublicId?: string;
  heroCTAText?: string;
  heroCTALink?: string;
  
  // About Section
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImageUrl?: string;
  aboutImagePublicId?: string;
  
  // Theme Customization
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontPrimary?: string;
  fontSecondary?: string;
  
  // Contact Info
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactCity?: string;
  contactState?: string;
  contactZip?: string;
  
  // Opening Hours
  openingHours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  
  // Social Media
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  
  // Menu Display Settings
  activeMenuIds?: number[];
  menuDisplayMode?: string;
  
  // Footer
  footerText?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  
  // Restaurant info (included in response)
  restaurant?: {
    name: string;
    slug: string;
    description?: string;
    menus: Array<{
      id: number;
      name: string;
      title?: string;
    }>;
  };
}

export const restaurantSettingsService = {
  // Admin endpoints
  async getSettings(): Promise<RestaurantSettings> {
    const response = await api.get('/restaurant/settings');
    return response.data;
  },

  async updateSettings(settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    const response = await api.put('/restaurant/settings', settings);
    return response.data;
  },

  async uploadImage(field: 'hero' | 'about' | 'cover' | 'logo', file: File): Promise<{imageUrl: string; publicId: string; settings: RestaurantSettings}> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(`/restaurant/settings/image/${field}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get public restaurant settings (for customer portal)
  async getPublicSettings(): Promise<RestaurantSettings> {
    const response = await customerApi.get('/restaurant/public/settings');
    return response.data;
  }
}; 