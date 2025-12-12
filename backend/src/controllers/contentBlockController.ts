import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Block type definitions
export const BLOCK_TYPES = {
  TEXT: 'text',
  HTML: 'html',
  IMAGE: 'image',
  VIDEO: 'video',
  CTA: 'cta',
  HERO: 'hero',
  FEATURES: 'features',
  TESTIMONIAL: 'testimonial',
  GALLERY: 'gallery',
  CONTACT: 'contact',
  MAP: 'map',
  MENU_PREVIEW: 'menu_preview',
  RESERVATION_FORM: 'reservation_form'
};

// Get all content blocks for a page
export const getContentBlocks = async (req: Request, res: Response) => {
  try {
    const { page = 'home', restaurantSlug } = req.query;
    let restaurantId: number | undefined;

    // CRITICAL FIX: Require restaurantSlug - never default to restaurant ID 1
    // This prevents data leakage between restaurants
    if (restaurantSlug) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug as string },
        select: { id: true }
      });
      
      if (restaurant) {
        restaurantId = restaurant.id;
      } else {
        res.status(404).json({ error: 'Restaurant not found for slug: ' + restaurantSlug });
        return;
      }
    } else {
      res.status(400).json({ 
        error: 'Restaurant slug required',
        message: 'Please provide a restaurantSlug query parameter'
      });
      return;
    }

    const blocks = await prisma.contentBlock.findMany({
      where: {
        restaurantId,
        page: page as string,
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    res.json(blocks);
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    res.status(500).json({ error: 'Failed to fetch content blocks' });
  }
};

// Get all content blocks for admin (including inactive)
export const getAllContentBlocks = async (req: Request, res: Response) => {
  try {
    // CRITICAL FIX: Require restaurantId from request context or params
    // Never hardcode restaurant ID - this causes data leakage
    // CRITICAL FIX: Use explicit conditional checks instead of || to handle 0 values correctly
    // Chained || operators skip 0 values because 0 is falsy, breaking explicit restaurantId precedence
    let restaurantId: number | undefined;
    
    // Check request context first (from middleware)
    if (req.restaurantId !== undefined && req.restaurantId !== null) {
      restaurantId = req.restaurantId;
    }
    
    // Fall back to query parameter if context didn't provide restaurantId
    if (restaurantId === undefined && req.query.restaurantId) {
      restaurantId = parseInt(req.query.restaurantId as string);
    }
    
    // Fall back to route parameter if still undefined
    if (restaurantId === undefined && req.params.restaurantId) {
      restaurantId = parseInt(req.params.restaurantId);
    }
    
    if (restaurantId === undefined || isNaN(restaurantId)) {
      res.status(400).json({ 
        error: 'Restaurant ID required',
        message: 'Please provide a restaurantId parameter or ensure restaurant context is set'
      });
      return;
    }

    const blocks = await prisma.contentBlock.findMany({
      where: { restaurantId },
      orderBy: [
        { page: 'asc' },
        { displayOrder: 'asc' }
      ]
    });

    // Convert blocks to include pageId and page object for frontend compatibility
    const convertedBlocks = blocks.map(block => {
      // Create a virtual pageId based on page string
      const pageMap: Record<string, number> = {
        'home': 1,
        'about': 2, 
        'menu': 3,
        'contact': 4
      };
      
      // For custom pages, use a hash of the page name as ID
      const pageId = pageMap[block.page] || Math.abs(block.page.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0));

      return {
        ...block,
        pageId, // Add virtual pageId for frontend compatibility
        page: {
          id: pageId,
          name: block.page.charAt(0).toUpperCase() + block.page.slice(1),
          slug: block.page
        }
      };
    });

    res.json(convertedBlocks);
  } catch (error) {
    console.error('Error fetching all content blocks:', error);
    res.status(500).json({ error: 'Failed to fetch content blocks' });
  }
};

// Create a new content block
export const createContentBlock = async (req: Request, res: Response) => {
  try {
    // CRITICAL FIX: Require restaurantId from request body or context
    // Never hardcode restaurant ID - this causes data leakage
    // CRITICAL FIX: Parse req.body.restaurantId to handle string "0" case correctly
    // Without parseInt(), string "0" passes validation because it's truthy and isNaN("0") is false
    // CRITICAL FIX: Use explicit conditional checks instead of || to handle 0 values correctly
    // Chained || operators skip 0 values because 0 is falsy, breaking explicit restaurantId precedence
    let restaurantId: number | undefined;
    
    // Check request body first (explicit value takes precedence)
    if (req.body.restaurantId !== undefined && req.body.restaurantId !== null) {
      restaurantId = parseInt(req.body.restaurantId);
    }
    
    // Fall back to request context if body didn't provide restaurantId
    if (restaurantId === undefined && req.restaurantId) {
      restaurantId = req.restaurantId;
    }
    
    // Fall back to query parameter if still undefined
    if (restaurantId === undefined && req.query.restaurantId) {
      restaurantId = parseInt(req.query.restaurantId as string);
    }
    
    // Fall back to route parameter if still undefined
    if (restaurantId === undefined && req.params.restaurantId) {
      restaurantId = parseInt(req.params.restaurantId);
    }
    
    if (restaurantId === undefined || isNaN(restaurantId)) {
      res.status(400).json({ 
        error: 'Restaurant ID required',
        message: 'Please provide a restaurantId in the request body or ensure restaurant context is set'
      });
      return;
    }
    let blockData = {
      ...req.body,
      restaurantId,
      settings: req.body.settings || {}
    };

    // Convert pageId to page string for database storage
    if (blockData.pageId && !blockData.page) {
      // Create getPageSlug function that reverses the pageId mapping
      const getPageSlug = async (pageId: number): Promise<string> => {
        const pageMap: Record<number, string> = {
          1: 'home',
          2: 'about',
          3: 'menu', 
          4: 'contact'
        };
        
        // If it's a system page, return the slug
        if (pageMap[pageId]) {
          return pageMap[pageId];
        }
        
        // For custom pages, we need to find the page by its virtual ID
        // Get all unique pages and find the one that generates this pageId
        const uniquePages = await prisma.contentBlock.findMany({
          where: { restaurantId },
          select: { page: true },
          distinct: ['page']
        });
        
        for (const pageItem of uniquePages) {
          const generatedId = Math.abs(pageItem.page.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0));
          
          if (generatedId === pageId) {
            return pageItem.page;
          }
        }
        
        // Fallback - shouldn't happen but just in case
        return 'custom';
      };
      
      blockData.page = await getPageSlug(blockData.pageId);
      delete blockData.pageId; // Remove pageId as it doesn't exist in current schema
    }

    const block = await prisma.contentBlock.create({
      data: blockData
    });

    // Convert response back to include pageId for frontend
    const pageMap: Record<string, number> = {
      'home': 1,
      'about': 2,
      'menu': 3,
      'contact': 4
    };
    
    const pageId = pageMap[block.page] || Math.abs(block.page.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));

    const responseBlock = {
      ...block,
      pageId,
      page: {
        id: pageId,
        name: block.page.charAt(0).toUpperCase() + block.page.slice(1),
        slug: block.page
      }
    };

    res.status(201).json(responseBlock);
  } catch (error) {
    console.error('Error creating content block:', error);
    res.status(500).json({ error: 'Failed to create content block' });
  }
};

// Update a content block
export const updateContentBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.restaurantId;
    delete updateData.createdAt;

    const block = await prisma.contentBlock.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(block);
  } catch (error) {
    console.error('Error updating content block:', error);
    res.status(500).json({ error: 'Failed to update content block' });
  }
};

// Delete a content block
export const deleteContentBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get block to check for images
    const block = await prisma.contentBlock.findUnique({
      where: { id: parseInt(id) }
    });

    if (!block) {
      res.status(404).json({ error: 'Content block not found' });
      return;
    }

    // Delete image from Cloudinary if exists
    if (block.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(block.imagePublicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await prisma.contentBlock.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Content block deleted successfully' });
  } catch (error) {
    console.error('Error deleting content block:', error);
    res.status(500).json({ error: 'Failed to delete content block' });
  }
};

// Reorder content blocks
export const reorderContentBlocks = async (req: Request, res: Response) => {
  try {
    const { blocks } = req.body; // Array of { id, displayOrder }

    // Update each block's display order
    const updates = blocks.map((block: { id: number; displayOrder: number }) =>
      prisma.contentBlock.update({
        where: { id: block.id },
        data: { displayOrder: block.displayOrder }
      })
    );

    await Promise.all(updates);

    res.json({ message: 'Content blocks reordered successfully' });
  } catch (error) {
    console.error('Error reordering content blocks:', error);
    res.status(500).json({ error: 'Failed to reorder content blocks' });
  }
};

// Upload image for content block
export const uploadContentBlockImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Get current block
    const block = await prisma.contentBlock.findUnique({
      where: { id: parseInt(id) }
    });

    if (!block) {
      res.status(404).json({ error: 'Content block not found' });
      return;
    }

    // Delete old image if exists
    if (block.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(block.imagePublicId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Upload new image
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'content-blocks',
          transformation: [
            { width: 1920, height: 1080, crop: 'limit', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    // Update block with new image info
    const updatedBlock = await prisma.contentBlock.update({
      where: { id: parseInt(id) },
      data: {
        imageUrl: result.secure_url,
        imagePublicId: result.public_id
      }
    });

    res.json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
      block: updatedBlock
    });
  } catch (error) {
    console.error('Error uploading content block image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// Duplicate a content block
export const duplicateContentBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get original block
    const originalBlock = await prisma.contentBlock.findUnique({
      where: { id: parseInt(id) }
    });

    if (!originalBlock) {
      res.status(404).json({ error: 'Content block not found' });
      return;
    }

    // Create duplicate without id and timestamps
    const { id: _, createdAt, updatedAt, imagePublicId, ...blockData } = originalBlock;

    const duplicatedBlock = await prisma.contentBlock.create({
      data: {
        restaurantId: blockData.restaurantId,
        page: blockData.page,
        blockType: blockData.blockType,
        title: `${blockData.title} (Copy)`,
        subtitle: blockData.subtitle,
        content: blockData.content,
        imageUrl: blockData.imageUrl,
        buttonText: blockData.buttonText,
        buttonLink: blockData.buttonLink,
        displayOrder: blockData.displayOrder + 1,
        isActive: false // Start as inactive
      }
    });

    res.json(duplicatedBlock);
  } catch (error) {
    console.error('Error duplicating content block:', error);
    res.status(500).json({ error: 'Failed to duplicate content block' });
  }
};

// Debug endpoint to verify deployment and database connection
export const debugContentBlocks = async (req: Request, res: Response) => {
  try {
    const { restaurantSlug = 'coq-au-vin' } = req.query;
    
    // Test 1: Basic response
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      endpoint: 'debugContentBlocks',
      version: '2.2', // Update this when changes are deployed
      query: req.query
    };

    // Test 2: Database connection
    const restaurantCount = await prisma.restaurant.count();
    debugInfo.restaurantCount = restaurantCount;

    // Test 2.5: Database URL info (for debugging)
    debugInfo.databaseInfo = {
      // Don't expose full URL, just show if it's set and what type
      hasUrl: !!process.env.DATABASE_URL,
      urlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set',
      nodeEnv: process.env.NODE_ENV
    };

    // Test 3: Find specific restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug as string },
      select: { id: true, name: true, slug: true }
    });
    debugInfo.restaurant = restaurant;

    // Test 4: Content blocks for this restaurant
    if (restaurant) {
      // First, get ALL content blocks for this restaurant (ignore isActive)
      const allContentBlocks = await prisma.contentBlock.findMany({
        where: {
          restaurantId: restaurant.id,
          page: 'home'
        },
        select: {
          id: true,
          blockType: true,
          title: true,
          displayOrder: true,
          isActive: true
        },
        orderBy: { displayOrder: 'asc' }
      });
      debugInfo.allContentBlocks = allContentBlocks;

      // Then, get only active ones
      const activeContentBlocks = await prisma.contentBlock.findMany({
        where: {
          restaurantId: restaurant.id,
          page: 'home',
          isActive: true
        },
        select: {
          id: true,
          blockType: true,
          title: true,
          displayOrder: true,
          isActive: true
        },
        orderBy: { displayOrder: 'asc' }
      });
      debugInfo.activeContentBlocks = activeContentBlocks;
    }

    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}; 