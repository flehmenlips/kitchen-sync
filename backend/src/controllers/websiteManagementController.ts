import { Request, Response } from 'express';
import { websiteManagementService, WebsiteResetOptions } from '../services/websiteManagementService';

export const websiteManagementController = {
  // Get website summary
  async getWebsiteSummary(req: Request, res: Response) {
    try {
      const restaurantId = req.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const summary = await websiteManagementService.getWebsiteSummary(restaurantId);
      res.json(summary);
    } catch (error) {
      console.error('Error getting website summary:', error);
      res.status(500).json({ error: 'Failed to get website summary' });
    }
  },

  // Reset website to default template
  async resetWebsite(req: Request, res: Response) {
    try {
      const restaurantId = req.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const options: WebsiteResetOptions = {
        preserveAssets: req.body.preserveAssets !== false, // Default to true
        preserveSettings: req.body.preserveSettings === true
      };

      const result = await websiteManagementService.resetWebsite(restaurantId, options);
      res.json(result);
    } catch (error) {
      console.error('Error resetting website:', error);
      res.status(500).json({ error: 'Failed to reset website' });
    }
  },

  // Delete website completely
  async deleteWebsite(req: Request, res: Response) {
    try {
      const restaurantId = req.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const options: WebsiteResetOptions = {
        preserveAssets: req.body.preserveAssets !== false, // Default to true
        preserveSettings: req.body.preserveSettings === true
      };

      const result = await websiteManagementService.deleteWebsite(restaurantId, options);
      res.json(result);
    } catch (error) {
      console.error('Error deleting website:', error);
      res.status(500).json({ error: 'Failed to delete website' });
    }
  },

  // Get default template preview
  async getDefaultTemplate(req: Request, res: Response) {
    try {
      const template = websiteManagementService.getDefaultTemplate();
      res.json(template);
    } catch (error) {
      console.error('Error getting default template:', error);
      res.status(500).json({ error: 'Failed to get default template' });
    }
  }
};

