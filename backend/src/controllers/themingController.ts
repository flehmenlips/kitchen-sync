import { Request, Response } from 'express';
import { 
  themingService, 
  ColorPaletteData, 
  TypographyConfigData, 
  BrandAssetData,
  extractColorsFromImage 
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
      const paletteData: ColorPaletteData = req.body;
      
      const palette = await themingService.createColorPalette(restaurantId, paletteData);
      res.status(201).json(palette);
    } catch (error) {
      console.error('Error creating color palette:', error);
      res.status(500).json({ error: 'Failed to create color palette' });
    }
  },

  async updateColorPalette(req: Request, res: Response) {
    try {
      const paletteId = req.params.paletteId;
      const updateData: Partial<ColorPaletteData> = req.body;
      
      const palette = await themingService.updateColorPalette(paletteId, updateData);
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
      const configData: TypographyConfigData = req.body;
      
      const config = await themingService.createTypographyConfig(restaurantId, configData);
      res.status(201).json(config);
    } catch (error) {
      console.error('Error creating typography config:', error);
      res.status(500).json({ error: 'Failed to create typography config' });
    }
  },

  async updateTypographyConfig(req: Request, res: Response) {
    try {
      const configId = req.params.configId;
      const updateData: Partial<TypographyConfigData> = req.body;
      
      const config = await themingService.updateTypographyConfig(configId, updateData);
      res.json(config);
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
      const assetData: BrandAssetData = req.body;
      
      const asset = await themingService.createBrandAsset(restaurantId, assetData);
      res.status(201).json(asset);
    } catch (error) {
      console.error('Error creating brand asset:', error);
      res.status(500).json({ error: 'Failed to create brand asset' });
    }
  },

  async updateBrandAsset(req: Request, res: Response) {
    try {
      const assetId = req.params.assetId;
      const updateData: Partial<BrandAssetData> = req.body;
      
      const asset = await themingService.updateBrandAsset(assetId, updateData);
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
      
      const colors = await extractColorsFromImage(imageUrl);
      res.json({ colors });
    } catch (error) {
      console.error('Error extracting colors from image:', error);
      res.status(500).json({ error: 'Failed to extract colors from image' });
    }
  },

  // Google Fonts Integration (placeholder for future implementation)
  async getGoogleFonts(req: Request, res: Response) {
    try {
      // TODO: Implement Google Fonts API integration
      // For now, return a curated list of popular restaurant fonts
      const fonts = [
        {
          family: 'Playfair Display',
          category: 'serif',
          variants: ['400', '400i', '700', '700i'],
          popularity: 95,
          pairing: ['Open Sans', 'Source Sans Pro', 'Lato']
        },
        {
          family: 'Open Sans',
          category: 'sans-serif',
          variants: ['300', '400', '600', '700'],
          popularity: 99,
          pairing: ['Playfair Display', 'Merriweather', 'Lora']
        },
        {
          family: 'Lora',
          category: 'serif',
          variants: ['400', '400i', '700', '700i'],
          popularity: 85,
          pairing: ['Open Sans', 'Source Sans Pro', 'Montserrat']
        },
        {
          family: 'Montserrat',
          category: 'sans-serif',
          variants: ['300', '400', '500', '600', '700'],
          popularity: 90,
          pairing: ['Lora', 'Playfair Display', 'Crimson Text']
        },
        {
          family: 'Roboto',
          category: 'sans-serif',
          variants: ['300', '400', '500', '700'],
          popularity: 98,
          pairing: ['Playfair Display', 'Merriweather', 'Lora']
        },
        {
          family: 'Merriweather',
          category: 'serif',
          variants: ['300', '400', '700', '900'],
          popularity: 80,
          pairing: ['Open Sans', 'Source Sans Pro', 'Roboto']
        }
      ];
      
      res.json(fonts);
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
      res.status(500).json({ error: 'Failed to fetch Google Fonts' });
    }
  },

  async getFontPairings(req: Request, res: Response) {
    try {
      const { fontFamily } = req.query;
      
      // TODO: Implement intelligent font pairing algorithm
      // For now, return predefined pairings
      const pairings: Record<string, string[]> = {
        'Playfair Display': ['Open Sans', 'Source Sans Pro', 'Lato', 'Roboto'],
        'Open Sans': ['Playfair Display', 'Merriweather', 'Lora', 'Crimson Text'],
        'Lora': ['Open Sans', 'Source Sans Pro', 'Montserrat', 'Roboto'],
        'Montserrat': ['Lora', 'Playfair Display', 'Crimson Text', 'Merriweather'],
        'Roboto': ['Playfair Display', 'Merriweather', 'Lora', 'Crimson Text'],
        'Merriweather': ['Open Sans', 'Source Sans Pro', 'Roboto', 'Montserrat']
      };
      
      const suggestions = pairings[fontFamily as string] || [];
      res.json({ suggestions });
    } catch (error) {
      console.error('Error fetching font pairings:', error);
      res.status(500).json({ error: 'Failed to fetch font pairings' });
    }
  }
}; 