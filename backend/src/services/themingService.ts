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

// Color accessibility utilities
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    
    const toLinear = (c: number) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

export function getWCAGLevel(contrastRatio: number): 'AA' | 'AAA' | 'FAIL' {
  if (contrastRatio >= 7) return 'AAA';
  if (contrastRatio >= 4.5) return 'AA';
  return 'FAIL';
}

// Color extraction from images (placeholder for future implementation)
export async function extractColorsFromImage(imageUrl: string): Promise<string[]> {
  // TODO: Implement color extraction using canvas or external service
  // For now, return some default colors
  return ['#1976d2', '#dc004e', '#333333', '#ffffff', '#f5f5f5'];
}

export const themingService = {
  // Color Palette Methods
  async getColorPalettes(restaurantId: number) {
    return await prisma.colorPalette.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' }
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
    // Calculate accessibility metrics
    const contrastRatio = calculateContrastRatio(data.textColor, data.backgroundColor);
    const wcagLevel = getWCAGLevel(contrastRatio);

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
        contrastRatio,
        wcagLevel: wcagLevel !== 'FAIL' ? wcagLevel : null,
        isActive: false // New palettes are not active by default
      }
    });
  },

  async updateColorPalette(paletteId: string, data: Partial<ColorPaletteData>) {
    const updateData: any = { ...data };
    
    // Recalculate accessibility if text or background colors changed
    if (data.textColor || data.backgroundColor) {
      const palette = await prisma.colorPalette.findUnique({
        where: { id: paletteId }
      });
      
      if (palette) {
        const textColor = data.textColor || palette.textColor;
        const backgroundColor = data.backgroundColor || palette.backgroundColor;
        const contrastRatio = calculateContrastRatio(textColor, backgroundColor);
        const wcagLevel = getWCAGLevel(contrastRatio);
        
        updateData.contrastRatio = contrastRatio;
        updateData.wcagLevel = wcagLevel !== 'FAIL' ? wcagLevel : null;
      }
    }

    return await prisma.colorPalette.update({
      where: { id: paletteId },
      data: updateData
    });
  },

  async setActiveColorPalette(restaurantId: number, paletteId: string) {
    // First, deactivate all palettes for this restaurant
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
      orderBy: { createdAt: 'desc' }
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
    // First, deactivate all configs for this restaurant
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

  // Brand Asset Methods
  async getBrandAssets(restaurantId: number, assetType?: string) {
    const where: any = { restaurantId };
    if (assetType) {
      where.assetType = assetType;
    }

    return await prisma.brandAsset.findMany({
      where,
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
    // First, remove primary status from all assets of this type
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

  // Predefined Color Schemes
  async getPredefinedColorSchemes() {
    return [
      {
        name: 'Classic Restaurant',
        primaryColor: '#8B4513',
        secondaryColor: '#D2691E',
        accentColor: '#2F1B14',
        backgroundColor: '#FFFEF7',
        textColor: '#2F1B14'
      },
      {
        name: 'Modern Minimalist',
        primaryColor: '#2E2E2E',
        secondaryColor: '#FFD700',
        accentColor: '#4A4A4A',
        backgroundColor: '#FFFFFF',
        textColor: '#2E2E2E'
      },
      {
        name: 'Mediterranean Blue',
        primaryColor: '#1E3A8A',
        secondaryColor: '#3B82F6',
        accentColor: '#1E40AF',
        backgroundColor: '#F8FAFC',
        textColor: '#1E293B'
      },
      {
        name: 'Warm Bistro',
        primaryColor: '#DC2626',
        secondaryColor: '#F59E0B',
        accentColor: '#7C2D12',
        backgroundColor: '#FEF3C7',
        textColor: '#7C2D12'
      },
      {
        name: 'Fresh Green',
        primaryColor: '#059669',
        secondaryColor: '#10B981',
        accentColor: '#047857',
        backgroundColor: '#F0FDF4',
        textColor: '#064E3B'
      },
      {
        name: 'Elegant Purple',
        primaryColor: '#7C3AED',
        secondaryColor: '#A855F7',
        accentColor: '#5B21B6',
        backgroundColor: '#FAF5FF',
        textColor: '#4C1D95'
      }
    ];
  }
}; 