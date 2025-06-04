import { api } from './api';

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

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  blocks: string[];
}

export const websiteBuilderService = {
  // Get all website builder data (settings + pages)
  async getWebsiteBuilderData(): Promise<WebsiteBuilderData> {
    const response = await api.get('/website-builder/data');
    return response.data;
  },

  // Update restaurant settings
  async updateSettings(settings: Partial<WebsiteBuilderData['settings']>) {
    const response = await api.put('/website-builder/settings', settings);
    return response.data;
  },

  // Create a new page
  async createPage(pageData: PageCreationData): Promise<WebsiteBuilderPage> {
    const response = await api.post('/website-builder/pages', pageData);
    return response.data;
  },

  // Delete a page
  async deletePage(pageSlug: string): Promise<void> {
    await api.delete(`/website-builder/pages/${pageSlug}`);
  },

  // Get page templates
  async getPageTemplates(): Promise<PageTemplate[]> {
    const response = await api.get('/website-builder/templates');
    return response.data;
  }
}; 