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
  
  // Pages from ContentBlocks
  pages: WBPage[];
}

export interface WBPage {
  id: string; // Virtual ID for new pages, 'home'/'about' for system pages
  name: string;
  slug: string;
  url: string;
  isSystem: boolean; // true for home/about, false for custom pages
  isActive: boolean;
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  blocks: WBBlock[];
}

export interface WBBlock {
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
  styles?: {
    backgroundColor?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderColor?: string;
    borderRadius?: string;
    boxShadow?: string;
    padding?: string;
    margin?: string;
  };
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

export interface BlockCreationData {
  blockType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: string;
  settings?: any;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  blocks: string[];
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

  // Update content block
  async updateContentBlock(pageSlug: string, blockId: number, blockData: Partial<WBBlock>): Promise<WBBlock> {
    const response = await api.put(`/website-builder/pages/${pageSlug}/blocks/${blockId}`, blockData);
    return response.data;
  },

  // Create new content block
  async createContentBlock(pageSlug: string, blockData: BlockCreationData): Promise<WBBlock> {
    const response = await api.post(`/website-builder/pages/${pageSlug}/blocks`, blockData);
    return response.data;
  },

  // Delete content block
  async deleteContentBlock(pageSlug: string, blockId: number): Promise<void> {
    await api.delete(`/website-builder/pages/${pageSlug}/blocks/${blockId}`);
  },

  // Reorder content blocks
  async reorderContentBlocks(pageSlug: string, blockOrder: number[]): Promise<void> {
    await api.put(`/website-builder/pages/${pageSlug}/blocks/reorder`, { blockOrder });
  },

  // Get page templates
  async getPageTemplates(): Promise<PageTemplate[]> {
    const response = await api.get('/website-builder/templates');
    return response.data;
  }
}; 