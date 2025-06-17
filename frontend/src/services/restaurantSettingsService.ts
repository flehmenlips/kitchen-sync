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
    const response = await apiService.get<RestaurantSettings>('/restaurant-settings/settings');
    return response.data;
  }

  async updateSettings(settings: RestaurantSettings): Promise<RestaurantSettings> {
    const response = await apiService.put<RestaurantSettings>('/restaurant-settings/settings', settings);
    return response.data;
  }

  async uploadImage(field: 'hero' | 'about' | 'cover' | 'logo', file: File): Promise<{ imageUrl: string; settings: RestaurantSettings }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiService.post<{ imageUrl: string; settings: RestaurantSettings }>(
      `/restaurant-settings/settings/image/${field}`,
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
      const response = await apiService.get<RestaurantSettings>(`/restaurant-settings/public/slug/${slug}/settings`);
      return response.data;
    } else if (restaurantId) {
      // Fall back to ID-based endpoint
      const response = await apiService.get<RestaurantSettings>(`/restaurant-settings/public/settings?restaurantId=${restaurantId}`);
      return response.data;
    } else {
      // Default to restaurant ID 1 for backward compatibility
      const response = await apiService.get<RestaurantSettings>('/restaurant-settings/public/settings');
      return response.data;
    }
  }

  async addPageToNavigation(pageSlug: string, navigationLabel: string, navigationIcon: string): Promise<RestaurantSettings> {
    // Get current settings
    const currentSettings = await this.getSettings();
    
    // Create new navigation item
    const newNavItem: NavigationItem = {
      id: `page-${pageSlug}`,
      label: navigationLabel,
      path: `/${pageSlug}`,
      icon: navigationIcon,
      isActive: true,
      displayOrder: (currentSettings.navigationItems?.length || 0) + 1,
      isSystem: false
    };

    // Add to existing navigation items
    const updatedNavigationItems = [
      ...(currentSettings.navigationItems || []),
      newNavItem
    ];

    // Update settings with new navigation
    return await this.updateSettings({
      ...currentSettings,
      navigationItems: updatedNavigationItems,
      navigationEnabled: true // Ensure navigation is enabled
    });
  }

  async updatePageInNavigation(pageSlug: string, navigationLabel: string, navigationIcon: string): Promise<RestaurantSettings> {
    // Get current settings
    const currentSettings = await this.getSettings();
    const navigationItems = currentSettings.navigationItems || [];
    
    // Find the navigation item for this page
    const existingItemIndex = navigationItems.findIndex(item => item.id === `page-${pageSlug}`);
    
    if (existingItemIndex >= 0) {
      // Update existing navigation item
      const updatedNavigationItems = [...navigationItems];
      updatedNavigationItems[existingItemIndex] = {
        ...updatedNavigationItems[existingItemIndex],
        label: navigationLabel,
        icon: navigationIcon,
        path: `/${pageSlug}` // In case slug changed
      };

      return await this.updateSettings({
        ...currentSettings,
        navigationItems: updatedNavigationItems
      });
    } else {
      // Add new navigation item if it doesn't exist
      return await this.addPageToNavigation(pageSlug, navigationLabel, navigationIcon);
    }
  }

  async removePageFromNavigation(pageSlug: string): Promise<RestaurantSettings> {
    // Get current settings
    const currentSettings = await this.getSettings();
    const navigationItems = currentSettings.navigationItems || [];
    
    // Remove the navigation item for this page
    const updatedNavigationItems = navigationItems.filter(item => item.id !== `page-${pageSlug}`);

    return await this.updateSettings({
      ...currentSettings,
      navigationItems: updatedNavigationItems
    });
  }

  isPageInNavigation(pageSlug: string, settings: RestaurantSettings): boolean {
    const navigationItems = settings.navigationItems || [];
    return navigationItems.some(item => item.id === `page-${pageSlug}`);
  }
}

export const restaurantSettingsService = new RestaurantSettingsService(); 