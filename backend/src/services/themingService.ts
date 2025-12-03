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
  isPrimary?: boolean;
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
    // Validate accessibility
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
        wcagLevel: validation.wcagLevel,
        isActive: false
      }
    });
  },
  
  async getPredefinedColorSchemes() {
    return PREDEFINED_COLOR_SCHEMES;
  },
  
  async extractColorsFromImage(imageUrl: string) {
    return await extractColorsFromImage(imageUrl);
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
        isPrimary: data.isPrimary || false
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
      // Enhanced pairing algorithm: find fonts that complement the specified font
      const specifiedFont = RESTAURANT_GOOGLE_FONTS.find(f => f.family === fontFamily);
      
      if (specifiedFont) {
        // If it's a serif font, suggest sans-serif pairings
        if (specifiedFont.category === 'serif') {
          const complementaryPairings = FONT_PAIRINGS.filter(pairing => {
            const bodyFont = RESTAURANT_GOOGLE_FONTS.find(f => f.family === pairing.body);
            return bodyFont && bodyFont.category === 'sans-serif';
          });
          const directPairings = FONT_PAIRINGS.filter(pairing => 
            pairing.heading === fontFamily || pairing.body === fontFamily
          );
          
          // Deduplicate by combining and filtering unique pairings
          const allPairings = [...complementaryPairings, ...directPairings];
          const uniquePairings = allPairings.filter((pairing, index, self) =>
            index === self.findIndex(p => p.heading === pairing.heading && p.body === pairing.body)
          );
          return uniquePairings;
        }
        
        // If it's a sans-serif font, suggest serif pairings
        if (specifiedFont.category === 'sans-serif') {
          const complementaryPairings = FONT_PAIRINGS.filter(pairing => {
            const headingFont = RESTAURANT_GOOGLE_FONTS.find(f => f.family === pairing.heading);
            return headingFont && headingFont.category === 'serif';
          });
          const directPairings = FONT_PAIRINGS.filter(pairing => 
            pairing.heading === fontFamily || pairing.body === fontFamily
          );
          
          // Deduplicate by combining and filtering unique pairings
          const allPairings = [...complementaryPairings, ...directPairings];
          const uniquePairings = allPairings.filter((pairing, index, self) =>
            index === self.findIndex(p => p.heading === pairing.heading && p.body === pairing.body)
          );
          return uniquePairings;
        }
      }
      
      // Fallback: return pairings that include the specified font
      return FONT_PAIRINGS.filter(pairing => 
        pairing.heading === fontFamily || pairing.body === fontFamily
      );
    }
    
    // Return all pairings sorted by category
    // Create a copy to avoid mutating the shared constant
    return [...FONT_PAIRINGS].sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return 0;
    });
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

// Predefined Color Schemes Library (50+ restaurant color palettes)
export const PREDEFINED_COLOR_SCHEMES: ColorPaletteData[] = [
  // Fine Dining Palettes
  { name: 'Classic Elegance', primaryColor: '#1a1a1a', secondaryColor: '#d4af37', accentColor: '#8b7355', backgroundColor: '#f5f5f0', textColor: '#2c2c2c', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Royal Gold', primaryColor: '#2c1810', secondaryColor: '#d4af37', accentColor: '#8b6914', backgroundColor: '#fffef7', textColor: '#1a1a1a', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Midnight Blue', primaryColor: '#0d1b2a', secondaryColor: '#415a77', accentColor: '#778da9', backgroundColor: '#f8f9fa', textColor: '#212529', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Burgundy Luxury', primaryColor: '#6b2c3e', secondaryColor: '#8b4a5c', accentColor: '#a67c7c', backgroundColor: '#faf8f5', textColor: '#2c1810', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Forest Green', primaryColor: '#1b4332', secondaryColor: '#2d6a4f', accentColor: '#40916c', backgroundColor: '#f1f8f4', textColor: '#081c15', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  
  // Casual Dining Palettes
  { name: 'Warm Terracotta', primaryColor: '#c97d60', secondaryColor: '#e07a5f', accentColor: '#f2cc8f', backgroundColor: '#fff8f0', textColor: '#3d405b', successColor: '#81b29a', warningColor: '#f2cc8f', errorColor: '#e07a5f' },
  { name: 'Sunset Orange', primaryColor: '#ff6b35', secondaryColor: '#f7931e', accentColor: '#ffc857', backgroundColor: '#fffef0', textColor: '#2c1810', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Ocean Breeze', primaryColor: '#0077be', secondaryColor: '#00a8e8', accentColor: '#89cff0', backgroundColor: '#f0f8ff', textColor: '#1a1a2e', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Lavender Dream', primaryColor: '#6c5ce7', secondaryColor: '#a29bfe', accentColor: '#dfe6e9', backgroundColor: '#f8f9fa', textColor: '#2d3436', successColor: '#00b894', warningColor: '#fdcb6e', errorColor: '#d63031' },
  { name: 'Rustic Brown', primaryColor: '#8b4513', secondaryColor: '#a0522d', accentColor: '#cd853f', backgroundColor: '#fff8dc', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  
  // Modern Café Palettes
  { name: 'Espresso', primaryColor: '#3e2723', secondaryColor: '#5d4037', accentColor: '#8d6e63', backgroundColor: '#fafafa', textColor: '#212121', successColor: '#66bb6a', warningColor: '#ffa726', errorColor: '#ef5350' },
  { name: 'Mint Fresh', primaryColor: '#00b894', secondaryColor: '#00cec9', accentColor: '#55efc4', backgroundColor: '#ffffff', textColor: '#2d3436', successColor: '#00b894', warningColor: '#fdcb6e', errorColor: '#d63031' },
  { name: 'Coral Reef', primaryColor: '#ff7675', secondaryColor: '#fd79a8', accentColor: '#fdcb6e', backgroundColor: '#fffef0', textColor: '#2d3436', successColor: '#00b894', warningColor: '#fdcb6e', errorColor: '#d63031' },
  { name: 'Sky Blue', primaryColor: '#0984e3', secondaryColor: '#74b9ff', accentColor: '#dfe6e9', backgroundColor: '#ffffff', textColor: '#2d3436', successColor: '#00b894', warningColor: '#fdcb6e', errorColor: '#d63031' },
  { name: 'Peach Blush', primaryColor: '#fd79a8', secondaryColor: '#fdcb6e', accentColor: '#ffeaa7', backgroundColor: '#fffef0', textColor: '#2d3436', successColor: '#00b894', warningColor: '#fdcb6e', errorColor: '#d63031' },
  
  // Italian Restaurant Palettes
  { name: 'Italian Red', primaryColor: '#c41e3a', secondaryColor: '#dc143c', accentColor: '#8b0000', backgroundColor: '#fff5ee', textColor: '#2c1810', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c41e3a' },
  { name: 'Tuscan Sun', primaryColor: '#d2691e', secondaryColor: '#cd853f', accentColor: '#daa520', backgroundColor: '#fffef0', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Olive Grove', primaryColor: '#556b2f', secondaryColor: '#6b8e23', accentColor: '#9acd32', backgroundColor: '#f5f5dc', textColor: '#2c1810', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  
  // Asian Restaurant Palettes
  { name: 'Cherry Blossom', primaryColor: '#d81b60', secondaryColor: '#e91e63', accentColor: '#f06292', backgroundColor: '#fffef0', textColor: '#1a1a1a', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Bamboo Green', primaryColor: '#2e7d32', secondaryColor: '#388e3c', accentColor: '#66bb6a', backgroundColor: '#f1f8f4', textColor: '#1b5e20', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Dragon Red', primaryColor: '#b71c1c', secondaryColor: '#c62828', accentColor: '#d32f2f', backgroundColor: '#fff5f5', textColor: '#1a0000', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#b71c1c' },
  
  // Mexican Restaurant Palettes
  { name: 'Fiesta', primaryColor: '#e63946', secondaryColor: '#f77f00', accentColor: '#fcbf49', backgroundColor: '#fffef0', textColor: '#1a1a1a', successColor: '#4caf50', warningColor: '#f77f00', errorColor: '#e63946' },
  { name: 'Desert Sunset', primaryColor: '#d2691e', secondaryColor: '#cd853f', accentColor: '#daa520', backgroundColor: '#fff8dc', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  
  // Seafood Restaurant Palettes
  { name: 'Ocean Deep', primaryColor: '#0d47a1', secondaryColor: '#1565c0', accentColor: '#42a5f5', backgroundColor: '#e3f2fd', textColor: '#0d47a1', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Aqua Marine', primaryColor: '#00695c', secondaryColor: '#00897b', accentColor: '#26a69a', backgroundColor: '#e0f2f1', textColor: '#004d40', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  
  // Bakery/Café Palettes
  { name: 'Vanilla Cream', primaryColor: '#8b7355', secondaryColor: '#a0826d', accentColor: '#d4af37', backgroundColor: '#fffef7', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Chocolate', primaryColor: '#3e2723', secondaryColor: '#5d4037', accentColor: '#8d6e63', backgroundColor: '#fff8e1', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  
  // More Fine Dining
  { name: 'Platinum', primaryColor: '#424242', secondaryColor: '#616161', accentColor: '#9e9e9e', backgroundColor: '#fafafa', textColor: '#212121', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Ivory Elegance', primaryColor: '#5d4e37', secondaryColor: '#8b7355', accentColor: '#c9a961', backgroundColor: '#fffef7', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Wine Cellar', primaryColor: '#4a148c', secondaryColor: '#6a1b9a', accentColor: '#9c27b0', backgroundColor: '#f3e5f5', textColor: '#1a0000', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  
  // More Casual
  { name: 'Farm Fresh', primaryColor: '#558b2f', secondaryColor: '#689f38', accentColor: '#8bc34a', backgroundColor: '#f1f8e9', textColor: '#33691e', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Country Kitchen', primaryColor: '#8d6e63', secondaryColor: '#a1887f', accentColor: '#bcaaa4', backgroundColor: '#fafafa', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Garden Party', primaryColor: '#2e7d32', secondaryColor: '#388e3c', accentColor: '#66bb6a', backgroundColor: '#e8f5e9', textColor: '#1b5e20', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  
  // Modern Minimalist
  { name: 'Monochrome', primaryColor: '#212121', secondaryColor: '#424242', accentColor: '#616161', backgroundColor: '#ffffff', textColor: '#212121', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Clean White', primaryColor: '#757575', secondaryColor: '#9e9e9e', accentColor: '#bdbdbd', backgroundColor: '#ffffff', textColor: '#212121', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Charcoal', primaryColor: '#212121', secondaryColor: '#424242', accentColor: '#757575', backgroundColor: '#f5f5f5', textColor: '#212121', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  
  // Vibrant & Bold
  { name: 'Electric Blue', primaryColor: '#0d47a1', secondaryColor: '#1976d2', accentColor: '#42a5f5', backgroundColor: '#e3f2fd', textColor: '#0d47a1', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Vibrant Purple', primaryColor: '#4a148c', secondaryColor: '#7b1fa2', accentColor: '#ba68c8', backgroundColor: '#f3e5f5', textColor: '#1a0000', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Hot Pink', primaryColor: '#880e4f', secondaryColor: '#c2185b', accentColor: '#f06292', backgroundColor: '#fce4ec', textColor: '#1a0000', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  
  // Earth Tones
  { name: 'Sage Green', primaryColor: '#558b2f', secondaryColor: '#689f38', accentColor: '#9ccc65', backgroundColor: '#f1f8e9', textColor: '#33691e', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Terracotta', primaryColor: '#bf360c', secondaryColor: '#d84315', accentColor: '#ff6f00', backgroundColor: '#fff3e0', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Sandstone', primaryColor: '#8d6e63', secondaryColor: '#a1887f', accentColor: '#bcaaa4', backgroundColor: '#fafafa', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  
  // Coastal
  { name: 'Beach House', primaryColor: '#0277bd', secondaryColor: '#0288d1', accentColor: '#81d4fa', backgroundColor: '#e1f5fe', textColor: '#01579b', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Seashell', primaryColor: '#5d4037', secondaryColor: '#6d4c41', accentColor: '#8d6e63', backgroundColor: '#fff8e1', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  
  // More options to reach 50+
  { name: 'Amber Glow', primaryColor: '#ff6f00', secondaryColor: '#ff8f00', accentColor: '#ffb300', backgroundColor: '#fff8e1', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Emerald', primaryColor: '#004d40', secondaryColor: '#00695c', accentColor: '#26a69a', backgroundColor: '#e0f2f1', textColor: '#004d40', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Rose Gold', primaryColor: '#b71c1c', secondaryColor: '#c62828', accentColor: '#e57373', backgroundColor: '#ffebee', textColor: '#1a0000', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Slate Blue', primaryColor: '#283593', secondaryColor: '#3949ab', accentColor: '#5c6bc0', backgroundColor: '#e8eaf6', textColor: '#1a237e', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Mocha', primaryColor: '#3e2723', secondaryColor: '#5d4037', accentColor: '#8d6e63', backgroundColor: '#efebe9', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Lime Fresh', primaryColor: '#827717', secondaryColor: '#9e9d24', accentColor: '#c5ca33', backgroundColor: '#f9fbe7', textColor: '#33691e', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Crimson', primaryColor: '#b71c1c', secondaryColor: '#c62828', accentColor: '#d32f2f', backgroundColor: '#ffebee', textColor: '#1a0000', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Teal', primaryColor: '#004d40', secondaryColor: '#00796b', accentColor: '#00897b', backgroundColor: '#e0f2f1', textColor: '#004d40', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Indigo', primaryColor: '#1a237e', secondaryColor: '#283593', accentColor: '#3949ab', backgroundColor: '#e8eaf6', textColor: '#1a237e', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Coral', primaryColor: '#d84315', secondaryColor: '#e64a19', accentColor: '#ff5722', backgroundColor: '#fff3e0', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Turquoise', primaryColor: '#006064', secondaryColor: '#00838f', accentColor: '#00acc1', backgroundColor: '#e0f7fa', textColor: '#004d40', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Magenta', primaryColor: '#880e4f', secondaryColor: '#ad1457', accentColor: '#c2185b', backgroundColor: '#fce4ec', textColor: '#1a0000', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Navy', primaryColor: '#0d47a1', secondaryColor: '#1565c0', accentColor: '#1976d2', backgroundColor: '#e3f2fd', textColor: '#0d47a1', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Olive', primaryColor: '#558b2f', secondaryColor: '#689f38', accentColor: '#7cb342', backgroundColor: '#f1f8e9', textColor: '#33691e', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Maroon', primaryColor: '#b71c1c', secondaryColor: '#c62828', accentColor: '#d32f2f', backgroundColor: '#ffebee', textColor: '#1a0000', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Cyan', primaryColor: '#006064', secondaryColor: '#00838f', accentColor: '#00bcd4', backgroundColor: '#e0f7fa', textColor: '#004d40', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Amethyst', primaryColor: '#4a148c', secondaryColor: '#6a1b9a', accentColor: '#9c27b0', backgroundColor: '#f3e5f5', textColor: '#1a0000', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Topaz', primaryColor: '#ff6f00', secondaryColor: '#ff8f00', accentColor: '#ffa726', backgroundColor: '#fff3e0', textColor: '#3e2723', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' },
  { name: 'Jade', primaryColor: '#004d40', secondaryColor: '#00695c', accentColor: '#26a69a', backgroundColor: '#e0f2f1', textColor: '#004d40', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#d32f2f' },
  { name: 'Ruby', primaryColor: '#b71c1c', secondaryColor: '#c62828', accentColor: '#e57373', backgroundColor: '#ffebee', textColor: '#1a0000', successColor: '#4caf50', warningColor: '#ff9800', errorColor: '#c62828' }
];

// Color extraction using Canvas API (client-side) or server-side library
export async function extractColorsFromImage(imageUrl: string): Promise<string[]> {
  try {
    // For server-side, we can use a library like 'node-vibrant' or 'colorthief'
    // For now, return a placeholder that will be implemented with actual extraction
    // Client-side extraction will be handled in the frontend component
    
    // TODO: Implement server-side color extraction using a library
    // Example with node-vibrant (would need to be installed):
    // const vibrant = require('node-vibrant');
    // const palette = await vibrant.from(imageUrl).getPalette();
    // return Object.values(palette).map(color => color.hex);
    
    // Placeholder return
    return [
      '#8B4513', // Saddle Brown
      '#DEB887', // Burlywood  
      '#F4A460', // Sandy Brown
      '#CD853F', // Peru
      '#D2691E'  // Chocolate
    ];
  } catch (error) {
    console.error('Error extracting colors:', error);
    // Return default colors on error
    return ['#1976d2', '#dc004e', '#333333'];
  }
}

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
export function validateColorPaletteAccessibility(palette: ColorPaletteData): {
  isValid: boolean;
  contrastRatio: number;
  wcagLevel: 'AA' | 'AAA' | 'FAIL';
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check text/background contrast
  const textBgContrast = calculateContrastRatio(palette.textColor, palette.backgroundColor);
  const primaryBgContrast = calculateContrastRatio(palette.primaryColor, palette.backgroundColor);
  
  let wcagLevel: 'AA' | 'AAA' | 'FAIL' = 'FAIL';
  
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

// Get predefined color schemes
export function getPredefinedColorSchemes(): ColorPaletteData[] {
  return PREDEFINED_COLOR_SCHEMES;
} 