import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { deleteImage } from '../services/cloudinaryService';

const prisma = new PrismaClient();

export interface ContentBlockData {
  page: string;
  blockType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  imagePublicId?: string;
  buttonText?: string;
  buttonLink?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// GET /api/content-blocks/page/:page - Get content blocks for a specific page
export const getContentBlocksByPage = async (req: Request, res: Response) => {
  try {
    const { page } = req.params;
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const contentBlocks = await prisma.contentBlock.findMany({
      where: {
        restaurantId,
        page,
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    res.json({ contentBlocks });
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    res.status(500).json({ error: 'Failed to fetch content blocks' });
  }
};

// GET /api/content-blocks/:id - Get specific content block
export const getContentBlockById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const contentBlock = await prisma.contentBlock.findFirst({
      where: {
        id: parseInt(id),
        restaurantId
      }
    });

    if (!contentBlock) {
      return res.status(404).json({ error: 'Content block not found' });
    }

    res.json(contentBlock);
  } catch (error) {
    console.error('Error fetching content block:', error);
    res.status(500).json({ error: 'Failed to fetch content block' });
  }
};

// POST /api/content-blocks - Create new content block
export const createContentBlock = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const {
      page,
      blockType,
      title,
      subtitle,
      content,
      imageUrl,
      imagePublicId,
      buttonText,
      buttonLink,
      displayOrder,
      isActive = true
    }: ContentBlockData = req.body;

    if (!page || !blockType) {
      return res.status(400).json({ error: 'Page and blockType are required' });
    }

    // Get the next display order if not provided
    let finalDisplayOrder = displayOrder;
    if (finalDisplayOrder === undefined) {
      const maxOrder = await prisma.contentBlock.findFirst({
        where: { restaurantId, page },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true }
      });
      finalDisplayOrder = (maxOrder?.displayOrder || 0) + 1;
    }

    const contentBlock = await prisma.contentBlock.create({
      data: {
        restaurantId,
        page,
        blockType,
        title,
        subtitle,
        content,
        imageUrl,
        imagePublicId,
        buttonText,
        buttonLink,
        displayOrder: finalDisplayOrder,
        isActive,
        lastModifiedBy: req.user?.id
      }
    });

    res.status(201).json(contentBlock);
  } catch (error) {
    console.error('Error creating content block:', error);
    res.status(500).json({ error: 'Failed to create content block' });
  }
};

// PUT /api/content-blocks/:id - Update content block
export const updateContentBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const {
      title,
      subtitle,
      content,
      imageUrl,
      imagePublicId,
      buttonText,
      buttonLink,
      displayOrder,
      isActive
    }: Partial<ContentBlockData> = req.body;

    // Verify the content block exists and belongs to the restaurant
    const existingBlock = await prisma.contentBlock.findFirst({
      where: {
        id: parseInt(id),
        restaurantId
      }
    });

    if (!existingBlock) {
      return res.status(404).json({ error: 'Content block not found' });
    }

    const contentBlock = await prisma.contentBlock.update({
      where: { id: parseInt(id) },
      data: {
        title,
        subtitle,
        content,
        imageUrl,
        imagePublicId,
        buttonText,
        buttonLink,
        displayOrder,
        isActive,
        lastModifiedBy: req.user?.id,
        version: { increment: 1 }
      }
    });

    res.json(contentBlock);
  } catch (error) {
    console.error('Error updating content block:', error);
    res.status(500).json({ error: 'Failed to update content block' });
  }
};

// DELETE /api/content-blocks/:id - Delete content block
export const deleteContentBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    // Verify the content block exists and belongs to the restaurant
    const existingBlock = await prisma.contentBlock.findFirst({
      where: {
        id: parseInt(id),
        restaurantId
      }
    });

    if (!existingBlock) {
      return res.status(404).json({ error: 'Content block not found' });
    }

    // Delete associated image from Cloudinary if it exists
    if (existingBlock.imagePublicId) {
      try {
        await deleteImage(existingBlock.imagePublicId);
      } catch (cloudinaryError) {
        console.warn('Failed to delete image from Cloudinary:', cloudinaryError);
        // Continue with deletion even if Cloudinary fails
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

// PUT /api/content-blocks/reorder - Reorder content blocks for drag-and-drop
export const reorderContentBlocks = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const { page, blockOrders }: { page: string; blockOrders: { id: number; displayOrder: number }[] } = req.body;

    if (!page || !Array.isArray(blockOrders)) {
      return res.status(400).json({ error: 'Page and blockOrders array are required' });
    }

    // Update all blocks in a transaction
    await prisma.$transaction(
      blockOrders.map(({ id, displayOrder }) =>
        prisma.contentBlock.update({
          where: { id },
          data: { 
            displayOrder,
            lastModifiedBy: req.user?.id,
            version: { increment: 1 }
          }
        })
      )
    );

    // Return updated blocks
    const updatedBlocks = await prisma.contentBlock.findMany({
      where: {
        restaurantId,
        page,
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    res.json({ contentBlocks: updatedBlocks });
  } catch (error) {
    console.error('Error reordering content blocks:', error);
    res.status(500).json({ error: 'Failed to reorder content blocks' });
  }
};

// PUT /api/content-blocks/:id/publish - Publish content block
export const publishContentBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    // Verify the content block exists and belongs to the restaurant
    const existingBlock = await prisma.contentBlock.findFirst({
      where: {
        id: parseInt(id),
        restaurantId
      }
    });

    if (!existingBlock) {
      return res.status(404).json({ error: 'Content block not found' });
    }

    const contentBlock = await prisma.contentBlock.update({
      where: { id: parseInt(id) },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        lastModifiedBy: req.user?.id
      }
    });

    res.json(contentBlock);
  } catch (error) {
    console.error('Error publishing content block:', error);
    res.status(500).json({ error: 'Failed to publish content block' });
  }
};

// PUT /api/content-blocks/:id/unpublish - Unpublish content block
export const unpublishContentBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    // Verify the content block exists and belongs to the restaurant
    const existingBlock = await prisma.contentBlock.findFirst({
      where: {
        id: parseInt(id),
        restaurantId
      }
    });

    if (!existingBlock) {
      return res.status(404).json({ error: 'Content block not found' });
    }

    const contentBlock = await prisma.contentBlock.update({
      where: { id: parseInt(id) },
      data: {
        isPublished: false,
        publishedAt: null,
        lastModifiedBy: req.user?.id
      }
    });

    res.json(contentBlock);
  } catch (error) {
    console.error('Error unpublishing content block:', error);
    res.status(500).json({ error: 'Failed to unpublish content block' });
  }
};

// GET /api/content-blocks/public/:restaurantSlug/:page - Get published content blocks for customer portal
export const getPublicContentBlocks = async (req: Request, res: Response) => {
  try {
    const { restaurantSlug, page } = req.params;

    // Find restaurant by slug
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug }
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const contentBlocks = await prisma.contentBlock.findMany({
      where: {
        restaurantId: restaurant.id,
        page,
        isActive: true,
        isPublished: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    res.json({ contentBlocks });
  } catch (error) {
    console.error('Error fetching public content blocks:', error);
    res.status(500).json({ error: 'Failed to fetch content blocks' });
  }
}; 