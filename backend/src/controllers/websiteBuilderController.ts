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

export const updateWebsiteBuilderPage = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    const { slug } = req.params;
    
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    const pageData: Partial<PageCreationData> = req.body;
    const updatedPage = await websiteBuilderService.updatePage(restaurantId, slug, pageData);
    res.json(updatedPage);
  } catch (error) {
    console.error('Error updating website builder page:', error);
    res.status(500).json({ error: 'Failed to update page' });
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

export const updateContentBlock = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    const { slug, blockId } = req.params;
    
    // Add debug logging
    console.log('[updateContentBlock] Received data:', {
      restaurantId,
      slug,
      blockId,
      body: JSON.stringify(req.body, null, 2)
    });
    
    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant not found' });
    }

    const updatedBlock = await websiteBuilderService.updateContentBlock(
      restaurantId, 
      slug, 
      parseInt(blockId), 
      req.body
    );
    
    console.log('[updateContentBlock] Service returned:', JSON.stringify(updatedBlock, null, 2));
    
    res.json(updatedBlock);
  } catch (error) {
    console.error('Error updating content block:', error);
    res.status(500).json({ 
      message: 'Failed to update content block',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const createContentBlock = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    const { slug } = req.params;
    
    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant not found' });
    }

    const newBlock = await websiteBuilderService.createContentBlock(
      restaurantId, 
      slug, 
      req.body
    );
    res.status(201).json(newBlock);
  } catch (error) {
    console.error('Error creating content block:', error);
    res.status(500).json({ 
      message: 'Failed to create content block',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const deleteContentBlock = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    const { slug, blockId } = req.params;
    
    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant not found' });
    }

    await websiteBuilderService.deleteContentBlock(
      restaurantId, 
      slug, 
      parseInt(blockId)
    );
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting content block:', error);
    res.status(500).json({ 
      message: 'Failed to delete content block',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const reorderContentBlocks = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    const { slug } = req.params;
    const { blockOrder } = req.body; // Array of block IDs in new order
    
    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant not found' });
    }

    if (!Array.isArray(blockOrder)) {
      return res.status(400).json({ message: 'blockOrder must be an array' });
    }

    await websiteBuilderService.reorderContentBlocks(restaurantId, slug, blockOrder);
    res.status(204).send();
  } catch (error) {
    console.error('Error reordering content blocks:', error);
    res.status(500).json({ 
      message: 'Failed to reorder content blocks',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getContentBlockSchemas = async (req: Request, res: Response) => {
  try {
    const schemas = await websiteBuilderService.getContentBlockSchemas();
    res.json(schemas);
  } catch (error) {
    console.error('Error fetching content block schemas:', error);
    res.status(500).json({ error: 'Failed to fetch content block schemas' });
  }
}; 