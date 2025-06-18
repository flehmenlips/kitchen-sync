import { Request, Response } from 'express';
import { 
  themingService, 
  ColorPaletteData, 
  TypographyConfigData, 
  BrandAssetData
} from '../services/themingService';

export const themingController = {
  // Color Palette Endpoints
  async getColorPalettes(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const palettes = await themingService.getColorPalettes(restaurantId);
      res.json(palettes);
    } catch (error) {
      console.error('Error fetching color palettes:', error);
      res.status(500).json({ error: 'Failed to fetch color palettes' });
    }
  },

  async getActiveColorPalette(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const palette = await themingService.getActiveColorPalette(restaurantId);
      res.json(palette);
    } catch (error) {
      console.error('Error fetching active color palette:', error);
      res.status(500).json({ error: 'Failed to fetch active color palette' });
    }
  },

  async createColorPalette(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const data: ColorPaletteData = req.body;
      const palette = await themingService.createColorPalette(restaurantId, data);
      res.status(201).json(palette);
    } catch (error) {
      console.error('Error creating color palette:', error);
      res.status(500).json({ error: 'Failed to create color palette' });
    }
  },

  async updateColorPalette(req: Request, res: Response) {
    try {
      const paletteId = req.params.paletteId;
      const data: Partial<ColorPaletteData> = req.body;
      const palette = await themingService.updateColorPalette(paletteId, data);
      res.json(palette);
    } catch (error) {
      console.error('Error updating color palette:', error);
      res.status(500).json({ error: 'Failed to update color palette' });
    }
  },

  async setActiveColorPalette(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const paletteId = req.params.paletteId;
      const palette = await themingService.setActiveColorPalette(restaurantId, paletteId);
      res.json(palette);
    } catch (error) {
      console.error('Error setting active color palette:', error);
      res.status(500).json({ error: 'Failed to set active color palette' });
    }
  },

  async deleteColorPalette(req: Request, res: Response) {
    try {
      const paletteId = req.params.paletteId;
      await themingService.deleteColorPalette(paletteId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting color palette:', error);
      res.status(500).json({ error: 'Failed to delete color palette' });
    }
  },

  // Typography Configuration Endpoints
  async getTypographyConfigs(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const configs = await themingService.getTypographyConfigs(restaurantId);
      res.json(configs);
    } catch (error) {
      console.error('Error fetching typography configs:', error);
      res.status(500).json({ error: 'Failed to fetch typography configs' });
    }
  },

  async getActiveTypographyConfig(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const config = await themingService.getActiveTypographyConfig(restaurantId);
      res.json(config);
    } catch (error) {
      console.error('Error fetching active typography config:', error);
      res.status(500).json({ error: 'Failed to fetch active typography config' });
    }
  },

  async createTypographyConfig(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const data: TypographyConfigData = req.body;
      
      // Validate typography accessibility
      const validation = themingService.validateTypographyAccessibility(data);
      
      const config = await themingService.createTypographyConfig(restaurantId, data);
      
      // Include validation results in response
      res.status(201).json({
        ...config,
        validation
      });
    } catch (error) {
      console.error('Error creating typography config:', error);
      res.status(500).json({ error: 'Failed to create typography config' });
    }
  },

  async updateTypographyConfig(req: Request, res: Response) {
    try {
      const configId = req.params.configId;
      const data: Partial<TypographyConfigData> = req.body;
      
      // Validate typography accessibility if full config provided
      let validation;
      if (data.fontSizes && data.lineHeights && data.headingFontFamily && data.bodyFontFamily) {
        validation = themingService.validateTypographyAccessibility(data as TypographyConfigData);
      }
      
      const config = await themingService.updateTypographyConfig(configId, data);
      
      res.json({
        ...config,
        ...(validation && { validation })
      });
    } catch (error) {
      console.error('Error updating typography config:', error);
      res.status(500).json({ error: 'Failed to update typography config' });
    }
  },

  async setActiveTypographyConfig(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const configId = req.params.configId;
      const config = await themingService.setActiveTypographyConfig(restaurantId, configId);
      res.json(config);
    } catch (error) {
      console.error('Error setting active typography config:', error);
      res.status(500).json({ error: 'Failed to set active typography config' });
    }
  },

  async deleteTypographyConfig(req: Request, res: Response) {
    try {
      const configId = req.params.configId;
      await themingService.deleteTypographyConfig(configId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting typography config:', error);
      res.status(500).json({ error: 'Failed to delete typography config' });
    }
  },

  // Brand Asset Endpoints
  async getBrandAssets(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const assetType = req.query.type as string;
      const assets = await themingService.getBrandAssets(restaurantId, assetType);
      res.json(assets);
    } catch (error) {
      console.error('Error fetching brand assets:', error);
      res.status(500).json({ error: 'Failed to fetch brand assets' });
    }
  },

  async createBrandAsset(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const data: BrandAssetData = req.body;
      const asset = await themingService.createBrandAsset(restaurantId, data);
      res.status(201).json(asset);
    } catch (error) {
      console.error('Error creating brand asset:', error);
      res.status(500).json({ error: 'Failed to create brand asset' });
    }
  },

  async updateBrandAsset(req: Request, res: Response) {
    try {
      const assetId = req.params.assetId;
      const data: Partial<BrandAssetData> = req.body;
      const asset = await themingService.updateBrandAsset(assetId, data);
      res.json(asset);
    } catch (error) {
      console.error('Error updating brand asset:', error);
      res.status(500).json({ error: 'Failed to update brand asset' });
    }
  },

  async setPrimaryBrandAsset(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const assetId = req.params.assetId;
      const { assetType } = req.body;
      const asset = await themingService.setPrimaryBrandAsset(restaurantId, assetId, assetType);
      res.json(asset);
    } catch (error) {
      console.error('Error setting primary brand asset:', error);
      res.status(500).json({ error: 'Failed to set primary brand asset' });
    }
  },

  async deleteBrandAsset(req: Request, res: Response) {
    try {
      const assetId = req.params.assetId;
      await themingService.deleteBrandAsset(assetId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting brand asset:', error);
      res.status(500).json({ error: 'Failed to delete brand asset' });
    }
  },

  // Utility Endpoints
  async getPredefinedColorSchemes(req: Request, res: Response) {
    try {
      // Predefined color schemes for restaurants
      const schemes = [
        {
          name: 'Classic Fine Dining',
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
          name: 'Fresh Garden',
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
        },
        {
          name: 'Rustic Brick',
          primaryColor: '#B91C1C',
          secondaryColor: '#DC2626',
          accentColor: '#7F1D1D',
          backgroundColor: '#FEF2F2',
          textColor: '#7F1D1D'
        },
        {
          name: 'Ocean Breeze',
          primaryColor: '#0EA5E9',
          secondaryColor: '#38BDF8',
          accentColor: '#0284C7',
          backgroundColor: '#F0F9FF',
          textColor: '#0C4A6E'
        },
        {
          name: 'Sunset Orange',
          primaryColor: '#EA580C',
          secondaryColor: '#FB923C',
          accentColor: '#C2410C',
          backgroundColor: '#FFF7ED',
          textColor: '#9A3412'
        },
        {
          name: 'Forest Green',
          primaryColor: '#166534',
          secondaryColor: '#22C55E',
          accentColor: '#14532D',
          backgroundColor: '#F0FDF4',
          textColor: '#14532D'
        },
        {
          name: 'Royal Gold',
          primaryColor: '#D97706',
          secondaryColor: '#F59E0B',
          accentColor: '#92400E',
          backgroundColor: '#FFFBEB',
          textColor: '#78350F'
        },
        {
          name: 'Vintage Wine',
          primaryColor: '#7C2D12',
          secondaryColor: '#DC2626',
          accentColor: '#451A03',
          backgroundColor: '#FEF2F2',
          textColor: '#451A03'
        }
      ];
      
      res.json(schemes);
    } catch (error) {
      console.error('Error fetching predefined color schemes:', error);
      res.status(500).json({ error: 'Failed to fetch predefined color schemes' });
    }
  },

  async extractColorsFromImage(req: Request, res: Response) {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }
      
      // TODO: Implement actual color extraction
      // For now, return sample colors based on common restaurant themes
      const colors = [
        '#8B4513', // Saddle Brown
        '#DEB887', // Burlywood  
        '#F4A460', // Sandy Brown
        '#CD853F', // Peru
        '#D2691E'  // Chocolate
      ];
      
      res.json({ colors });
    } catch (error) {
      console.error('Error extracting colors from image:', error);
      res.status(500).json({ error: 'Failed to extract colors from image' });
    }
  },

  async getGoogleFonts(req: Request, res: Response) {
    try {
      const fonts = await themingService.getGoogleFonts();
      res.json(fonts);
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
      res.status(500).json({ error: 'Failed to fetch Google Fonts' });
    }
  },

  async getFontPairings(req: Request, res: Response) {
    try {
      const fontFamily = req.query.fontFamily as string;
      const pairings = await themingService.getFontPairings(fontFamily);
      res.json({ suggestions: pairings });
    } catch (error) {
      console.error('Error fetching font pairings:', error);
      res.status(500).json({ error: 'Failed to fetch font pairings' });
    }
  },

  async getDefaultTypographyConfigs(req: Request, res: Response) {
    try {
      const configs = await themingService.getDefaultTypographyConfigs();
      res.json(configs);
    } catch (error) {
      console.error('Error fetching default typography configs:', error);
      res.status(500).json({ error: 'Failed to fetch default typography configs' });
    }
  },

  async createDefaultTypographyConfig(req: Request, res: Response) {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const { style } = req.body;
      
      if (!style) {
        return res.status(400).json({ error: 'Typography style is required' });
      }
      
      const config = await themingService.createDefaultTypographyConfig(restaurantId, style);
      res.status(201).json(config);
    } catch (error) {
      console.error('Error creating default typography config:', error);
      res.status(500).json({ error: 'Failed to create default typography config' });
    }
  },

  async validateTypography(req: Request, res: Response) {
    try {
      const data: TypographyConfigData = req.body;
      const validation = themingService.validateTypographyAccessibility(data);
      res.json(validation);
    } catch (error) {
      console.error('Error validating typography:', error);
      res.status(500).json({ error: 'Failed to validate typography' });
    }
  }
}; 