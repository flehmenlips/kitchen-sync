import { Request, Response } from 'express';
import { websiteBuilderService, PageCreationData } from '../services/websiteBuilderService';

export const getWebsiteBuilderData = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    const data = await websiteBuilderService.getWebsiteBuilderData(restaurantId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching website builder data:', error);
    res.status(500).json({ error: 'Failed to fetch website builder data' });
  }
};

export const updateWebsiteBuilderSettings = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    const settings = req.body;
    const updatedSettings = await websiteBuilderService.updateSettings(restaurantId, settings);
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating website builder settings:', error);
    res.status(500).json({ error: 'Failed to update website builder settings' });
  }
};

export const createWebsiteBuilderPage = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    const pageData: PageCreationData = req.body;
    const newPage = await websiteBuilderService.createPage(restaurantId, pageData);
    res.json(newPage);
  } catch (error) {
    console.error('Error creating website builder page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
};

export const deleteWebsiteBuilderPage = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    const { slug } = req.params;
    
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    await websiteBuilderService.deletePage(restaurantId, slug);
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting website builder page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
};

export const getPageTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await websiteBuilderService.getPageTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching page templates:', error);
    res.status(500).json({ error: 'Failed to fetch page templates' });
  }
}; 