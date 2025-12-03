import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export interface ColorPaletteData {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
}

export interface TypographyConfigData {
  name: string;
  headingFontFamily: string;
  bodyFontFamily: string;
  fontSizes: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
    body1: string;
    body2: string;
    caption: string;
  };
  lineHeights: {
    heading: number;
    body: number;
  };
  letterSpacing?: {
    tight: string;
    normal: string;
    wide: string;
  };
  fontWeights?: {
    light: number;
    normal: number;
    medium: number;
    bold: number;
  };
}

export interface BrandAssetData {
  assetType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  altText?: string;
  description?: string;
  isPrimary?: boolean;
  cloudinaryPublicId?: string;
}

export interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
  popularity: number;
  pairing: string[];
}

export interface FontPairing {
  heading: string;
  body: string;
  category: string;
  style: string;
  description: string;
}

// Comprehensive Google Fonts database for restaurants
const RESTAURANT_GOOGLE_FONTS: GoogleFont[] = [
  // Premium Serif Fonts for Restaurant Headers
  {
    family: 'Playfair Display',
    category: 'serif',
    variants: ['400', '400i', '700', '700i', '900', '900i'],
    popularity: 95,
    pairing: ['Open Sans', 'Source Sans Pro', 'Lato', 'Roboto', 'Nunito Sans']
  },
  {
    family: 'Cormorant Garamond',
    category: 'serif',
    variants: ['300', '300i', '400', '400i', '500', '500i', '600', '600i', '700', '700i'],
    popularity: 85,
    pairing: ['Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro']
  },
  {
    family: 'Lora',
    category: 'serif',
    variants: ['400', '400i', '500', '500i', '600', '600i', '700', '700i'],
    popularity: 88,
    pairing: ['Open Sans', 'Source Sans Pro', 'Montserrat', 'Nunito Sans']
  },
  {
    family: 'Crimson Text',
    category: 'serif',
    variants: ['400', '400i', '600', '600i', '700', '700i'],
    popularity: 75,
    pairing: ['Montserrat', 'Open Sans', 'Lato']
  },
  {
    family: 'EB Garamond',
    category: 'serif',
    variants: ['400', '400i', '500', '500i', '600', '600i', '700', '700i', '800', '800i'],
    popularity: 80,
    pairing: ['Source Sans Pro', 'Open Sans', 'Nunito Sans']
  },

  // Modern Sans-Serif Fonts
  {
    family: 'Open Sans',
    category: 'sans-serif',
    variants: ['300', '300i', '400', '400i', '500', '500i', '600', '600i', '700', '700i', '800', '800i'],
    popularity: 99,
    pairing: ['Playfair Display', 'Lora', 'Cormorant Garamond', 'Merriweather']
  },
  {
    family: 'Montserrat',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    popularity: 92,
    pairing: ['Lora', 'Playfair Display', 'Crimson Text', 'Cormorant Garamond']
  },
  {
    family: 'Source Sans Pro',
    category: 'sans-serif',
    variants: ['200', '200i', '300', '300i', '400', '400i', '600', '600i', '700', '700i', '900', '900i'],
    popularity: 90,
    pairing: ['Playfair Display', 'Lora', 'EB Garamond', 'Cormorant Garamond']
  },
  {
    family: 'Lato',
    category: 'sans-serif',
    variants: ['100', '100i', '300', '300i', '400', '400i', '700', '700i', '900', '900i'],
    popularity: 94,
    pairing: ['Playfair Display', 'Lora', 'Crimson Text']
  },
  {
    family: 'Nunito Sans',
    category: 'sans-serif',
    variants: ['200', '300', '400', '600', '700', '800', '900'],
    popularity: 85,
    pairing: ['Playfair Display', 'Lora', 'EB Garamond']
  },
  {
    family: 'Roboto',
    category: 'sans-serif',
    variants: ['100', '300', '400', '500', '700', '900'],
    popularity: 98,
    pairing: ['Playfair Display', 'Lora', 'Merriweather']
  },
  {
    family: 'Inter',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    popularity: 88,
    pairing: ['Playfair Display', 'Lora', 'EB Garamond']
  },

  // Professional Serif Options
  {
    family: 'Merriweather',
    category: 'serif',
    variants: ['300', '300i', '400', '400i', '700', '700i', '900', '900i'],
    popularity: 82,
    pairing: ['Open Sans', 'Source Sans Pro', 'Roboto', 'Lato']
  },
  {
    family: 'Libre Baskerville',
    category: 'serif',
    variants: ['400', '400i', '700'],
    popularity: 78,
    pairing: ['Open Sans', 'Montserrat', 'Source Sans Pro']
  },

  // Elegant Script/Display Fonts (for special occasions)
  {
    family: 'Dancing Script',
    category: 'handwriting',
    variants: ['400', '500', '600', '700'],
    popularity: 70,
    pairing: ['Open Sans', 'Lato', 'Montserrat']
  },
  {
    family: 'Great Vibes',
    category: 'handwriting',
    variants: ['400'],
    popularity: 65,
    pairing: ['Open Sans', 'Lato', 'Source Sans Pro']
  }
];

// Professional font pairing recommendations
const FONT_PAIRINGS: FontPairing[] = [
  {
    heading: 'Playfair Display',
    body: 'Open Sans',
    category: 'Classic Elegance',
    style: 'Traditional Fine Dining',
    description: 'Sophisticated serif headlines with clean, readable body text'
  },
  {
    heading: 'Montserrat',
    body: 'Lora',
    category: 'Modern Sophistication',
    style: 'Contemporary Casual',
    description: 'Modern sans-serif headers with elegant serif body text'
  },
  {
    heading: 'Cormorant Garamond',
    body: 'Source Sans Pro',
    category: 'Artisanal Craft',
    style: 'Boutique Restaurant',
    description: 'Artisanal serif with professional sans-serif for readability'
  },
  {
    heading: 'Lora',
    body: 'Nunito Sans',
    category: 'Warm & Approachable',
    style: 'Family Restaurant',
    description: 'Friendly serif with approachable sans-serif for comfort'
  },
  {
    heading: 'EB Garamond',
    body: 'Inter',
    category: 'Literary Elegance',
    style: 'Wine Bar & Bistro',
    description: 'Classic book-style serif with modern geometric sans-serif'
  },
  {
    heading: 'Crimson Text',
    body: 'Montserrat',
    category: 'Bold & Confident',
    style: 'Modern Steakhouse',
    description: 'Strong serif headlines with bold sans-serif support'
  },
  {
    heading: 'Dancing Script',
    body: 'Open Sans',
    category: 'Romantic & Playful',
    style: 'Café & Bakery',
    description: 'Handwritten script for charm with clean body text'
  },
  {
    heading: 'Inter',
    body: 'Libre Baskerville',
    category: 'Tech-Forward Dining',
    style: 'Modern Fusion',
    description: 'Contemporary sans-serif with traditional serif for balance'
  }
];

// Default typography configurations for different restaurant styles
const DEFAULT_TYPOGRAPHY_CONFIGS = {
  'Fine Dining': {
    name: 'Fine Dining Typography',
    headingFontFamily: 'Playfair Display',
    bodyFontFamily: 'Open Sans',
    fontSizes: {
      h1: '3.5rem',
      h2: '2.5rem',
      h3: '2rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1.125rem',
      body1: '1rem',
      body2: '0.875rem',
      caption: '0.75rem'
    },
    lineHeights: {
      heading: 1.2,
      body: 1.6
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.05em'
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700
    }
  },
  'Casual Dining': {
    name: 'Casual Dining Typography',
    headingFontFamily: 'Montserrat',
    bodyFontFamily: 'Lora',
    fontSizes: {
      h1: '3rem',
      h2: '2.25rem',
      h3: '1.75rem',
      h4: '1.375rem',
      h5: '1.125rem',
      h6: '1rem',
      body1: '1rem',
      body2: '0.875rem',
      caption: '0.75rem'
    },
    lineHeights: {
      heading: 1.3,
      body: 1.7
    },
    letterSpacing: {
      tight: '-0.015em',
      normal: '0',
      wide: '0.025em'
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 600
    }
  },
  'Modern Café': {
    name: 'Modern Café Typography',
    headingFontFamily: 'Inter',
    bodyFontFamily: 'Open Sans',
    fontSizes: {
      h1: '2.75rem',
      h2: '2rem',
      h3: '1.5rem',
      h4: '1.25rem',
      h5: '1.125rem',
      h6: '1rem',
      body1: '1rem',
      body2: '0.875rem',
      caption: '0.75rem'
    },
    lineHeights: {
      heading: 1.25,
      body: 1.6
    },
    letterSpacing: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.015em'
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 600
    }
  }
};

export const themingService = {
  // Color Palette Methods
  async getColorPalettes(restaurantId: number) {
    return await prisma.colorPalette.findMany({
      where: { restaurantId },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  },

  async getActiveColorPalette(restaurantId: number) {
    return await prisma.colorPalette.findFirst({
      where: { 
        restaurantId,
        isActive: true 
      }
    });
  },

  async createColorPalette(restaurantId: number, data: ColorPaletteData) {
    // Validate accessibility and get contrast ratio/WCAG level
    const validation = validateColorPaletteAccessibility(data);
    
    return await prisma.colorPalette.create({
      data: {
        restaurantId,
        name: data.name,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        successColor: data.successColor || '#4caf50',
        warningColor: data.warningColor || '#ff9800',
        errorColor: data.errorColor || '#f44336',
        contrastRatio: validation.contrastRatio,
        wcagLevel: validation.wcagLevel, // Will be 'AA', 'AAA', or null (fits VarChar(3))
        isActive: false
      }
    });
  },

  async updateColorPalette(paletteId: string, data: Partial<ColorPaletteData>) {
    return await prisma.colorPalette.update({
      where: { id: paletteId },
      data
    });
  },

  async setActiveColorPalette(restaurantId: number, paletteId: string) {
    // First deactivate all palettes for this restaurant
    await prisma.colorPalette.updateMany({
      where: { restaurantId },
      data: { isActive: false }
    });

    // Then activate the selected palette
    return await prisma.colorPalette.update({
      where: { id: paletteId },
      data: { isActive: true }
    });
  },

  async deleteColorPalette(paletteId: string) {
    return await prisma.colorPalette.delete({
      where: { id: paletteId }
    });
  },

  // Typography Configuration Methods
  async getTypographyConfigs(restaurantId: number) {
    return await prisma.typographyConfig.findMany({
      where: { restaurantId },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  },

  async getActiveTypographyConfig(restaurantId: number) {
    return await prisma.typographyConfig.findFirst({
      where: { 
        restaurantId,
        isActive: true 
      }
    });
  },

  async createTypographyConfig(restaurantId: number, data: TypographyConfigData) {
    return await prisma.typographyConfig.create({
      data: {
        restaurantId,
        name: data.name,
        headingFontFamily: data.headingFontFamily,
        bodyFontFamily: data.bodyFontFamily,
        fontSizes: data.fontSizes,
        lineHeights: data.lineHeights,
        letterSpacing: data.letterSpacing || {
          tight: '-0.025em',
          normal: '0',
          wide: '0.025em'
        },
        fontWeights: data.fontWeights || {
          light: 300,
          normal: 400,
          medium: 500,
          bold: 700
        },
        isActive: false
      }
    });
  },

  async updateTypographyConfig(configId: string, data: Partial<TypographyConfigData>) {
    return await prisma.typographyConfig.update({
      where: { id: configId },
      data
    });
  },

  async setActiveTypographyConfig(restaurantId: number, configId: string) {
    // First deactivate all typography configs for this restaurant
    await prisma.typographyConfig.updateMany({
      where: { restaurantId },
      data: { isActive: false }
    });

    // Then activate the selected config
    return await prisma.typographyConfig.update({
      where: { id: configId },
      data: { isActive: true }
    });
  },

  async deleteTypographyConfig(configId: string) {
    return await prisma.typographyConfig.delete({
      where: { id: configId }
    });
  },

  // Brand Asset Methods (placeholder for future implementation)
  async getBrandAssets(restaurantId: number, assetType?: string) {
    const whereClause: any = { restaurantId };
    if (assetType) {
      whereClause.assetType = assetType;
    }

    return await prisma.brandAsset.findMany({
      where: whereClause,
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  },

  async createBrandAsset(restaurantId: number, data: BrandAssetData) {
    return await prisma.brandAsset.create({
      data: {
        restaurantId,
        assetType: data.assetType,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        dimensions: data.dimensions,
        altText: data.altText,
        description: data.description,
        isPrimary: data.isPrimary || false,
        cloudinaryPublicId: data.cloudinaryPublicId || null
      }
    });
  },

  async updateBrandAsset(assetId: string, data: Partial<BrandAssetData>) {
    return await prisma.brandAsset.update({
      where: { id: assetId },
      data
    });
  },

  async setPrimaryBrandAsset(restaurantId: number, assetId: string, assetType: string) {
    // First remove primary status from all assets of this type
    await prisma.brandAsset.updateMany({
      where: { 
        restaurantId,
        assetType 
      },
      data: { isPrimary: false }
    });

    // Then set the selected asset as primary
    return await prisma.brandAsset.update({
      where: { id: assetId },
      data: { isPrimary: true }
    });
  },

  async deleteBrandAsset(assetId: string) {
    return await prisma.brandAsset.delete({
      where: { id: assetId }
    });
  },

  // Google Fonts and Typography Utility Methods
  async getGoogleFonts(): Promise<GoogleFont[]> {
    return RESTAURANT_GOOGLE_FONTS;
  },

  async getFontPairings(fontFamily?: string): Promise<FontPairing[]> {
    if (fontFamily) {
      // Return pairings that include the specified font
      return FONT_PAIRINGS.filter(pairing => 
        pairing.heading === fontFamily || pairing.body === fontFamily
      );
    }
    return FONT_PAIRINGS;
  },

  async getDefaultTypographyConfigs(): Promise<typeof DEFAULT_TYPOGRAPHY_CONFIGS> {
    return DEFAULT_TYPOGRAPHY_CONFIGS;
  },

  async createDefaultTypographyConfig(restaurantId: number, style: keyof typeof DEFAULT_TYPOGRAPHY_CONFIGS) {
    const config = DEFAULT_TYPOGRAPHY_CONFIGS[style];
    if (!config) {
      throw new Error(`Unknown typography style: ${style}`);
    }

    return await this.createTypographyConfig(restaurantId, config);
  },

  // Utility method to validate font combination accessibility
  validateTypographyAccessibility(config: TypographyConfigData): {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check font size accessibility
    const bodySize = parseFloat(config.fontSizes.body1);
    if (bodySize < 1) {
      warnings.push('Body text size is below 16px (1rem) - may not be accessible');
      suggestions.push('Consider increasing body text size to at least 1rem (16px)');
    }

    // Check line height accessibility
    if (config.lineHeights.body < 1.5) {
      warnings.push('Body line height is below 1.5 - may not meet WCAG guidelines');
      suggestions.push('Increase body line height to at least 1.5 for better readability');
    }

    // Check font pairing compatibility
    const heading = RESTAURANT_GOOGLE_FONTS.find(f => f.family === config.headingFontFamily);
    const body = RESTAURANT_GOOGLE_FONTS.find(f => f.family === config.bodyFontFamily);
    
    if (heading && body && heading.category === body.category) {
      suggestions.push('Consider pairing serif and sans-serif fonts for better contrast');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions
    };
  }
};

// Calculate contrast ratio for accessibility validation
export function calculateContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Validate color palette accessibility
// FIXED: Return null instead of 'FAIL' for wcagLevel when contrast is below AA standards
// Database column is VarChar(3) and cannot store 'FAIL' (4 characters)
export function validateColorPaletteAccessibility(palette: ColorPaletteData): {
  isValid: boolean;
  contrastRatio: number;
  wcagLevel: 'AA' | 'AAA' | null; // Changed from 'FAIL' to null to fit VarChar(3) constraint
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check text/background contrast
  const textBgContrast = calculateContrastRatio(palette.textColor, palette.backgroundColor);
  const primaryBgContrast = calculateContrastRatio(palette.primaryColor, palette.backgroundColor);
  
  let wcagLevel: 'AA' | 'AAA' | null = null; // Use null instead of 'FAIL' to fit database constraint
  
  if (textBgContrast >= 7) {
    wcagLevel = 'AAA';
  } else if (textBgContrast >= 4.5) {
    wcagLevel = 'AA';
  } else {
    warnings.push('Text/background contrast ratio is below WCAG AA standards (4.5:1)');
  }
  
  if (primaryBgContrast < 3) {
    warnings.push('Primary color contrast with background is low - may affect visibility');
  }
  
  return {
    isValid: warnings.length === 0,
    contrastRatio: textBgContrast,
    wcagLevel,
    warnings
  };
}

// Helper function to extract colors from uploaded images (placeholder)
export async function extractColorsFromImage(imageUrl: string): Promise<string[]> {
  // TODO: Implement actual color extraction using a service like Cloudinary or a color extraction library
  // For now, return some sample colors
  return [
    '#8B4513', // Saddle Brown
    '#DEB887', // Burlywood  
    '#F4A460', // Sandy Brown
    '#CD853F', // Peru
    '#D2691E'  // Chocolate
  ];
} 