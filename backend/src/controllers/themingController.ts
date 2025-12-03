import { Request, Response } from 'express';
import { 
  themingService, 
  ColorPaletteData, 
  TypographyConfigData, 
  BrandAssetData,
  getPredefinedColorSchemes,
  extractColorsFromImage as extractColors
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
      const schemes = await themingService.getPredefinedColorSchemes();
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
      
      const colors = await themingService.extractColorsFromImage(imageUrl);
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