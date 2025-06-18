import { api } from './api';

export interface RestaurantTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  previewUrl?: string;
  layoutConfig: LayoutConfig;
  defaultColors: ColorConfig;
  defaultTypography: TypographyConfig;
  features: string[];
  isPremium: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface LayoutConfig {
  heroStyle: 'fullscreen' | 'standard' | 'minimal' | 'split' | 'carousel';
  menuStyle: 'grid' | 'list' | 'masonry' | 'accordion' | 'tabs';
  aboutStyle: 'side-by-side' | 'stacked' | 'overlay' | 'columns' | 'centered';
  navigationStyle: 'header' | 'sidebar' | 'floating' | 'minimal' | 'modern';
  footerStyle: 'standard' | 'minimal' | 'expanded' | 'contact-focused';
  sectionSpacing: 'tight' | 'standard' | 'relaxed' | 'generous';
  containerMaxWidth: 'narrow' | 'standard' | 'wide' | 'full';
  borderRadius: 'none' | 'subtle' | 'standard' | 'rounded';
  shadows: 'none' | 'subtle' | 'standard' | 'dramatic';
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  accentFont?: string;
  headingSizes: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
  };
  bodySize: string;
  lineHeight: {
    heading: string;
    body: string;
  };
  fontWeights: {
    light: number;
    regular: number;
    medium: number;
    bold: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface TemplateRecommendation {
  recommended: RestaurantTemplate[];
  availableCount: number;
  totalCount: number;
  isPremiumPlan: boolean;
  planName: string;
}

export interface TemplatePreview {
  templateId: string;
  previewUrl: string;
  restaurantSlug: string;
}

export interface TemplateApplication {
  message: string;
  templateId: string;
  restaurantId: number;
}

class RestaurantTemplateService {
  // Get all active restaurant templates
  async getActiveTemplates(): Promise<RestaurantTemplate[]> {
    const response = await api.get('/restaurant-templates');
    return response.data;
  }

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<RestaurantTemplate[]> {
    const response = await api.get(`/restaurant-templates/category/${category}`);
    return response.data;
  }

  // Get single template by ID
  async getTemplate(id: string): Promise<RestaurantTemplate> {
    const response = await api.get(`/restaurant-templates/${id}`);
    return response.data;
  }

  // Apply template to restaurant
  async applyTemplate(templateId: string): Promise<TemplateApplication> {
    const response = await api.post(`/restaurant-templates/${templateId}/apply`);
    return response.data;
  }

  // Generate template preview URL
  async previewTemplate(templateId: string): Promise<TemplatePreview> {
    const response = await api.post(`/restaurant-templates/${templateId}/preview`);
    return response.data;
  }

  // Get template categories
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    const response = await api.get('/restaurant-templates/categories');
    return response.data;
  }

  // Get template recommendations for current restaurant
  async getRecommendedTemplates(): Promise<TemplateRecommendation> {
    const response = await api.get('/restaurant-templates/recommendations');
    return response.data;
  }

  // Seed templates (admin only)
  async seedTemplates(): Promise<{ message: string }> {
    const response = await api.post('/restaurant-templates/admin/seed');
    return response.data;
  }

  // Utility methods for template categorization
  getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      'fine-dining': 'Fine Dining',
      'casual-dining': 'Casual Dining',
      'cafe': 'Cafes & Coffee Shops',
      'ethnic': 'Ethnic Cuisine',
      'fast-casual': 'Fast Casual',
      'bakery': 'Bakeries & Desserts',
      'bar': 'Bars & Pubs',
      'premium': 'Premium Templates',
      'sustainable': 'Sustainable Dining',
      'world-cuisine': 'World Cuisine'
    };
    return names[category] || category;
  }

  getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'fine-dining': 'Elegant templates for upscale restaurants and fine dining establishments',
      'casual-dining': 'Welcoming designs for family restaurants and neighborhood eateries',
      'cafe': 'Modern templates for coffee shops, cafes, and casual meeting spots',
      'ethnic': 'Cultural designs celebrating diverse culinary traditions',
      'fast-casual': 'Clean, efficient templates for quick-service and health-focused restaurants',
      'bakery': 'Warm templates showcasing fresh baked goods and artisan craftsmanship',
      'bar': 'Bold designs for bars, pubs, breweries, and nightlife establishments',
      'premium': 'Ultra-high-end templates for luxury dining experiences',
      'sustainable': 'Eco-friendly designs emphasizing local sourcing and sustainability',
      'world-cuisine': 'Multicultural templates celebrating global flavors and fusion cuisine'
    };
    return descriptions[category] || 'Professional restaurant templates';
  }

  getFeatureDisplayName(feature: string): string {
    const names: Record<string, string> = {
      'elegant-typography': 'Elegant Typography',
      'image-galleries': 'Image Galleries',
      'reservation-integration': 'Reservation Integration',
      'wine-list': 'Wine List',
      'chef-profiles': 'Chef Profiles',
      'minimalist-design': 'Minimalist Design',
      'chef-stories': 'Chef Stories',
      'tasting-menus': 'Tasting Menus',
      'awards-showcase': 'Awards Showcase',
      'press-coverage': 'Press Coverage',
      'cozy-atmosphere': 'Cozy Atmosphere',
      'local-sourcing': 'Local Sourcing',
      'daily-specials': 'Daily Specials',
      'community-events': 'Community Events',
      'family-friendly': 'Family Friendly',
      'kids-menu': 'Kids Menu',
      'group-dining': 'Group Dining',
      'takeout-focus': 'Takeout Focus',
      'loyalty-program': 'Loyalty Program',
      'event-hosting': 'Event Hosting',
      'instagram-integration': 'Instagram Integration',
      'mobile-ordering': 'Mobile Ordering',
      'wifi-info': 'WiFi Information',
      'study-friendly': 'Study Friendly',
      'specialty-drinks': 'Specialty Drinks',
      'bean-origins': 'Bean Origins',
      'brewing-methods': 'Brewing Methods',
      'coffee-education': 'Coffee Education',
      'subscription-service': 'Subscription Service',
      'roasting-schedule': 'Roasting Schedule',
      'wine-pairing': 'Wine Pairing',
      'family-recipes': 'Family Recipes',
      'regional-specialties': 'Regional Specialties',
      'italian-imports': 'Italian Imports',
      'cooking-classes': 'Cooking Classes',
      'spice-levels': 'Spice Levels',
      'dietary-options': 'Dietary Options',
      'chef-specials': 'Chef Specials',
      'tea-selection': 'Tea Selection',
      'cultural-stories': 'Cultural Stories',
      'nutrition-info': 'Nutrition Info',
      'quick-order': 'Quick Order',
      'healthy-options': 'Healthy Options',
      'sustainability': 'Sustainability',
      'mobile-first': 'Mobile First',
      'location-tracker': 'Location Tracker',
      'social-media': 'Social Media',
      'event-calendar': 'Event Calendar',
      'loyalty-rewards': 'Loyalty Rewards',
      'food-challenges': 'Food Challenges',
      'daily-fresh': 'Daily Fresh',
      'custom-cakes': 'Custom Cakes',
      'baking-process': 'Baking Process',
      'ingredient-sourcing': 'Ingredient Sourcing',
      'seasonal-items': 'Seasonal Items',
      'beer-selection': 'Beer Selection',
      'brewing-process': 'Brewing Process',
      'tour-booking': 'Tour Booking',
      'events-calendar': 'Events Calendar',
      'merchandise': 'Merchandise',
      'concierge-service': 'Concierge Service',
      'private-dining': 'Private Dining',
      'sommelier-selection': 'Sommelier Selection',
      'vip-experiences': 'VIP Experiences',
      'dress-code': 'Dress Code',
      'farmer-profiles': 'Farmer Profiles',
      'carbon-footprint': 'Carbon Footprint',
      'world-cuisines': 'World Cuisines',
      'chef-travels': 'Chef Travels',
      'fusion-dishes': 'Fusion Dishes',
      'cooking-workshops': 'Cooking Workshops'
    };
    return names[feature] || feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get category color for UI
  getCategoryColor(category: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default' {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      'fine-dining': 'primary',
      'casual-dining': 'success',
      'cafe': 'warning',
      'ethnic': 'secondary',
      'fast-casual': 'info',
      'bakery': 'warning',
      'bar': 'error',
      'premium': 'primary',
      'sustainable': 'success',
      'world-cuisine': 'secondary'
    };
    return colors[category] || 'default';
  }

  // Check if template is suitable for plan
  isTemplateAvailable(template: RestaurantTemplate, planName: string): boolean {
    if (!template.isPremium) return true;
    return ['PROFESSIONAL', 'ENTERPRISE'].includes(planName);
  }
}

export const restaurantTemplateService = new RestaurantTemplateService(); 