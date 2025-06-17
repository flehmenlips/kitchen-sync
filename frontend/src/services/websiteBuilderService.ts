import { api } from './api';

export interface WebsiteBuilderData {
  // Site-wide settings from RestaurantSettings
  settings: {
    // Basic Info
    websiteName?: string;
    tagline?: string;
    
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
    
    // Branding
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
  };
  
  // Pages
  pages: WBPage[];
}

export interface WBPage {
  id: number;
  name: string;
  slug: string;
  title: string;
  description?: string;
  template: string;
  displayOrder: number;
  isActive: boolean;
  isSystem: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PageCreationData {
  name: string;
  slug: string;
  title: string;
  description?: string;
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

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

export const websiteBuilderService = {
  // Get unified website builder data
  async getWebsiteBuilderData(): Promise<WebsiteBuilderData> {
    const response = await api.get('/website-builder/data');
    return response.data;
  },

  // Update website settings
  async updateSettings(settings: Partial<WebsiteBuilderData['settings']>) {
    const response = await api.put('/website-builder/settings', settings);
    return response.data;
  },

  // Create new page
  async createPage(pageData: PageCreationData): Promise<WBPage> {
    const response = await api.post('/website-builder/pages', pageData);
    return response.data;
  },

  // Update page metadata
  async updatePage(slug: string, pageData: Partial<PageCreationData>): Promise<WBPage> {
    const response = await api.put(`/website-builder/pages/${slug}`, pageData);
    return response.data;
  },

  // Delete page
  async deletePage(slug: string): Promise<void> {
    await api.delete(`/website-builder/pages/${slug}`);
  },

  // Get page templates
  async getPageTemplates(): Promise<PageTemplate[]> {
    const response = await api.get('/website-builder/templates');
    return response.data;
  }
}; 