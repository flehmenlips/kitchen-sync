import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WebsiteBuilderData {
  // Site-wide settings from RestaurantSettings
  settings: {
    // Basic Info
    websiteName?: string;
    tagline?: string;
    
    // Branding
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontPrimary?: string;
    fontSecondary?: string;
    logoUrl?: string;
    logoPublicId?: string;
    
    // Contact & Hours (site-wide defaults, content blocks take precedence)
    contactPhone?: string;
    contactEmail?: string;
    contactAddress?: string;
    contactCity?: string;
    contactState?: string;
    contactZip?: string;
    openingHours?: any;
    
    // Reservation Integration
    reservationSettings?: {
      enabled: boolean;
      minPartySize?: number;
      maxPartySize?: number;
      advanceBookingDays?: number;
      minAdvanceHours?: number;
      cancellationPolicy?: string;
      requireCreditCard?: boolean;
      requireDeposit?: boolean;
      depositAmount?: number;
    };
    
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
  styles?: any;
  displayOrder: number;
  isActive: boolean;
}

// Enhanced content block types for unified system
export interface ContentBlockSchema {
  type: string;
  name: string;
  description: string;
  fields: ContentBlockField[];
  category: 'layout' | 'content' | 'media' | 'interactive' | 'system';
  icon: string;
}

export interface ContentBlockField {
  name: string;
  type: 'text' | 'textarea' | 'image' | 'url' | 'select' | 'color' | 'number' | 'boolean';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  maxLength?: number;
}

// Predefined content block schemas for the unified system
export const CONTENT_BLOCK_SCHEMAS: ContentBlockSchema[] = [
  {
    type: 'hero',
    name: 'Hero Section',
    description: 'Large banner with title, subtitle, image, and call-to-action',
    category: 'layout',
    icon: 'wallpaper',
    fields: [
      { name: 'title', type: 'text', label: 'Hero Title', required: true, maxLength: 100 },
      { name: 'subtitle', type: 'textarea', label: 'Hero Subtitle', maxLength: 200 },
      { name: 'imageUrl', type: 'image', label: 'Background Image' },
      { name: 'buttonText', type: 'text', label: 'Button Text', maxLength: 30 },
      { name: 'buttonLink', type: 'url', label: 'Button Link' },
      { name: 'buttonStyle', type: 'select', label: 'Button Style', options: ['primary', 'secondary', 'outline'] }
    ]
  },
  {
    type: 'about',
    name: 'About Section',
    description: 'Rich content section with title, description, and optional image',
    category: 'content',
    icon: 'info',
    fields: [
      { name: 'title', type: 'text', label: 'Section Title', required: true, maxLength: 100 },
      { name: 'content', type: 'textarea', label: 'Description', required: true, maxLength: 1000 },
      { name: 'imageUrl', type: 'image', label: 'Section Image' }
    ]
  },
  {
    type: 'contact',
    name: 'Contact Information',
    description: 'Contact details with phone, email, address, and hours',
    category: 'content',
    icon: 'contact_page',
    fields: [
      { name: 'title', type: 'text', label: 'Section Title', required: true, maxLength: 100 },
      { name: 'phone', type: 'text', label: 'Phone Number' },
      { name: 'email', type: 'text', label: 'Email Address' },
      { name: 'address', type: 'textarea', label: 'Full Address' },
      { name: 'showHours', type: 'boolean', label: 'Show Opening Hours' },
      { name: 'showMap', type: 'boolean', label: 'Show Map/Directions' }
    ]
  },
  {
    type: 'hours',
    name: 'Opening Hours',
    description: 'Restaurant opening hours display',
    category: 'content',
    icon: 'schedule',
    fields: [
      { name: 'title', type: 'text', label: 'Section Title', required: true, maxLength: 100 },
      { name: 'showToday', type: 'boolean', label: 'Highlight Today' },
      { name: 'showAllDays', type: 'boolean', label: 'Show All Days' }
    ]
  },
  {
    type: 'text',
    name: 'Text Block',
    description: 'Simple text content with formatting',
    category: 'content',
    icon: 'text_fields',
    fields: [
      { name: 'title', type: 'text', label: 'Title', maxLength: 100 },
      { name: 'content', type: 'textarea', label: 'Content', required: true, maxLength: 2000 }
    ]
  },
  {
    type: 'image',
    name: 'Image Block',
    description: 'Image with optional caption',
    category: 'media',
    icon: 'image',
    fields: [
      { name: 'imageUrl', type: 'image', label: 'Image', required: true },
      { name: 'title', type: 'text', label: 'Caption', maxLength: 200 },
      { name: 'alt', type: 'text', label: 'Alt Text', maxLength: 150 }
    ]
  },
  {
    type: 'button',
    name: 'Call-to-Action Button',
    description: 'Prominent button with link',
    category: 'interactive',
    icon: 'smart_button',
    fields: [
      { name: 'buttonText', type: 'text', label: 'Button Text', required: true, maxLength: 30 },
      { name: 'buttonLink', type: 'url', label: 'Button Link', required: true },
      { name: 'buttonStyle', type: 'select', label: 'Button Style', options: ['primary', 'secondary', 'outline'] }
    ]
  },
  {
    type: 'gallery',
    name: 'Image Gallery',
    description: 'Multiple images in a grid layout',
    category: 'media',
    icon: 'photo_library',
    fields: [
      { name: 'title', type: 'text', label: 'Gallery Title', maxLength: 100 },
      { name: 'columns', type: 'select', label: 'Columns', options: ['1', '2', '3', '4'] }
    ]
  },
  {
    type: 'features',
    name: 'Features Grid',
    description: 'Grid of features or services',
    category: 'layout',
    icon: 'grid_view',
    fields: [
      { name: 'title', type: 'text', label: 'Section Title', maxLength: 100 },
      { name: 'columns', type: 'select', label: 'Columns', options: ['2', '3', '4'] }
    ]
  },
  // NEW ENHANCED CONTENT BLOCKS
  {
    type: 'video',
    name: 'Video Block',
    description: 'Embed videos from YouTube, Vimeo, or upload directly',
    category: 'media',
    icon: 'play_circle',
    fields: [
      { name: 'title', type: 'text', label: 'Video Title', maxLength: 100 },
      { name: 'videoUrl', type: 'url', label: 'Video URL (YouTube/Vimeo)', required: true },
      { name: 'autoplay', type: 'boolean', label: 'Autoplay Video' },
      { name: 'controls', type: 'boolean', label: 'Show Controls' },
      { name: 'aspectRatio', type: 'select', label: 'Aspect Ratio', options: ['16:9', '4:3', '1:1', 'auto'] }
    ]
  },
  {
    type: 'menu_display',
    name: 'Menu Display',
    description: 'Dynamic restaurant menu with categories and items',
    category: 'interactive',
    icon: 'restaurant_menu',
    fields: [
      { name: 'title', type: 'text', label: 'Menu Title', maxLength: 100 },
      { name: 'layout', type: 'select', label: 'Layout Style', options: ['grid', 'list', 'cards', 'minimal'] },
      { name: 'showPrices', type: 'boolean', label: 'Show Prices' },
      { name: 'showDescriptions', type: 'boolean', label: 'Show Descriptions' },
      { name: 'showImages', type: 'boolean', label: 'Show Item Images' },
      { name: 'maxItems', type: 'number', label: 'Max Items to Show' }
    ]
  },
  {
    type: 'testimonials',
    name: 'Customer Testimonials',
    description: 'Display customer reviews and testimonials',
    category: 'content',
    icon: 'rate_review',
    fields: [
      { name: 'title', type: 'text', label: 'Section Title', maxLength: 100 },
      { name: 'layout', type: 'select', label: 'Layout', options: ['carousel', 'grid', 'list'] },
      { name: 'showStars', type: 'boolean', label: 'Show Star Ratings' },
      { name: 'showPhotos', type: 'boolean', label: 'Show Customer Photos' },
      { name: 'autoRotate', type: 'boolean', label: 'Auto-rotate Testimonials' }
    ]
  },
  {
    type: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Email capture form with marketing consent',
    category: 'interactive',
    icon: 'email',
    fields: [
      { name: 'title', type: 'text', label: 'Form Title', required: true, maxLength: 100 },
      { name: 'subtitle', type: 'textarea', label: 'Description', maxLength: 200 },
      { name: 'buttonText', type: 'text', label: 'Button Text', maxLength: 30 },
      { name: 'placeholder', type: 'text', label: 'Email Placeholder', maxLength: 50 },
      { name: 'consentText', type: 'textarea', label: 'Privacy Consent Text', maxLength: 300 }
    ]
  },
  {
    type: 'map_location',
    name: 'Location & Map',
    description: 'Interactive map with business location and directions',
    category: 'interactive',
    icon: 'map',
    fields: [
      { name: 'title', type: 'text', label: 'Section Title', maxLength: 100 },
      { name: 'address', type: 'textarea', label: 'Full Address', required: true },
      { name: 'mapHeight', type: 'select', label: 'Map Height', options: ['300', '400', '500', '600'] },
      { name: 'showDirections', type: 'boolean', label: 'Show Directions Button' },
      { name: 'mapStyle', type: 'select', label: 'Map Style', options: ['roadmap', 'satellite', 'hybrid', 'terrain'] }
    ]
  },
  {
    type: 'social_feed',
    name: 'Social Media Feed',
    description: 'Display Instagram or Facebook posts',
    category: 'media',
    icon: 'share',
    fields: [
      { name: 'title', type: 'text', label: 'Feed Title', maxLength: 100 },
      { name: 'platform', type: 'select', label: 'Platform', options: ['instagram', 'facebook', 'twitter'], required: true },
      { name: 'username', type: 'text', label: 'Username/Handle', required: true, maxLength: 50 },
      { name: 'postCount', type: 'number', label: 'Number of Posts' },
      { name: 'layout', type: 'select', label: 'Layout', options: ['grid', 'list', 'carousel'] }
    ]
  },
  {
    type: 'reservation_widget',
    name: 'Reservation Widget',
    description: 'Embedded table booking form',
    category: 'interactive',
    icon: 'event_seat',
    fields: [
      { name: 'title', type: 'text', label: 'Widget Title', maxLength: 100 },
      { name: 'subtitle', type: 'textarea', label: 'Description', maxLength: 200 },
      { name: 'theme', type: 'select', label: 'Theme', options: ['light', 'dark', 'accent'] },
      { name: 'showAvailability', type: 'boolean', label: 'Show Real-time Availability' },
      { name: 'defaultPartySize', type: 'number', label: 'Default Party Size' }
    ]
  },
  {
    type: 'spacer',
    name: 'Spacer/Divider',
    description: 'Add spacing or visual dividers between sections',
    category: 'layout',
    icon: 'horizontal_rule',
    fields: [
      { name: 'height', type: 'select', label: 'Spacing Height', options: ['small', 'medium', 'large', 'extra-large'] },
      { name: 'showDivider', type: 'boolean', label: 'Show Divider Line' },
      { name: 'dividerStyle', type: 'select', label: 'Divider Style', options: ['solid', 'dashed', 'dotted', 'gradient'] }
    ]
  },
  {
    type: 'pricing_menu',
    name: 'Pricing Menu',
    description: 'Display services or items with pricing',
    category: 'interactive',
    icon: 'receipt_long',
    fields: [
      { name: 'title', type: 'text', label: 'Menu Title', maxLength: 100 },
      { name: 'layout', type: 'select', label: 'Layout', options: ['table', 'cards', 'list'] },
      { name: 'currency', type: 'text', label: 'Currency Symbol', maxLength: 5 },
      { name: 'showImages', type: 'boolean', label: 'Show Item Images' },
      { name: 'allowSorting', type: 'boolean', label: 'Allow Price Sorting' }
    ]
  }
];

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
  // Get all website builder data (settings + pages)
  async getWebsiteBuilderData(restaurantId?: number): Promise<WebsiteBuilderData> {
    try {
      // Get restaurant settings
      const settings = await this.getRestaurantSettings(restaurantId);
      
      // Get reservation settings for operating hours and reservation integration
      let reservationSettings = null;
      let operatingHours = null;
      if (restaurantId) {
        try {
          reservationSettings = await prisma.reservationSettings.findUnique({
            where: { restaurantId },
            select: {
              operatingHours: true,
              minPartySize: true,
              maxPartySize: true,
              advanceBookingDays: true,
              minAdvanceHours: true,
              cancellationPolicy: true,
              requireCreditCard: true,
              requireDeposit: true,
              depositAmount: true
            }
          });
          
          // Use reservation operating hours if available (more accurate for reservations)
          if (reservationSettings?.operatingHours) {
            operatingHours = this.parseOpeningHours(reservationSettings.operatingHours);
          }
        } catch (error) {
          console.warn('Could not fetch reservation settings for website builder:', error);
        }
      }
      
      // Fall back to RestaurantSettings opening hours if reservation settings don't have them
      if (!operatingHours && settings?.openingHours) {
        operatingHours = this.parseOpeningHours(settings.openingHours);
      }
      
      // Get restaurant basic info to sync contact information
      let restaurantInfo = null;
      if (restaurantId) {
        try {
          restaurantInfo = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: {
              name: true,
              phone: true,
              email: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              country: true,
              website: true
            }
          });
        } catch (error) {
          console.warn('Could not fetch restaurant info for website builder:', error);
        }
      }
      
      // Get pages from ContentBlocks
      const pages = await this.getPages(restaurantId);
      
      return {
        settings: settings ? {
          // Basic Info (site-wide configuration only)
          websiteName: settings.websiteName || restaurantInfo?.name || undefined,
          tagline: settings.tagline || undefined,
          
          // Branding (keep - site-wide configuration)
          primaryColor: settings.primaryColor || undefined,
          secondaryColor: settings.secondaryColor || undefined,
          accentColor: settings.accentColor || undefined,
          fontPrimary: settings.fontPrimary || undefined,
          fontSecondary: settings.fontSecondary || undefined,
          logoUrl: settings.logoUrl || undefined,
          logoPublicId: settings.logoPublicId || undefined,
          
          // Contact & Hours - prioritize Restaurant model, then RestaurantSettings, sync with ReservationSettings
          contactPhone: settings.contactPhone || restaurantInfo?.phone || undefined,
          contactEmail: settings.contactEmail || restaurantInfo?.email || undefined,
          contactAddress: settings.contactAddress || restaurantInfo?.address || undefined,
          contactCity: settings.contactCity || restaurantInfo?.city || undefined,
          contactState: settings.contactState || restaurantInfo?.state || undefined,
          contactZip: settings.contactZip || restaurantInfo?.zipCode || undefined,
          openingHours: operatingHours,
          
          // Reservation integration data
          reservationSettings: reservationSettings ? {
            enabled: true,
            minPartySize: reservationSettings.minPartySize,
            maxPartySize: reservationSettings.maxPartySize,
            advanceBookingDays: reservationSettings.advanceBookingDays,
            minAdvanceHours: reservationSettings.minAdvanceHours,
            cancellationPolicy: reservationSettings.cancellationPolicy || undefined,
            requireCreditCard: reservationSettings.requireCreditCard,
            requireDeposit: reservationSettings.requireDeposit,
            depositAmount: reservationSettings.depositAmount ? Number(reservationSettings.depositAmount) : undefined
          } : undefined,
          
          // Menu Display
          menuDisplayMode: settings.menuDisplayMode || undefined,
          activeMenuIds: settings.activeMenuIds || undefined,
          
          // Social & Footer (keep - site-wide configuration)
          facebookUrl: settings.facebookUrl || undefined,
          instagramUrl: settings.instagramUrl || undefined,
          twitterUrl: settings.twitterUrl || undefined,
          footerText: settings.footerText || undefined,
          
          // SEO (keep - site-wide defaults)
          metaTitle: settings.metaTitle || undefined,
          metaDescription: settings.metaDescription || undefined,
          metaKeywords: settings.metaKeywords || undefined,
          
          // Info Panes Customization (keep - UI configuration)
          infoPanesEnabled: (settings as any).infoPanesEnabled ?? true,
          hoursCardTitle: (settings as any).hoursCardTitle || 'Opening Hours',
          locationCardTitle: (settings as any).locationCardTitle || 'Our Location', 
          contactCardTitle: (settings as any).contactCardTitle || 'Contact Us',
          hoursCardShowDetails: (settings as any).hoursCardShowDetails ?? true,
          locationCardShowDirections: (settings as any).locationCardShowDirections ?? true,
          
          // Navigation Customization (keep - UI configuration)
          navigationEnabled: (settings as any).navigationEnabled ?? true,
          navigationLayout: (settings as any).navigationLayout || 'topbar',
          navigationAlignment: (settings as any).navigationAlignment || 'left',
          navigationStyle: (settings as any).navigationStyle || 'modern',
          showMobileMenu: (settings as any).showMobileMenu ?? true,
          mobileMenuStyle: (settings as any).mobileMenuStyle || 'hamburger',
          navigationItems: this.parseNavigationItems((settings as any).navigationItems) || [
            {
              id: 'home',
              label: 'Home',
              path: '/',
              icon: 'home',
              isActive: true,
              displayOrder: 1,
              isSystem: true
            },
            {
              id: 'menu',
              label: 'Menu',
              path: '/menu',
              icon: 'menu_book',
              isActive: true,
              displayOrder: 2,
              isSystem: true
            },
            {
              id: 'reservations',
              label: 'Make Reservation',
              path: '/reservations/new',
              icon: 'event_seat',
              isActive: reservationSettings ? true : false, // Only show if reservations are configured
              displayOrder: 3,
              isSystem: true
            }
          ]
        } : {},
        pages
      };
    } catch (error) {
      console.error('Error in getWebsiteBuilderData:', error);
      throw error;
    }
  },
  
  // Get restaurant settings
  async getRestaurantSettings(restaurantId?: number) {
    try {
      // First try to find settings for the specific restaurant
      // Using selective fields to avoid database schema issues
      let settings = await prisma.restaurantSettings.findUnique({
        where: { restaurantId: restaurantId || 1 },
        select: {
          id: true,
          restaurantId: true,
          createdAt: true,
          updatedAt: true,
          customCss: true,
          websiteName: true,
          metaTitle: true,
          metaDescription: true,
          heroTitle: true,
          heroSubtitle: true,
          heroImageUrl: true,
          heroImagePublicId: true,
          heroCTAText: true,
          heroCTALink: true,
          aboutTitle: true,
          aboutDescription: true,
          aboutImageUrl: true,
          aboutImagePublicId: true,
          logoUrl: true,
          logoPublicId: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          fontPrimary: true,
          fontSecondary: true,
          contactPhone: true,
          contactEmail: true,
          contactAddress: true,
          contactCity: true,
          contactState: true,
          contactZip: true,
          openingHours: true,
          facebookUrl: true,
          instagramUrl: true,
          twitterUrl: true,
          linkedinUrl: true,
          footerText: true,
          activeMenuIds: true,
          menuDisplayMode: true,
          tagline: true,
          metaKeywords: true
        }
      });
      
      // If no settings found for this restaurant, try to find any settings record
      // This handles cases where settings exist but aren't properly associated with restaurant ID
      if (!settings) {
        console.log(`No settings found for restaurant ${restaurantId}, looking for any settings record...`);
        settings = await prisma.restaurantSettings.findFirst({
          orderBy: { id: 'desc' }, // Get the most recent settings
          select: {
            id: true,
            restaurantId: true,
            createdAt: true,
            updatedAt: true,
            templateId: true,
            customCss: true,
            websiteName: true,
            metaTitle: true,
            metaDescription: true,
            heroTitle: true,
            heroSubtitle: true,
            heroImageUrl: true,
            heroImagePublicId: true,
            heroCTAText: true,
            heroCTALink: true,
            aboutTitle: true,
            aboutDescription: true,
            aboutImageUrl: true,
            aboutImagePublicId: true,
            logoUrl: true,
            logoPublicId: true,
            primaryColor: true,
            secondaryColor: true,
            accentColor: true,
            fontPrimary: true,
            fontSecondary: true,
            contactPhone: true,
            contactEmail: true,
            contactAddress: true,
            contactCity: true,
            contactState: true,
            contactZip: true,
            openingHours: true,
            facebookUrl: true,
            instagramUrl: true,
            twitterUrl: true,
            linkedinUrl: true,
            footerText: true,
            activeMenuIds: true,
            menuDisplayMode: true,
            tagline: true,
            metaKeywords: true
          }
        });
        
        if (settings) {
          console.log(`Found settings record with ID ${settings.id}, using it for restaurant ${restaurantId}`);
        }
      }
      
      return settings;
    } catch (error) {
      console.error('Error getting restaurant settings:', error);
      // Return empty settings object to allow the rest of getWebsiteBuilderData to continue
      // This prevents the entire function from failing when restaurant settings have schema issues
      return {
        id: 0,
        restaurantId: restaurantId || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        templateId: null,
        customCss: null,
        websiteName: null,
        metaTitle: null,
        metaDescription: null,
        heroTitle: null,
        heroSubtitle: null,
        heroImageUrl: null,
        heroImagePublicId: null,
        heroCTAText: null,
        heroCTALink: null,
        aboutTitle: null,
        aboutDescription: null,
        aboutImageUrl: null,
        aboutImagePublicId: null,
        logoUrl: null,
        logoPublicId: null,
        primaryColor: "#1976d2",
        secondaryColor: "#dc004e",
        accentColor: "#333333",
        fontPrimary: "Roboto, sans-serif",
        fontSecondary: "Playfair Display, serif",
        contactPhone: null,
        contactEmail: null,
        contactAddress: null,
        contactCity: null,
        contactState: null,
        contactZip: null,
        openingHours: {},
        facebookUrl: null,
        instagramUrl: null,
        twitterUrl: null,
        linkedinUrl: null,
        footerText: null,
        activeMenuIds: [],
        menuDisplayMode: "grid",
        tagline: null,
        metaKeywords: null,
        // Info Panes Customization
        infoPanesEnabled: true,
        hoursCardTitle: null,
        locationCardTitle: null,
        contactCardTitle: null,
        hoursCardShowDetails: true,
        locationCardShowDirections: true,
        // Navigation Customization
        navigationEnabled: true,
        navigationLayout: null,
        navigationAlignment: null,
        navigationStyle: null,
        navigationItems: null,
        showMobileMenu: true,
        mobileMenuStyle: null
      };
    }
  },
  
  // Update restaurant settings
  async updateSettings(restaurantId: number | undefined, settings: Partial<WebsiteBuilderData['settings']>) {
    try {
      // Filter out fields that don't exist in the current database schema
      // ONLY include fields that exist in PRODUCTION database (from getRestaurantSettings select query)
      const allowedFields = {
        // Basic Info
        websiteName: settings.websiteName,
        tagline: settings.tagline,
        
        // Branding
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        fontPrimary: settings.fontPrimary,
        fontSecondary: settings.fontSecondary,
        logoUrl: settings.logoUrl,
        logoPublicId: settings.logoPublicId,
        
        // Contact & Hours
        contactPhone: settings.contactPhone,
        contactEmail: settings.contactEmail,
        contactAddress: settings.contactAddress,
        contactCity: settings.contactCity,
        contactState: settings.contactState,
        contactZip: settings.contactZip,
        
        // Social & Footer - FIXED: Use linkedinUrl instead of twitterUrl
        facebookUrl: settings.facebookUrl,
        instagramUrl: settings.instagramUrl,
        linkedinUrl: settings.twitterUrl, // Map twitterUrl to linkedinUrl field that exists in DB
        footerText: settings.footerText,
        
        // Menu Display
        menuDisplayMode: settings.menuDisplayMode,
        
        // SEO
        metaTitle: settings.metaTitle,
        metaDescription: settings.metaDescription,
        metaKeywords: settings.metaKeywords,
        
        // Info Panes Customization (now that we're adding DB columns)
        infoPanesEnabled: settings.infoPanesEnabled,
        hoursCardTitle: settings.hoursCardTitle,
        locationCardTitle: settings.locationCardTitle,
        contactCardTitle: settings.contactCardTitle,
        hoursCardShowDetails: settings.hoursCardShowDetails,
        locationCardShowDirections: settings.locationCardShowDirections,
        
        // Navigation Customization (now that we're adding DB columns)
        navigationEnabled: settings.navigationEnabled,
        navigationLayout: settings.navigationLayout,
        navigationAlignment: settings.navigationAlignment,
        navigationStyle: settings.navigationStyle,
        showMobileMenu: settings.showMobileMenu,
        mobileMenuStyle: settings.mobileMenuStyle
      };
      
      // Remove undefined fields to avoid setting them to null
      const filteredSettings: any = {};
      Object.entries(allowedFields).forEach(([key, value]) => {
        if (value !== undefined) {
          filteredSettings[key] = value;
        }
      });
      
      // Handle special JSON fields - activeMenuIds should be an array, not a string
      if (settings.activeMenuIds !== undefined) {
        if (Array.isArray(settings.activeMenuIds)) {
          filteredSettings.activeMenuIds = settings.activeMenuIds; // Keep as array
        } else if (typeof settings.activeMenuIds === 'string') {
          try {
            filteredSettings.activeMenuIds = JSON.parse(settings.activeMenuIds); // Parse string to array
          } catch (e) {
            console.warn('Could not parse activeMenuIds string:', settings.activeMenuIds);
            filteredSettings.activeMenuIds = []; // Default to empty array
          }
        } else {
          filteredSettings.activeMenuIds = settings.activeMenuIds;
        }
      }
      
      // Handle openingHours - this should be stored as JSON string
      if (settings.openingHours !== undefined) {
        filteredSettings.openingHours = typeof settings.openingHours === 'object'
          ? JSON.stringify(settings.openingHours)
          : settings.openingHours;
      }
      
      // Handle navigationItems - this should be stored as JSON
      if (settings.navigationItems !== undefined) {
        filteredSettings.navigationItems = Array.isArray(settings.navigationItems)
          ? JSON.stringify(settings.navigationItems)
          : settings.navigationItems;
      }
      
      console.log('Updating restaurant settings with filtered data:', {
        restaurantId: restaurantId || 1,
        fieldCount: Object.keys(filteredSettings).length,
        fields: Object.keys(filteredSettings),
        sampleData: Object.keys(filteredSettings).slice(0, 3).reduce((acc, key) => {
          acc[key] = filteredSettings[key];
          return acc;
        }, {} as any)
      });
      
      const result = await prisma.restaurantSettings.upsert({
        where: { restaurantId: restaurantId || 1 },
        update: filteredSettings,
        create: {
          restaurantId: restaurantId || 1,
          ...filteredSettings
        }
      });
      
      console.log('Successfully updated restaurant settings:', {
        restaurantId: result.restaurantId,
        updatedFields: Object.keys(filteredSettings).length
      });
      
      return result;
    } catch (error) {
      console.error('DETAILED ERROR in updateSettings:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        restaurantId: restaurantId || 1,
        attemptedFields: 'Error occurred before filteredSettings was created'
      });
      throw error; // Now that we're filtering fields properly, let real errors bubble up
    }
  },
  
  // Create a new page
  async createPage(restaurantId: number | undefined, pageData: PageCreationData): Promise<WebsiteBuilderPage> {
    try {
      // Create a new ContentBlock entry for the page
      const contentBlock = await prisma.contentBlock.create({
        data: {
          restaurantId: restaurantId!,
          blockType: 'page',
          title: pageData.name,
          content: '',
          page: pageData.slug,
          isActive: true,
          displayOrder: 999, // Place at end by default
          settings: JSON.stringify({
            metaTitle: pageData.metaTitle,
            metaDescription: pageData.metaDescription,
            template: pageData.template || 'default',
          })
        }
      });

      return this.transformContentBlockToPage(contentBlock);
    } catch (error) {
      console.error('Error in createPage:', error);
      throw error;
    }
  },

  // Update a page
  async updatePage(restaurantId: number | undefined, slug: string, pageData: Partial<PageCreationData>): Promise<WebsiteBuilderPage> {
    try {
      // Find the page ContentBlock
      const pageBlock = await prisma.contentBlock.findFirst({
        where: {
          restaurantId: restaurantId!,
          page: slug,
          blockType: 'page'
        }
      });

      if (!pageBlock) {
        throw new Error(`Page with slug '${slug}' not found`);
      }

      // Parse existing settings
      let existingSettings = {};
      try {
        if (typeof pageBlock.settings === 'string') {
          existingSettings = JSON.parse(pageBlock.settings);
        } else if (pageBlock.settings && typeof pageBlock.settings === 'object') {
          existingSettings = pageBlock.settings;
        }
      } catch (e) {
        console.warn('Could not parse existing settings:', pageBlock.settings);
        existingSettings = {};
      }

      // Update the page ContentBlock
      const updatedBlock = await prisma.contentBlock.update({
        where: { id: pageBlock.id },
        data: {
          title: pageData.name || pageBlock.title,
          page: pageData.slug || pageBlock.page,
          settings: JSON.stringify({
            ...existingSettings,
            metaTitle: pageData.metaTitle,
            metaDescription: pageData.metaDescription,
            template: pageData.template,
          })
        }
      });

      return this.transformContentBlockToPage(updatedBlock);
    } catch (error) {
      console.error('Error in updatePage:', error);
      throw error;
    }
  },
  
  // Delete a page
  async deletePage(restaurantId: number | undefined, slug: string): Promise<void> {
    try {
      // Delete all content blocks for this page
      await prisma.contentBlock.deleteMany({
        where: {
          restaurantId: restaurantId!,
          page: slug
        }
      });
    } catch (error) {
      console.error('Error in deletePage:', error);
      throw error;
    }
  },
  
  // Update a content block
  async updateContentBlock(
    restaurantId: number, 
    pageSlug: string, 
    blockId: number, 
    blockData: Partial<WebsiteBuilderBlock>
  ): Promise<WebsiteBuilderBlock> {
    try {
      // Add debug logging
      console.log('[updateContentBlock] Received data:', {
        restaurantId,
        pageSlug,
        blockId,
        blockData: JSON.stringify(blockData, null, 2)
      });
      
      const updatedBlock = await prisma.contentBlock.update({
        where: {
          id: blockId,
          restaurantId: restaurantId,
          page: pageSlug
        },
        data: {
          title: blockData.title,
          subtitle: blockData.subtitle,
          content: blockData.content,
          imageUrl: blockData.imageUrl,
          videoUrl: blockData.videoUrl,
          buttonText: blockData.buttonText,
          buttonLink: blockData.buttonLink,
          buttonStyle: blockData.buttonStyle,
          isActive: blockData.isActive,
          displayOrder: blockData.displayOrder,
          settings: blockData.settings ? JSON.stringify(blockData.settings) : undefined
        }
      });

      console.log('[updateContentBlock] Updated block in database:', JSON.stringify(updatedBlock, null, 2));
      
      const transformedBlock = this.transformContentBlockToBuilderBlock(updatedBlock);
      console.log('[updateContentBlock] Transformed block for frontend:', JSON.stringify(transformedBlock, null, 2));
      
      return transformedBlock;
    } catch (error) {
      console.error('Error in updateContentBlock:', error);
      throw error;
    }
  },
  
  // Create a new content block
  async createContentBlock(
    restaurantId: number, 
    pageSlug: string, 
    blockData: Partial<WebsiteBuilderBlock>
  ): Promise<WebsiteBuilderBlock> {
    try {
      // Get the highest display order for this page
      const lastBlock = await prisma.contentBlock.findFirst({
        where: {
          restaurantId: restaurantId,
          page: pageSlug
        },
        orderBy: { displayOrder: 'desc' }
      });

      const displayOrder = (lastBlock?.displayOrder || 0) + 1;

      console.log('Creating content block with data:', {
        restaurantId,
        pageSlug,
        blockData,
        displayOrder
      });

      const newBlock = await prisma.contentBlock.create({
        data: {
          restaurantId: restaurantId,
          page: pageSlug,
          blockType: blockData.blockType || 'text',
          title: blockData.title || '',
          subtitle: blockData.subtitle || null,
          content: blockData.content || '',
          imageUrl: blockData.imageUrl || null,
          imagePublicId: blockData.imagePublicId || null,
          videoUrl: blockData.videoUrl || null,
          buttonText: blockData.buttonText || null,
          buttonLink: blockData.buttonLink || null,
          buttonStyle: blockData.buttonStyle || 'primary',
          isActive: blockData.isActive ?? true,
          displayOrder: displayOrder,
          settings: blockData.settings ? JSON.stringify(blockData.settings) : "{}"
        }
      });

      console.log('Content block created successfully:', newBlock.id);
      return this.transformContentBlockToBuilderBlock(newBlock);
    } catch (error) {
      console.error('Error in createContentBlock:', error);
      console.error('Error details:', {
        restaurantId,
        pageSlug,
        blockData,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },
  
  // Delete a content block
  async deleteContentBlock(
    restaurantId: number, 
    pageSlug: string, 
    blockId: number
  ): Promise<void> {
    try {
      // First try the standard delete with all constraints
      const deleteResult = await prisma.contentBlock.deleteMany({
        where: {
          id: blockId,
          restaurantId: restaurantId,
          page: pageSlug
        }
      });
      
      // If no rows were deleted, try deleting legacy blocks by ID only
      if (deleteResult.count === 0) {
        console.log(`Standard delete failed for block ${blockId}, trying legacy delete by ID only...`);
        const legacyDeleteResult = await prisma.contentBlock.deleteMany({
          where: {
            id: blockId
          }
        });
        
        if (legacyDeleteResult.count === 0) {
          throw new Error(`Content block ${blockId} not found or cannot be deleted`);
        }
        
        console.log(`Successfully deleted legacy block ${blockId}`);
      }
    } catch (error) {
      console.error('Error in deleteContentBlock:', error);
      throw error;
    }
  },
  
  // Reorder content blocks
  async reorderContentBlocks(
    restaurantId: number, 
    pageSlug: string, 
    blockOrder: number[]
  ): Promise<void> {
    try {
      // Update display order for each block
      const updatePromises = blockOrder.map((blockId, index) => 
        prisma.contentBlock.update({
          where: {
            id: blockId,
            restaurantId: restaurantId,
            page: pageSlug
          },
          data: {
            displayOrder: index + 1
          }
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error in reorderContentBlocks:', error);
      throw error;
    }
  },
  
  // Get page templates
  async getPageTemplates(): Promise<PageTemplate[]> {
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
  
  // Helper method to get pages from ContentBlocks
  async getPages(restaurantId?: number): Promise<WebsiteBuilderPage[]> {
    try {
      // Get all unique pages that have content blocks
      const allContentBlocks = await prisma.contentBlock.findMany({
        where: {
          restaurantId: restaurantId,
          isActive: true
        },
                 select: {
           page: true,
           blockType: true,
           title: true,
           displayOrder: true,
           isActive: true
         },
        orderBy: { displayOrder: 'asc' }
      });

      // Group content blocks by page
      const pageGroups = allContentBlocks.reduce((groups, block) => {
        if (!block.page) return groups;
        if (!groups[block.page]) {
          groups[block.page] = [];
        }
        groups[block.page].push(block);
        return groups;
      }, {} as Record<string, any[]>);

      const pages: WebsiteBuilderPage[] = [];
      
      // Create pages for each group
      for (const [pageSlug, blocks] of Object.entries(pageGroups)) {
        // Find a page-level block or use the first block for page metadata
        const pageBlock = blocks.find(b => b.blockType === 'page') || blocks[0];
        
        // Get full content blocks for this page
        const contentBlocks = await prisma.contentBlock.findMany({
          where: {
            restaurantId: restaurantId,
            page: pageSlug,
            isActive: true
          },
          orderBy: { displayOrder: 'asc' }
        });

        // Determine page name from page block or capitalize slug
        let pageName = pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1);
        if (pageBlock.blockType === 'page' && pageBlock.title) {
          pageName = pageBlock.title;
        } else if (pageSlug === 'home') {
          pageName = 'Home';
        } else if (pageSlug === 'about') {
          pageName = 'About';
        } else if (pageSlug === 'contact') {
          pageName = 'Contact';
        }

        // Determine display order
        let displayOrder = 999;
        if (pageSlug === 'home') displayOrder = 1;
        else if (pageSlug === 'about') displayOrder = 2;
        else if (pageSlug === 'contact') displayOrder = 3;
        else if (pageBlock.blockType === 'page') displayOrder = pageBlock.displayOrder || 999;

        pages.push({
          id: pageSlug,
          name: pageName,
          slug: pageSlug,
          url: pageSlug === 'home' ? '/' : `/${pageSlug}`,
          isSystem: ['home', 'about', 'contact'].includes(pageSlug),
          isActive: true, // If content blocks exist, page is active
          displayOrder: displayOrder,
                   metaTitle: undefined, // Will be populated from full block data if needed
         metaDescription: undefined, // Will be populated from full block data if needed
          blocks: contentBlocks.map(block => this.transformContentBlockToBuilderBlock(block))
        });
      }

      return pages.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.error('Error in getPages:', error);
      throw error;
    }
  },
  
  // Helper method to transform ContentBlock to WebsiteBuilderBlock
  transformContentBlockToBuilderBlock(block: any): WebsiteBuilderBlock {
    let settings = {};
    let styles = {};
    if (block.settings) {
      try {
        settings = typeof block.settings === 'string' ? JSON.parse(block.settings) : block.settings;
        // Extract styles from settings if they exist
        if (settings && (settings as any).styles) {
          styles = (settings as any).styles;
        }
      } catch (error) {
        console.warn('Failed to parse block settings, using empty object:', error);
        settings = {};
      }
    }

    return {
      id: block.id,
      blockType: block.blockType || 'text',
      title: block.title,
      subtitle: block.subtitle,
      content: block.content,
      imageUrl: block.imageUrl,
      imagePublicId: block.imagePublicId,
      videoUrl: block.videoUrl,
      buttonText: block.buttonText,
      buttonLink: block.buttonLink,
      buttonStyle: block.buttonStyle,
      settings: settings,
      styles: styles,
      displayOrder: block.displayOrder || 0,
      isActive: block.isActive || false
    };
  },
  
  // Helper method to transform ContentBlock to WebsiteBuilderPage
  transformContentBlockToPage(block: any): WebsiteBuilderPage {
    return {
      id: block.page!,
      name: block.title || 'Untitled Page',
      slug: block.page!,
      url: `/${block.page}`,
      isSystem: false,
      isActive: block.isActive || false,
      displayOrder: block.displayOrder || 0,
      metaTitle: block.settings?.metaTitle,
      metaDescription: block.settings?.metaDescription,
      blocks: []
    };
  },
  
  // Helper method to create system pages
  createSystemPage(slug: string, name: string, order: number): WebsiteBuilderPage {
    return {
      id: slug,
      name: name,
      slug: slug,
      url: `/${slug}`,
      isSystem: true,
      isActive: true,
      displayOrder: order,
      blocks: [] // Will be populated from actual ContentBlocks
    };
  },

  // Helper method to parse navigation items from JSON
  parseNavigationItems(navigationItemsJson: any): NavigationItem[] | null {
    if (!navigationItemsJson) return null;
    
    try {
      if (typeof navigationItemsJson === 'string') {
        return JSON.parse(navigationItemsJson);
      } else if (Array.isArray(navigationItemsJson)) {
        return navigationItemsJson;
      }
      return null;
    } catch (error) {
      console.warn('Failed to parse navigation items:', error);
      return null;
    }
  },

  // Helper method to parse opening hours (handles both JSON string and object)
  parseOpeningHours(openingHours: any): any {
    if (!openingHours) return null;
    
    // If it's already an object, return as-is
    if (typeof openingHours === 'object' && !Array.isArray(openingHours)) {
      return openingHours;
    }
    
    // If it's a string, try to parse it
    if (typeof openingHours === 'string') {
      try {
        return JSON.parse(openingHours);
      } catch (e) {
        console.warn('Failed to parse opening hours JSON:', openingHours);
        return null;
      }
    }
    
    return null;
  },

  // Get available content block schemas
  async getContentBlockSchemas(): Promise<ContentBlockSchema[]> {
    return CONTENT_BLOCK_SCHEMAS;
  }
}; 