import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

// Professional Restaurant Templates Collection
export const RESTAURANT_TEMPLATES: RestaurantTemplate[] = [
  // FINE DINING CATEGORY
  {
    id: 'fine-dining-classic',
    name: 'Fine Dining Classic',
    category: 'fine-dining',
    description: 'Elegant and sophisticated design perfect for upscale restaurants and fine dining establishments',
    layoutConfig: {
      heroStyle: 'fullscreen',
      menuStyle: 'accordion',
      aboutStyle: 'side-by-side',
      navigationStyle: 'header',
      footerStyle: 'minimal',
      sectionSpacing: 'generous',
      containerMaxWidth: 'standard',
      borderRadius: 'subtle',
      shadows: 'subtle'
    },
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#d4af37',
      accent: '#8b4513',
      background: '#ffffff',
      surface: '#f8f8f8',
      text: '#333333',
      textSecondary: '#666666',
      border: '#e0e0e0',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336'
    },
    defaultTypography: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Source Sans Pro, sans-serif',
      accentFont: 'Dancing Script, cursive',
      headingSizes: {
        h1: '3.5rem',
        h2: '2.75rem',
        h3: '2.25rem',
        h4: '1.875rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.2',
        body: '1.6'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em'
      }
    },
    features: ['elegant-typography', 'image-galleries', 'reservation-integration', 'wine-list', 'chef-profiles'],
    isPremium: true,
    isActive: true,
    sortOrder: 1
  },

  {
    id: 'michelin-modern',
    name: 'Michelin Modern',
    category: 'fine-dining',
    description: 'Contemporary fine dining template with minimalist design and focus on culinary artistry',
    layoutConfig: {
      heroStyle: 'minimal',
      menuStyle: 'masonry',
      aboutStyle: 'centered',
      navigationStyle: 'minimal',
      footerStyle: 'minimal',
      sectionSpacing: 'generous',
      containerMaxWidth: 'narrow',
      borderRadius: 'none',
      shadows: 'none'
    },
    defaultColors: {
      primary: '#2c2c2c',
      secondary: '#f0f0f0',
      accent: '#c9a961',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#1a1a1a',
      textSecondary: '#757575',
      border: '#e8e8e8',
      success: '#66bb6a',
      warning: '#ffa726',
      error: '#ef5350'
    },
    defaultTypography: {
      headingFont: 'Cormorant Garamond, serif',
      bodyFont: 'Inter, sans-serif',
      headingSizes: {
        h1: '4rem',
        h2: '3rem',
        h3: '2.25rem',
        h4: '1.75rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1.125rem',
      lineHeight: {
        heading: '1.1',
        body: '1.7'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 600
      },
      letterSpacing: {
        tight: '-0.05em',
        normal: '0',
        wide: '0.05em'
      }
    },
    features: ['minimalist-design', 'chef-stories', 'tasting-menus', 'awards-showcase', 'press-coverage'],
    isPremium: true,
    isActive: true,
    sortOrder: 2
  },

  // CASUAL DINING CATEGORY
  {
    id: 'bistro-warmth',
    name: 'Bistro Warmth',
    category: 'casual-dining',
    description: 'Cozy and inviting design perfect for bistros, cafes, and neighborhood restaurants',
    layoutConfig: {
      heroStyle: 'standard',
      menuStyle: 'grid',
      aboutStyle: 'stacked',
      navigationStyle: 'header',
      footerStyle: 'standard',
      sectionSpacing: 'standard',
      containerMaxWidth: 'standard',
      borderRadius: 'standard',
      shadows: 'standard'
    },
    defaultColors: {
      primary: '#8b4513',
      secondary: '#d2b48c',
      accent: '#cd853f',
      background: '#fdf6e3',
      surface: '#ffffff',
      text: '#3e2723',
      textSecondary: '#6d4c41',
      border: '#d7ccc8',
      success: '#8bc34a',
      warning: '#ff9800',
      error: '#e57373'
    },
    defaultTypography: {
      headingFont: 'Merriweather, serif',
      bodyFont: 'Open Sans, sans-serif',
      headingSizes: {
        h1: '2.75rem',
        h2: '2.25rem',
        h3: '1.875rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1.125rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.3',
        body: '1.6'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 600,
        bold: 700
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em'
      }
    },
    features: ['cozy-atmosphere', 'local-sourcing', 'daily-specials', 'community-events', 'family-friendly'],
    isPremium: false,
    isActive: true,
    sortOrder: 3
  },

  {
    id: 'family-comfort',
    name: 'Family Comfort',
    category: 'casual-dining',
    description: 'Welcoming family restaurant template with emphasis on comfort food and community',
    layoutConfig: {
      heroStyle: 'split',
      menuStyle: 'tabs',
      aboutStyle: 'columns',
      navigationStyle: 'modern',
      footerStyle: 'expanded',
      sectionSpacing: 'relaxed',
      containerMaxWidth: 'wide',
      borderRadius: 'rounded',
      shadows: 'standard'
    },
    defaultColors: {
      primary: '#e53935',
      secondary: '#ffecb3',
      accent: '#4caf50',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121',
      textSecondary: '#616161',
      border: '#bdbdbd',
      success: '#66bb6a',
      warning: '#ffa726',
      error: '#ef5350'
    },
    defaultTypography: {
      headingFont: 'Nunito, sans-serif',
      bodyFont: 'Roboto, sans-serif',
      headingSizes: {
        h1: '3rem',
        h2: '2.5rem',
        h3: '2rem',
        h4: '1.75rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.2',
        body: '1.5'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '0',
        normal: '0',
        wide: '0.01em'
      }
    },
    features: ['kids-menu', 'group-dining', 'takeout-focus', 'loyalty-program', 'event-hosting'],
    isPremium: false,
    isActive: true,
    sortOrder: 4
  },

  // MODERN CAFE CATEGORY
  {
    id: 'coffee-culture',
    name: 'Coffee Culture',
    category: 'cafe',
    description: 'Modern coffee shop template with Instagram-worthy aesthetics and urban appeal',
    layoutConfig: {
      heroStyle: 'carousel',
      menuStyle: 'grid',
      aboutStyle: 'overlay',
      navigationStyle: 'floating',
      footerStyle: 'minimal',
      sectionSpacing: 'tight',
      containerMaxWidth: 'standard',
      borderRadius: 'standard',
      shadows: 'dramatic'
    },
    defaultColors: {
      primary: '#6d4c41',
      secondary: '#ffcc80',
      accent: '#4fc3f7',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#212121',
      textSecondary: '#757575',
      border: '#e0e0e0',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336'
    },
    defaultTypography: {
      headingFont: 'Poppins, sans-serif',
      bodyFont: 'Lato, sans-serif',
      headingSizes: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1.125rem'
      },
      bodySize: '0.875rem',
      lineHeight: {
        heading: '1.2',
        body: '1.6'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 600
      },
      letterSpacing: {
        tight: '0',
        normal: '0',
        wide: '0.025em'
      }
    },
    features: ['instagram-integration', 'mobile-ordering', 'wifi-info', 'study-friendly', 'specialty-drinks'],
    isPremium: false,
    isActive: true,
    sortOrder: 5
  },

  // Additional templates for variety...
  {
    id: 'italian-trattoria',
    name: 'Italian Trattoria',
    category: 'ethnic',
    description: 'Authentic Italian restaurant template with rustic charm and traditional elements',
    layoutConfig: {
      heroStyle: 'fullscreen',
      menuStyle: 'accordion',
      aboutStyle: 'stacked',
      navigationStyle: 'header',
      footerStyle: 'standard',
      sectionSpacing: 'relaxed',
      containerMaxWidth: 'standard',
      borderRadius: 'standard',
      shadows: 'standard'
    },
    defaultColors: {
      primary: '#c62d42',
      secondary: '#f4e4c1',
      accent: '#2e7d32',
      background: '#ffffff',
      surface: '#fef9e7',
      text: '#1b1b1b',
      textSecondary: '#4a4a4a',
      border: '#d4b483',
      success: '#388e3c',
      warning: '#f57c00',
      error: '#d32f2f'
    },
    defaultTypography: {
      headingFont: 'Libre Baskerville, serif',
      bodyFont: 'Lora, serif',
      accentFont: 'Dancing Script, cursive',
      headingSizes: {
        h1: '3.25rem',
        h2: '2.75rem',
        h3: '2.25rem',
        h4: '1.875rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.2',
        body: '1.7'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em'
      }
    },
    features: ['wine-pairing', 'family-recipes', 'regional-specialties', 'italian-imports', 'cooking-classes'],
    isPremium: false,
    isActive: true,
    sortOrder: 6
  },

  // FAST CASUAL CATEGORY
  {
    id: 'fresh-fast',
    name: 'Fresh & Fast',
    category: 'fast-casual',
    description: 'Clean and modern template for fast-casual restaurants emphasizing freshness and speed',
    layoutConfig: {
      heroStyle: 'standard',
      menuStyle: 'grid',
      aboutStyle: 'centered',
      navigationStyle: 'modern',
      footerStyle: 'minimal',
      sectionSpacing: 'tight',
      containerMaxWidth: 'wide',
      borderRadius: 'standard',
      shadows: 'subtle'
    },
    defaultColors: {
      primary: '#4caf50',
      secondary: '#81c784',
      accent: '#ff9800',
      background: '#ffffff',
      surface: '#f1f8e9',
      text: '#1b5e20',
      textSecondary: '#388e3c',
      border: '#c8e6c9',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336'
    },
    defaultTypography: {
      headingFont: 'Montserrat, sans-serif',
      bodyFont: 'Roboto, sans-serif',
      headingSizes: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1.125rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.2',
        body: '1.5'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '0',
        normal: '0',
        wide: '0.01em'
      }
    },
    features: ['online-ordering', 'nutrition-info', 'allergy-alerts', 'meal-prep', 'loyalty-program'],
    isPremium: false,
    isActive: true,
    sortOrder: 7
  },

  // BAKERY CATEGORY
  {
    id: 'artisan-bakery',
    name: 'Artisan Bakery',
    category: 'bakery',
    description: 'Warm and inviting template showcasing fresh baked goods and artisan craftsmanship',
    layoutConfig: {
      heroStyle: 'carousel',
      menuStyle: 'masonry',
      aboutStyle: 'side-by-side',
      navigationStyle: 'header',
      footerStyle: 'expanded',
      sectionSpacing: 'relaxed',
      containerMaxWidth: 'standard',
      borderRadius: 'rounded',
      shadows: 'standard'
    },
    defaultColors: {
      primary: '#8d6e63',
      secondary: '#d7ccc8',
      accent: '#ffb74d',
      background: '#fff8e1',
      surface: '#ffffff',
      text: '#3e2723',
      textSecondary: '#6d4c41',
      border: '#d7ccc8',
      success: '#66bb6a',
      warning: '#ffa726',
      error: '#ef5350'
    },
    defaultTypography: {
      headingFont: 'Dancing Script, cursive',
      bodyFont: 'Lato, sans-serif',
      accentFont: 'Great Vibes, cursive',
      headingSizes: {
        h1: '3rem',
        h2: '2.5rem',
        h3: '2rem',
        h4: '1.75rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.3',
        body: '1.6'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 600
      },
      letterSpacing: {
        tight: '0',
        normal: '0',
        wide: '0.02em'
      }
    },
    features: ['daily-specials', 'custom-orders', 'catering', 'recipe-blog', 'seasonal-items'],
    isPremium: false,
    isActive: true,
    sortOrder: 8
  },

  // BAR CATEGORY
  {
    id: 'craft-cocktails',
    name: 'Craft Cocktails',
    category: 'bar',
    description: 'Bold and sophisticated template for bars, breweries, and cocktail lounges',
    layoutConfig: {
      heroStyle: 'fullscreen',
      menuStyle: 'tabs',
      aboutStyle: 'overlay',
      navigationStyle: 'floating',
      footerStyle: 'minimal',
      sectionSpacing: 'standard',
      containerMaxWidth: 'standard',
      borderRadius: 'subtle',
      shadows: 'dramatic'
    },
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#ffd700',
      accent: '#c9a961',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#333333',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336'
    },
    defaultTypography: {
      headingFont: 'Cormorant Garamond, serif',
      bodyFont: 'Montserrat, sans-serif',
      headingSizes: {
        h1: '4rem',
        h2: '3rem',
        h3: '2.25rem',
        h4: '1.875rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.1',
        body: '1.6'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em'
      }
    },
    features: ['cocktail-menu', 'live-music', 'happy-hour', 'private-events', 'bar-food'],
    isPremium: true,
    isActive: true,
    sortOrder: 9
  },

  // SUSTAINABLE DINING
  {
    id: 'farm-to-table',
    name: 'Farm to Table',
    category: 'sustainable',
    description: 'Eco-friendly template emphasizing local sourcing, sustainability, and organic ingredients',
    layoutConfig: {
      heroStyle: 'split',
      menuStyle: 'accordion',
      aboutStyle: 'stacked',
      navigationStyle: 'header',
      footerStyle: 'contact-focused',
      sectionSpacing: 'generous',
      containerMaxWidth: 'standard',
      borderRadius: 'standard',
      shadows: 'subtle'
    },
    defaultColors: {
      primary: '#2e7d32',
      secondary: '#66bb6a',
      accent: '#ffb74d',
      background: '#f1f8e9',
      surface: '#ffffff',
      text: '#1b5e20',
      textSecondary: '#388e3c',
      border: '#c8e6c9',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#e57373'
    },
    defaultTypography: {
      headingFont: 'Merriweather, serif',
      bodyFont: 'Source Sans Pro, sans-serif',
      headingSizes: {
        h1: '3rem',
        h2: '2.5rem',
        h3: '2rem',
        h4: '1.75rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.3',
        body: '1.7'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em'
      }
    },
    features: ['local-sourcing', 'sustainability', 'seasonal-menu', 'farmer-partnerships', 'eco-practices'],
    isPremium: false,
    isActive: true,
    sortOrder: 10
  },

  // WORLD CUISINE
  {
    id: 'asian-fusion',
    name: 'Asian Fusion',
    category: 'world-cuisine',
    description: 'Modern template celebrating Asian cuisine with contemporary design elements',
    layoutConfig: {
      heroStyle: 'fullscreen',
      menuStyle: 'grid',
      aboutStyle: 'columns',
      navigationStyle: 'modern',
      footerStyle: 'standard',
      sectionSpacing: 'standard',
      containerMaxWidth: 'wide',
      borderRadius: 'standard',
      shadows: 'standard'
    },
    defaultColors: {
      primary: '#d32f2f',
      secondary: '#ff7043',
      accent: '#ffa726',
      background: '#fff3e0',
      surface: '#ffffff',
      text: '#1a1a1a',
      textSecondary: '#424242',
      border: '#ffccbc',
      success: '#66bb6a',
      warning: '#ff9800',
      error: '#ef5350'
    },
    defaultTypography: {
      headingFont: 'Crimson Text, serif',
      bodyFont: 'Open Sans, sans-serif',
      headingSizes: {
        h1: '3.25rem',
        h2: '2.75rem',
        h3: '2.25rem',
        h4: '1.875rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.2',
        body: '1.6'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em'
      }
    },
    features: ['dim-sum', 'sushi-bar', 'hot-pot', 'teppanyaki', 'private-dining'],
    isPremium: false,
    isActive: true,
    sortOrder: 11
  },

  {
    id: 'mexican-cantina',
    name: 'Mexican Cantina',
    category: 'world-cuisine',
    description: 'Vibrant template capturing the energy and flavors of Mexican cuisine',
    layoutConfig: {
      heroStyle: 'carousel',
      menuStyle: 'tabs',
      aboutStyle: 'side-by-side',
      navigationStyle: 'header',
      footerStyle: 'expanded',
      sectionSpacing: 'relaxed',
      containerMaxWidth: 'standard',
      borderRadius: 'rounded',
      shadows: 'standard'
    },
    defaultColors: {
      primary: '#e64a19',
      secondary: '#ff6f00',
      accent: '#ffc107',
      background: '#fff3e0',
      surface: '#ffffff',
      text: '#1a1a1a',
      textSecondary: '#424242',
      border: '#ffccbc',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#d32f2f'
    },
    defaultTypography: {
      headingFont: 'Montserrat, sans-serif',
      bodyFont: 'Roboto, sans-serif',
      headingSizes: {
        h1: '3rem',
        h2: '2.5rem',
        h3: '2rem',
        h4: '1.75rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.2',
        body: '1.5'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '0',
        normal: '0',
        wide: '0.01em'
      }
    },
    features: ['taco-bar', 'margarita-menu', 'live-music', 'happy-hour', 'catering'],
    isPremium: false,
    isActive: true,
    sortOrder: 12
  },

  // PREMIUM TEMPLATES
  {
    id: 'luxury-dining',
    name: 'Luxury Dining',
    category: 'premium',
    description: 'Ultra-premium template for Michelin-starred restaurants and exclusive dining experiences',
    layoutConfig: {
      heroStyle: 'fullscreen',
      menuStyle: 'accordion',
      aboutStyle: 'centered',
      navigationStyle: 'minimal',
      footerStyle: 'minimal',
      sectionSpacing: 'generous',
      containerMaxWidth: 'narrow',
      borderRadius: 'none',
      shadows: 'none'
    },
    defaultColors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#d4af37',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336'
    },
    defaultTypography: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Source Sans Pro, sans-serif',
      headingSizes: {
        h1: '4.5rem',
        h2: '3.5rem',
        h3: '2.75rem',
        h4: '2.25rem',
        h5: '1.875rem',
        h6: '1.5rem'
      },
      bodySize: '1.125rem',
      lineHeight: {
        heading: '1.1',
        body: '1.8'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '-0.05em',
        normal: '0',
        wide: '0.1em'
      }
    },
    features: ['tasting-menus', 'sommelier-service', 'private-chef', 'wine-cellar', 'exclusive-events'],
    isPremium: true,
    isActive: true,
    sortOrder: 13
  },

  {
    id: 'seaside-bistro',
    name: 'Seaside Bistro',
    category: 'casual-dining',
    description: 'Coastal-inspired template perfect for seafood restaurants and beachside dining',
    layoutConfig: {
      heroStyle: 'fullscreen',
      menuStyle: 'masonry',
      aboutStyle: 'overlay',
      navigationStyle: 'floating',
      footerStyle: 'minimal',
      sectionSpacing: 'generous',
      containerMaxWidth: 'standard',
      borderRadius: 'standard',
      shadows: 'subtle'
    },
    defaultColors: {
      primary: '#0277bd',
      secondary: '#03a9f4',
      accent: '#ffc107',
      background: '#e3f2fd',
      surface: '#ffffff',
      text: '#01579b',
      textSecondary: '#0277bd',
      border: '#90caf9',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336'
    },
    defaultTypography: {
      headingFont: 'Lora, serif',
      bodyFont: 'Open Sans, sans-serif',
      headingSizes: {
        h1: '3.5rem',
        h2: '2.75rem',
        h3: '2.25rem',
        h4: '1.875rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.2',
        body: '1.6'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em'
      }
    },
    features: ['fresh-seafood', 'ocean-views', 'outdoor-dining', 'sunset-specials', 'boat-access'],
    isPremium: false,
    isActive: true,
    sortOrder: 14
  },

  {
    id: 'urban-steakhouse',
    name: 'Urban Steakhouse',
    category: 'fine-dining',
    description: 'Bold and masculine template for modern steakhouses and grill restaurants',
    layoutConfig: {
      heroStyle: 'split',
      menuStyle: 'list',
      aboutStyle: 'side-by-side',
      navigationStyle: 'header',
      footerStyle: 'standard',
      sectionSpacing: 'standard',
      containerMaxWidth: 'wide',
      borderRadius: 'subtle',
      shadows: 'dramatic'
    },
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#8b4513',
      accent: '#d2691e',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#1a1a1a',
      textSecondary: '#424242',
      border: '#bdbdbd',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#d32f2f'
    },
    defaultTypography: {
      headingFont: 'Crimson Text, serif',
      bodyFont: 'Montserrat, sans-serif',
      headingSizes: {
        h1: '3.5rem',
        h2: '2.75rem',
        h3: '2.25rem',
        h4: '1.875rem',
        h5: '1.5rem',
        h6: '1.25rem'
      },
      bodySize: '1rem',
      lineHeight: {
        heading: '1.2',
        body: '1.5'
      },
      fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.02em'
      }
    },
    features: ['dry-aged-beef', 'wine-pairing', 'private-dining', 'chef-table', 'wine-cellar'],
    isPremium: true,
    isActive: true,
    sortOrder: 15
  }
];

export class RestaurantTemplateService {
  // Get all active templates
  async getActiveTemplates(): Promise<RestaurantTemplate[]> {
    try {
      const templates = await prisma.restaurantTemplate.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      });

      return templates.map(this.transformPrismaTemplate);
    } catch (error) {
      console.error('Error fetching templates:', error);
      return RESTAURANT_TEMPLATES.filter(t => t.isActive);
    }
  }

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<RestaurantTemplate[]> {
    try {
      const templates = await prisma.restaurantTemplate.findMany({
        where: { 
          category,
          isActive: true 
        },
        orderBy: { sortOrder: 'asc' }
      });

      return templates.map(this.transformPrismaTemplate);
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      return RESTAURANT_TEMPLATES.filter(t => t.category === category && t.isActive);
    }
  }

  // Get single template by ID
  async getTemplate(id: string): Promise<RestaurantTemplate | null> {
    try {
      const template = await prisma.restaurantTemplate.findUnique({
        where: { id }
      });

      if (!template) {
        // Fallback to predefined templates
        return RESTAURANT_TEMPLATES.find(t => t.id === id) || null;
      }

      return this.transformPrismaTemplate(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      return RESTAURANT_TEMPLATES.find(t => t.id === id) || null;
    }
  }

  // Apply template to restaurant
  async applyTemplate(templateId: string, restaurantId: number): Promise<void> {
    try {
      // Get template (from DB or predefined)
      let template = await this.getTemplate(templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }

      // Get or create restaurant settings (outside transaction for read-only)
      const existingSettings = await prisma.restaurantSettings.findUnique({
        where: { restaurantId }
      });

      const now = new Date();

      // Wrap all database operations in a transaction for atomicity
      // This ensures that if any operation fails, all changes are rolled back
      await prisma.$transaction(async (tx) => {
        // 0. Ensure template exists in database (required for foreign key constraint)
        // If template came from predefined array but doesn't exist in DB, upsert it
        const dbTemplate = await tx.restaurantTemplate.findUnique({
          where: { id: templateId }
        });

        if (!dbTemplate) {
          // Template doesn't exist in database, upsert it from predefined template
          await tx.restaurantTemplate.upsert({
            where: { id: template.id },
            create: {
              id: template.id,
              name: template.name,
              category: template.category,
              description: template.description,
              previewUrl: template.previewUrl,
              layoutConfig: template.layoutConfig as any,
              defaultColors: template.defaultColors as any,
              defaultTypography: template.defaultTypography as any,
              features: template.features,
              isPremium: template.isPremium,
              isActive: template.isActive,
              sortOrder: template.sortOrder
            },
            update: {
              name: template.name,
              category: template.category,
              description: template.description,
              previewUrl: template.previewUrl,
              layoutConfig: template.layoutConfig as any,
              defaultColors: template.defaultColors as any,
              defaultTypography: template.defaultTypography as any,
              features: template.features,
              isPremium: template.isPremium,
              isActive: template.isActive,
              sortOrder: template.sortOrder
            }
          });
        }

        // 1. Apply template to restaurant settings
        await tx.restaurantSettings.upsert({
          where: { restaurantId },
          create: {
            restaurantId,
            
            // Apply colors
            primaryColor: template.defaultColors.primary,
            secondaryColor: template.defaultColors.secondary,
            accentColor: template.defaultColors.accent,
            
            // Apply typography
            fontPrimary: template.defaultTypography.headingFont,
            fontSecondary: template.defaultTypography.bodyFont,
            
            // Keep existing content or use defaults
            websiteName: existingSettings?.websiteName || 'Restaurant Name',
            heroTitle: existingSettings?.heroTitle || 'Welcome to Our Restaurant',
            heroSubtitle: existingSettings?.heroSubtitle || 'Experience Fine Dining at Its Best',
            aboutTitle: existingSettings?.aboutTitle || 'About Us',
            aboutDescription: existingSettings?.aboutDescription || 'Discover our story and passion for exceptional cuisine.',
            
            // Keep existing media
            heroImageUrl: existingSettings?.heroImageUrl,
            aboutImageUrl: existingSettings?.aboutImageUrl,
            logoUrl: existingSettings?.logoUrl,
            
            updatedAt: now,
            createdAt: now
          },
          update: {
            
            // Apply colors
            primaryColor: template.defaultColors.primary,
            secondaryColor: template.defaultColors.secondary,
            accentColor: template.defaultColors.accent,
            
            // Apply typography
            fontPrimary: template.defaultTypography.headingFont,
            fontSecondary: template.defaultTypography.bodyFont,
            
            updatedAt: now
          }
        });

        // 2. Delete existing content blocks (if any)
        // This is safe because it's inside a transaction - if createMany fails, this will roll back
        await tx.contentBlock.deleteMany({
          where: { restaurantId }
        });

        // 3. Create default blocks from template
        const defaultBlocks = this.generateDefaultContentBlocks(template, restaurantId);
        if (defaultBlocks.length > 0) {
          await tx.contentBlock.createMany({
            data: defaultBlocks
          });
        }

        // 4. Create template application record
        // Now safe because we've ensured the template exists in the database
        await tx.templateApplication.create({
          data: {
            restaurantId,
            templateId,
            appliedAt: now
          }
        });

        // 5. Update restaurant website settings
        await tx.restaurant.update({
          where: { id: restaurantId },
          data: {
            websiteSettings: {
              template: template.name,
              templateId: template.id,
              layoutConfig: template.layoutConfig,
              features: template.features
            } as any,
            website_builder_enabled: true
          }
        });
      });

    } catch (error) {
      console.error('Error applying template:', error);
      throw error;
    }
  }

  /**
   * Generate default content blocks based on template layout
   */
  private generateDefaultContentBlocks(template: RestaurantTemplate, restaurantId: number) {
    const blocks: any[] = [];
    let displayOrder = 0;

    // Hero block based on template hero style
    blocks.push({
      restaurantId,
      page: 'home',
      blockType: 'hero',
      title: 'Welcome to Our Restaurant',
      subtitle: 'Experience exceptional dining',
      displayOrder: displayOrder++,
      isActive: true,
      settings: {
        style: template.layoutConfig.heroStyle,
        overlay: true
      }
    });

    // About block
    blocks.push({
      restaurantId,
      page: 'home',
      blockType: 'about',
      title: 'About Us',
      subtitle: 'Our Story',
      content: 'We are passionate about creating memorable dining experiences with fresh, locally-sourced ingredients.',
      displayOrder: displayOrder++,
      isActive: true,
      settings: {
        style: template.layoutConfig.aboutStyle
      }
    });

    // Contact block
    blocks.push({
      restaurantId,
      page: 'home',
      blockType: 'contact',
      title: 'Contact Us',
      subtitle: 'Get in Touch',
      displayOrder: displayOrder++,
      isActive: true,
      settings: {
        showMap: true,
        showHours: true
      }
    });

    return blocks;
  }

  // Get template categories
  getTemplateCategories(): { id: string; name: string; description: string; count: number }[] {
    const categories = RESTAURANT_TEMPLATES.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = {
          id: template.category,
          name: this.getCategoryDisplayName(template.category),
          description: this.getCategoryDescription(template.category),
          count: 0
        };
      }
      acc[template.category].count++;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categories);
  }

  // Seed templates to database
  async seedTemplates(): Promise<void> {
    try {
      console.log('Seeding restaurant templates...');
      
      for (const template of RESTAURANT_TEMPLATES) {
        await prisma.restaurantTemplate.upsert({
          where: { id: template.id },
          create: {
            id: template.id,
            name: template.name,
            category: template.category,
            description: template.description,
            previewUrl: template.previewUrl,
            layoutConfig: template.layoutConfig as any,
            defaultColors: template.defaultColors as any,
            defaultTypography: template.defaultTypography as any,
            features: template.features,
            isPremium: template.isPremium,
            isActive: template.isActive,
            sortOrder: template.sortOrder
          },
          update: {
            name: template.name,
            category: template.category,
            description: template.description,
            previewUrl: template.previewUrl,
            layoutConfig: template.layoutConfig as any,
            defaultColors: template.defaultColors as any,
            defaultTypography: template.defaultTypography as any,
            features: template.features,
            isPremium: template.isPremium,
            isActive: template.isActive,
            sortOrder: template.sortOrder
          }
        });
      }
      
      console.log(`Seeded ${RESTAURANT_TEMPLATES.length} restaurant templates successfully`);
    } catch (error) {
      console.error('Error seeding templates:', error);
      throw error;
    }
  }

  // Preview template (generate preview URL)
  generatePreviewUrl(templateId: string, restaurantSlug: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${baseUrl}/${restaurantSlug}/preview?templateId=${templateId}`;
  }

  // Private helper methods
  private transformPrismaTemplate(prismaTemplate: any): RestaurantTemplate {
    return {
      id: prismaTemplate.id,
      name: prismaTemplate.name,
      category: prismaTemplate.category,
      description: prismaTemplate.description || '',
      previewUrl: prismaTemplate.previewUrl,
      layoutConfig: prismaTemplate.layoutConfig as LayoutConfig,
      defaultColors: prismaTemplate.defaultColors as ColorConfig,
      defaultTypography: prismaTemplate.defaultTypography as TypographyConfig,
      features: prismaTemplate.features || [],
      isPremium: prismaTemplate.isPremium,
      isActive: prismaTemplate.isActive,
      sortOrder: prismaTemplate.sortOrder
    };
  }

  private getCategoryDisplayName(category: string): string {
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

  private getCategoryDescription(category: string): string {
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
}

export const restaurantTemplateService = new RestaurantTemplateService(); 