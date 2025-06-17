import { Request, Response } from 'express';
import { pageService } from '../services/pageService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/pages - List all pages for restaurant
export const getPages = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const pages = await pageService.getPagesWithContentCounts(restaurantId);
    res.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

// GET /api/pages/:id - Get specific page
export const getPageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const pageId = parseInt(id);
    if (isNaN(pageId)) {
      return res.status(400).json({ error: 'Invalid page ID' });
    }

    const page = await pageService.getPageById(pageId, restaurantId);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
};

// POST /api/pages - Create new page
export const createPage = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const { name, slug, title, description, template, isActive, metaTitle, metaDescription, metaKeywords } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const page = await pageService.createPage(restaurantId, {
      name,
      slug,
      title,
      description,
      template,
      isActive,
      metaTitle,
      metaDescription,
      metaKeywords
    });

    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create page' });
  }
};

// PUT /api/pages/:id - Update page
export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const pageId = parseInt(id);
    if (isNaN(pageId)) {
      return res.status(400).json({ error: 'Invalid page ID' });
    }

    const { name, slug, title, description, template, isActive, metaTitle, metaDescription, metaKeywords } = req.body;

    const page = await pageService.updatePage(pageId, restaurantId, {
      name,
      slug,
      title,
      description,
      template,
      isActive,
      metaTitle,
      metaDescription,
      metaKeywords
    });

    res.json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update page' });
  }
};

// DELETE /api/pages/:id - Delete page
export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const pageId = parseInt(id);
    if (isNaN(pageId)) {
      return res.status(400).json({ error: 'Invalid page ID' });
    }

    await pageService.deletePage(pageId, restaurantId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting page:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Cannot delete system pages')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete page' });
  }
};

// PUT /api/pages/reorder - Reorder pages
export const reorderPages = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const { pageOrders } = req.body;

    if (!Array.isArray(pageOrders)) {
      return res.status(400).json({ error: 'pageOrders must be an array' });
    }

    await pageService.reorderPages(restaurantId, pageOrders);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering pages:', error);
    res.status(500).json({ error: 'Failed to reorder pages' });
  }
};

// POST /api/pages/:id/duplicate - Duplicate page
export const duplicatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const pageId = parseInt(id);
    if (isNaN(pageId)) {
      return res.status(400).json({ error: 'Invalid page ID' });
    }

    // Get the original page
    const originalPage = await pageService.getPageById(pageId, restaurantId);
    if (!originalPage) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Create duplicate with modified name and slug
    const duplicateName = `${originalPage.name} Copy`;
    const duplicateSlug = `${originalPage.slug}-copy`;

    const duplicatedPage = await pageService.createPage(restaurantId, {
      name: duplicateName,
      slug: duplicateSlug,
      title: originalPage.title || undefined,
      description: originalPage.description || undefined,
      template: originalPage.template,
      isActive: originalPage.isActive,
      metaTitle: originalPage.metaTitle || undefined,
      metaDescription: originalPage.metaDescription || undefined,
      metaKeywords: originalPage.metaKeywords || undefined
    });

    res.status(201).json(duplicatedPage);
  } catch (error) {
    console.error('Error duplicating page:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(400).json({ error: 'A page with this name already exists. Please choose a different name.' });
    }
    res.status(500).json({ error: 'Failed to duplicate page' });
  }
};

// Public endpoint for customer portal - Get page by slug
export const getPublicPageBySlug = async (req: Request, res: Response) => {
  try {
    const { restaurantSlug, pageSlug } = req.params;

    // Get restaurant by slug
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
      select: { id: true, name: true, slug: true }
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get page by slug for this restaurant (only active pages)
    const page = await prisma.page.findFirst({
      where: {
        restaurantId: restaurant.id,
        slug: pageSlug,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        title: true,
        description: true,
        template: true,
        displayOrder: true,
        isActive: true,
        isSystem: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({
      ...page,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug
      }
    });
  } catch (error) {
    console.error('Error fetching public page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
}; 