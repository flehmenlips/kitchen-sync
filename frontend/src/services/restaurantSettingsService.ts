import apiService from './apiService';
import { getCurrentRestaurantSlug } from '../utils/subdomain';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
  isSystem: boolean; // true for Home, Menu, Reservations
  subItems?: NavigationSubItem[];
}

export interface NavigationSubItem {
  id: string;
  label: string;
  path: string;
  isActive: boolean;
  displayOrder: number;
}

export interface RestaurantSettings {
  id?: number;
  restaurantId?: number;
  
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
  openingHours?: any;
  
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
  
  // Info Panes Customization
  infoPanesEnabled?: boolean;
  hoursCardTitle?: string;
  locationCardTitle?: string;
  contactCardTitle?: string;
  hoursCardShowDetails?: boolean;
  locationCardShowDirections?: boolean;
  
  // Navigation Customization
  navigationEnabled?: boolean;
  navigationLayout?: 'topbar' | 'sidebar' | 'hybrid';
  navigationAlignment?: 'left' | 'center' | 'right' | 'justified';
  navigationStyle?: 'minimal' | 'modern' | 'classic' | 'rounded';
  navigationItems?: NavigationItem[];
  showMobileMenu?: boolean;
  mobileMenuStyle?: 'hamburger' | 'dots' | 'slide';
  
  // Reservation settings (from ReservationSettings table)
  reservationSettings?: {
    minPartySize?: number;
    maxPartySize?: number;
    maxCoversPerDay?: number;
  };
  
  // Restaurant info (included in response)
  restaurant?: {
    id?: number;
    name: string;
    slug: string;
    description: string;
    menus?: Array<{
      id: number;
      name: string;
      title?: string;
    }>;
  };
  _count?: {
    menus?: number;
  };
}

class RestaurantSettingsService {
  async getSettings(): Promise<RestaurantSettings> {
    const response = await apiService.get<RestaurantSettings>('/restaurant/settings');
    return response.data;
  }

  async updateSettings(settings: RestaurantSettings): Promise<RestaurantSettings> {
    const response = await apiService.put<RestaurantSettings>('/restaurant/settings', settings);
    return response.data;
  }

  async uploadImage(field: 'hero' | 'about' | 'cover' | 'logo', file: File): Promise<{ imageUrl: string; settings: RestaurantSettings }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiService.post<{ imageUrl: string; settings: RestaurantSettings }>(
      `/restaurant/settings/image/${field}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getPublicSettings(restaurantId?: number): Promise<RestaurantSettings> {
    // Check for restaurant slug from subdomain
    const slug = getCurrentRestaurantSlug();
    
    if (slug) {
      // Use slug-based endpoint
      const response = await apiService.get<RestaurantSettings>(`/restaurant/public/slug/${slug}/settings`);
      return response.data;
    } else if (restaurantId) {
      // Fall back to ID-based endpoint
      const response = await apiService.get<RestaurantSettings>(`/restaurant/public/settings?restaurantId=${restaurantId}`);
      return response.data;
    } else {
      // CRITICAL FIX: Never default to restaurant ID 1 - fail if no slug or ID provided
      // This prevents data leakage between restaurants
      throw new Error('Restaurant slug or ID is required. Unable to determine restaurant from subdomain.');
    }
  }
}

export const restaurantSettingsService = new RestaurantSettingsService(); 