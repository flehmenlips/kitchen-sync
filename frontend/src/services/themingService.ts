import { api } from './api';

export interface ColorPalette {
  id: string;
  restaurantId: number;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  contrastRatio?: number;
  wcagLevel?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface TypographyConfig {
  id: string;
  restaurantId: number;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  validation?: TypographyValidation;
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

export interface BrandAsset {
  id: string;
  restaurantId: number;
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
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface PredefinedColorScheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface TypographyValidation {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}

export interface DefaultTypographyConfigs {
  [key: string]: TypographyConfigData;
}

export const themingService = {
  // Color Palette Methods
  async getColorPalettes(restaurantId: number): Promise<ColorPalette[]> {
    const response = await api.get(`/theming/restaurants/${restaurantId}/color-palettes`);
    return response.data;
  },

  async getActiveColorPalette(restaurantId: number): Promise<ColorPalette | null> {
    const response = await api.get(`/theming/restaurants/${restaurantId}/color-palettes/active`);
    return response.data;
  },

  async createColorPalette(restaurantId: number, data: ColorPaletteData): Promise<ColorPalette> {
    const response = await api.post(`/theming/restaurants/${restaurantId}/color-palettes`, data);
    return response.data;
  },

  async updateColorPalette(paletteId: string, data: Partial<ColorPaletteData>): Promise<ColorPalette> {
    const response = await api.put(`/theming/color-palettes/${paletteId}`, data);
    return response.data;
  },

  async setActiveColorPalette(restaurantId: number, paletteId: string): Promise<ColorPalette> {
    const response = await api.post(`/theming/restaurants/${restaurantId}/color-palettes/${paletteId}/activate`);
    return response.data;
  },

  async deleteColorPalette(paletteId: string): Promise<void> {
    await api.delete(`/theming/color-palettes/${paletteId}`);
  },

  // Typography Configuration Methods
  async getTypographyConfigs(restaurantId: number): Promise<TypographyConfig[]> {
    const response = await api.get(`/theming/restaurants/${restaurantId}/typography-configs`);
    return response.data;
  },

  async getActiveTypographyConfig(restaurantId: number): Promise<TypographyConfig | null> {
    const response = await api.get(`/theming/restaurants/${restaurantId}/typography-configs/active`);
    return response.data;
  },

  async createTypographyConfig(restaurantId: number, data: TypographyConfigData): Promise<TypographyConfig> {
    const response = await api.post(`/theming/restaurants/${restaurantId}/typography-configs`, data);
    return response.data;
  },

  async updateTypographyConfig(configId: string, data: Partial<TypographyConfigData>): Promise<TypographyConfig> {
    const response = await api.put(`/theming/typography-configs/${configId}`, data);
    return response.data;
  },

  async setActiveTypographyConfig(restaurantId: number, configId: string): Promise<TypographyConfig> {
    const response = await api.post(`/theming/restaurants/${restaurantId}/typography-configs/${configId}/activate`);
    return response.data;
  },

  async deleteTypographyConfig(configId: string): Promise<void> {
    await api.delete(`/theming/typography-configs/${configId}`);
  },

  // Brand Asset Methods
  async getBrandAssets(restaurantId: number, assetType?: string): Promise<BrandAsset[]> {
    const params = assetType ? { type: assetType } : {};
    const response = await api.get(`/theming/restaurants/${restaurantId}/brand-assets`, { params });
    return response.data;
  },

  async createBrandAsset(restaurantId: number, data: BrandAssetData): Promise<BrandAsset> {
    const response = await api.post(`/theming/restaurants/${restaurantId}/brand-assets`, data);
    return response.data;
  },

  async updateBrandAsset(assetId: string, data: Partial<BrandAssetData>): Promise<BrandAsset> {
    const response = await api.put(`/theming/brand-assets/${assetId}`, data);
    return response.data;
  },

  async setPrimaryBrandAsset(restaurantId: number, assetId: string, assetType: string): Promise<BrandAsset> {
    const response = await api.post(`/theming/restaurants/${restaurantId}/brand-assets/${assetId}/set-primary`, {
      assetType
    });
    return response.data;
  },

  async deleteBrandAsset(assetId: string): Promise<void> {
    await api.delete(`/theming/brand-assets/${assetId}`);
  },

  // Utility Methods
  async getPredefinedColorSchemes(): Promise<PredefinedColorScheme[]> {
    const response = await api.get('/theming/predefined-color-schemes');
    return response.data;
  },

  async extractColorsFromImage(imageUrl: string): Promise<string[]> {
    const response = await api.post('/theming/extract-colors', { imageUrl });
    return response.data.colors;
  },

  async getGoogleFonts(): Promise<GoogleFont[]> {
    const response = await api.get('/theming/google-fonts');
    return response.data;
  },

  async getFontPairings(fontFamily?: string): Promise<FontPairing[]> {
    const params = fontFamily ? { fontFamily } : {};
    const response = await api.get('/theming/font-pairings', { params });
    return response.data.suggestions;
  },

  // Typography Utility Methods
  async getDefaultTypographyConfigs(): Promise<DefaultTypographyConfigs> {
    const response = await api.get('/theming/default-typography-configs');
    return response.data;
  },

  async createDefaultTypographyConfig(restaurantId: number, style: string): Promise<TypographyConfig> {
    const response = await api.post(`/theming/restaurants/${restaurantId}/default-typography-configs`, { style });
    return response.data;
  },

  async validateTypography(data: TypographyConfigData): Promise<TypographyValidation> {
    const response = await api.post('/theming/validate-typography', data);
    return response.data;
  }
}; 