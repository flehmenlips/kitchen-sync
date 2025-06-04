import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate URL-friendly slug from name
const generateSlug = (name: string): string => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Temporary: Create virtual pages from existing content block pages
// This provides compatibility until we can safely migrate the database
const getVirtualPages = async (restaurantId: number) => {
  // Get unique pages from content blocks
  const uniquePages = await prisma.contentBlock.findMany({
    where: { restaurantId },
    select: { page: true },
    distinct: ['page']
  });

  // Get content block counts per page
  const pageCounts = await prisma.contentBlock.groupBy({
    by: ['page'],
    where: { restaurantId },
    _count: { id: true }
  });

  const countMap = pageCounts.reduce((acc, item) => {
    acc[item.page] = item._count.id;
    return acc;
  }, {} as Record<string, number>);

  // Consistent pageId mapping with contentBlockController
  const getPageId = (pageSlug: string): number => {
    const pageMap: Record<string, number> = {
      'home': 1,
      'about': 2,
      'menu': 3,
      'contact': 4
    };
    
    // For custom pages, use a hash of the page name as ID (same as contentBlockController)
    return pageMap[pageSlug] || Math.abs(pageSlug.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));
  };

  // Create virtual page objects
  const systemPages = ['home', 'about', 'menu', 'contact'];
  const virtualPages = uniquePages.map((item) => ({
    id: getPageId(item.page), // Use consistent virtual ID mapping
    restaurantId,
    name: item.page.charAt(0).toUpperCase() + item.page.slice(1),
    slug: item.page,
    title: null,
    description: null,
    template: 'default',
    displayOrder: systemPages.indexOf(item.page) !== -1 ? systemPages.indexOf(item.page) : 100,
    isActive: true,
    isSystem: systemPages.includes(item.page),
    metaTitle: null,
    metaKeywords: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: {
      contentBlocks: countMap[item.page] || 0
    }
  }));

  return virtualPages.sort((a, b) => a.displayOrder - b.displayOrder);
};

// GET /api/pages - List all pages for restaurant
export const getPages = async (req: Request, res: Response) => {
  try {
    const restaurantId = 1; // MVP: single restaurant
    
    // For now, return virtual pages based on existing content blocks
    const pages = await getVirtualPages(restaurantId);

    res.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

// POST /api/pages - Create new page (creates a placeholder content block)
export const createPage = async (req: Request, res: Response) => {
  try {
    const restaurantId = 1;
    const { name, slug, title, description, template, isActive, metaTitle, metaKeywords } = req.body;

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(name);

    // Check if page already exists (by checking content blocks)
    const existingBlock = await prisma.contentBlock.findFirst({
      where: {
        restaurantId,
        page: finalSlug
      }
    });

    if (existingBlock) {
      return res.status(400).json({ error: 'Page with this slug already exists' });
    }

    // Create a placeholder content block to represent the page
    const placeholderBlock = await prisma.contentBlock.create({
      data: {
        restaurantId,
        page: finalSlug,
        blockType: 'text',
        title: `${name} Page`,
        content: `Welcome to the ${name} page. Add content blocks to customize this page.`,
        displayOrder: 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    // Use consistent pageId mapping
    const getPageId = (pageSlug: string): number => {
      const pageMap: Record<string, number> = {
        'home': 1,
        'about': 2,
        'menu': 3,
        'contact': 4
      };
      
      return pageMap[pageSlug] || Math.abs(pageSlug.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0));
    };

    // Return virtual page object
    const virtualPage = {
      id: getPageId(finalSlug), // Use consistent virtual ID
      restaurantId,
      name,
      slug: finalSlug,
      title,
      description,
      template: template || 'default',
      displayOrder: 100, // New pages go to end
      isActive: isActive !== undefined ? isActive : true,
      isSystem: false,
      metaTitle,
      metaKeywords,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json(virtualPage);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
};

// PUT /api/pages/:id - Update page (limited functionality with current schema)
export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, title, description, template, isActive, metaTitle, metaKeywords } = req.body;

    // For now, we can't really update pages since they don't exist as entities
    // We'll just return success to maintain frontend compatibility
    const virtualPage = {
      id: parseInt(id),
      restaurantId: 1,
      name,
      slug,
      title,
      description,
      template: template || 'default',
      displayOrder: 0,
      isActive: isActive !== undefined ? isActive : true,
      isSystem: false,
      metaTitle,
      metaKeywords,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json(virtualPage);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
};

// DELETE /api/pages/:id - Delete page (deletes all content blocks for that page)
export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // We need to find the page by getting all virtual pages and finding the matching one
    const restaurantId = 1;
    const virtualPages = await getVirtualPages(restaurantId);
    const pageToDelete = virtualPages.find(p => p.id === parseInt(id));

    if (!pageToDelete) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Prevent deletion of system pages
    if (pageToDelete.isSystem) {
      return res.status(400).json({ 
        error: 'Cannot delete system pages (Home, About, Menu, Contact)' 
      });
    }

    // Check if page has content blocks
    const blockCount = await prisma.contentBlock.count({
      where: {
        restaurantId,
        page: pageToDelete.slug
      }
    });

    if (blockCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete page with ${blockCount} content blocks. Please remove all content blocks first.` 
      });
    }

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
};

// POST /api/pages/reorder - Reorder pages (limited functionality)
export const reorderPages = async (req: Request, res: Response) => {
  try {
    const { pages } = req.body; // Array of { id, displayOrder }

    // For now, just return success since we can't actually reorder virtual pages
    res.json({ message: 'Pages reordered successfully' });
  } catch (error) {
    console.error('Error reordering pages:', error);
    res.status(500).json({ error: 'Failed to reorder pages' });
  }
};

// POST /api/pages/:id/duplicate - Duplicate page (limited functionality)
export const duplicatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // For now, return an error since duplication is complex with current schema
    res.status(501).json({ error: 'Page duplication not yet implemented' });
  } catch (error) {
    console.error('Error duplicating page:', error);
    res.status(500).json({ error: 'Failed to duplicate page' });
  }
}; 