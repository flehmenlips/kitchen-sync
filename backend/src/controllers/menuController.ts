import { Request, Response } from 'express';
import prisma from '../config/db';
import { MulterRequest } from '../types';
import cloudinaryService from '../services/cloudinaryService';
import fs from 'fs';
import { getRestaurantFilter } from '../middleware/restaurantContext';

// Define types for menu items and sections to fix type errors
type MenuItem = {
  id?: number;
  name: string;
  description?: string | null;
  price?: string | null;
  position?: number;
  active?: boolean;
  recipeId?: number | null;
  deleted?: boolean;
};

type MenuSection = {
  id?: number;
  name: string;
  position?: number;
  active?: boolean;
  items?: MenuItem[];
  deleted?: boolean;
};

/**
 * @desc    Get all menus for the logged in user
 * @route   GET /api/menus
 * @access  Private
 */
export const getMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authorized, user ID missing' });
      return;
    }
    
    if (!req.restaurantId) {
      res.status(400).json({ message: 'Restaurant context required' });
      return;
    }

    // Check if sections and items should be included
    const includeFull = req.query.include?.toString().includes('sections');

    const menus = await prisma.menu.findMany({
      where: {
        userId: req.user.id,
        restaurantId: req.restaurantId,
        isArchived: false
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: includeFull ? {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' },
              include: {
                recipe: {
                  select: {
                    id: true,
                    name: true,
                    photoUrl: true
                  }
                }
              }
            }
          }
        }
      } : undefined
    });

    res.status(200).json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ message: 'Error fetching menus' });
  }
};

/**
 * @desc    Get a menu by ID
 * @route   GET /api/menus/:id
 * @access  Private
 */
export const getMenuById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authorized, user ID missing' });
      return;
    }
    
    if (!req.restaurantId) {
      res.status(400).json({ message: 'Restaurant context required' });
      return;
    }

    const { id } = req.params;
    const menuId = parseInt(id);

    if (isNaN(menuId)) {
      res.status(400).json({ message: 'Invalid menu ID' });
      return;
    }

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' },
              include: {
                recipe: {
                  select: {
                    id: true,
                    name: true,
                    photoUrl: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!menu) {
      res.status(404).json({ message: 'Menu not found' });
      return;
    }

    if (menu.userId !== req.user.id || menu.restaurantId !== req.restaurantId) {
      res.status(403).json({ message: 'Not authorized to access this menu' });
      return;
    }

    res.status(200).json(menu);
  } catch (error) {
    console.error(`Error fetching menu: ${error}`);
    res.status(500).json({ message: 'Error fetching menu' });
  }
};

/**
 * @desc    Create a new menu
 * @route   POST /api/menus
 * @access  Private
 */
export const createMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authorized, user ID missing' });
      return;
    }
    
    if (!req.restaurantId) {
      res.status(400).json({ message: 'Restaurant context required' });
      return;
    }

    const {
      name,
      title,
      subtitle,
      font,
      layout,
      showDollarSign,
      showDecimals,
      showSectionDividers,
      logoPosition,
      logoSize,
      logoOffset,
      backgroundColor,
      textColor,
      accentColor,
      sections = []
    } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Menu name is required' });
      return;
    }

    // Create the menu
    const newMenu = await prisma.menu.create({
      data: {
        name,
        title: title || '',
        subtitle: subtitle || '',
        font: font || 'Playfair Display',
        layout: layout || 'single',
        showDollarSign: showDollarSign !== false,
        showDecimals: showDecimals !== false,
        showSectionDividers: showSectionDividers !== false,
        logoPosition: logoPosition || 'top',
        logoSize: logoSize || '200',
        logoOffset: logoOffset || '0',
        backgroundColor: backgroundColor || '#ffffff',
        textColor: textColor || '#000000',
        accentColor: accentColor || '#333333',
        userId: req.user.id,
        restaurantId: req.restaurantId,
        sections: {
          create: sections.map((section: any, index: number) => ({
            name: section.name,
            position: section.position || index,
            active: section.active !== false,
            items: {
              create: (section.items || []).map((item: any, itemIndex: number) => ({
                name: item.name,
                description: item.description || '',
                price: item.price || '',
                position: item.position || itemIndex,
                active: item.active !== false,
                recipeId: item.recipeId || null
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            items: true
          }
        }
      }
    });

    res.status(201).json(newMenu);
  } catch (error) {
    console.error(`Error creating menu: ${error}`);
    res.status(500).json({ message: 'Error creating menu' });
  }
};

/**
 * @desc    Update a menu
 * @route   PUT /api/menus/:id
 * @access  Private
 */
export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authorized, user ID missing' });
      return;
    }

    const { id } = req.params;
    const menuId = parseInt(id);

    if (isNaN(menuId)) {
      res.status(400).json({ message: 'Invalid menu ID' });
      return;
    }

    // Check if menu exists and belongs to user
    const existingMenu = await prisma.menu.findUnique({
      where: { id: menuId }
    });

    if (!existingMenu) {
      res.status(404).json({ message: 'Menu not found' });
      return;
    }

    if (existingMenu.userId !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to update this menu' });
      return;
    }

    const {
      name,
      title,
      subtitle,
      font,
      layout,
      showDollarSign,
      showDecimals,
      showSectionDividers,
      logoPosition,
      logoSize,
      logoOffset,
      backgroundColor,
      textColor,
      accentColor,
      sections
    } = req.body;

    // Update basic menu details
    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        name: name || existingMenu.name,
        title: title !== undefined ? title : existingMenu.title,
        subtitle: subtitle !== undefined ? subtitle : existingMenu.subtitle,
        font: font || existingMenu.font,
        layout: layout || existingMenu.layout,
        showDollarSign: showDollarSign !== undefined ? showDollarSign : existingMenu.showDollarSign,
        showDecimals: showDecimals !== undefined ? showDecimals : existingMenu.showDecimals,
        showSectionDividers: showSectionDividers !== undefined ? showSectionDividers : existingMenu.showSectionDividers,
        logoPosition: logoPosition || existingMenu.logoPosition,
        logoSize: logoSize || existingMenu.logoSize,
        logoOffset: logoOffset || existingMenu.logoOffset,
        backgroundColor: backgroundColor || existingMenu.backgroundColor,
        textColor: textColor || existingMenu.textColor,
        accentColor: accentColor || existingMenu.accentColor,
        updatedAt: new Date()
      }
    });

    // Handle sections and items if provided
    if (sections && Array.isArray(sections)) {
      // Get existing sections
      const existingSections = await prisma.menuSection.findMany({
        where: { menuId: menuId },
        include: { items: true }
      });

      // Process each section
      for (const section of sections) {
        if (section.id && section.id > 0) {
          // Update existing section
          const existingSection = existingSections.find(s => s.id === section.id);
          
          if (existingSection) {
            await prisma.menuSection.update({
              where: { id: section.id },
              data: {
                name: section.name || existingSection.name,
                position: section.position !== undefined ? section.position : existingSection.position,
                active: section.active !== undefined ? section.active : existingSection.active
              }
            });

            // Process items if provided
            if (section.items && Array.isArray(section.items)) {
              for (const item of section.items) {
                if (item.id && item.id > 0) {
                  // Update existing item
                  await prisma.menuItem.update({
                    where: { id: item.id },
                    data: {
                      name: item.name,
                      description: item.description || '',
                      price: item.price || '',
                      position: item.position !== undefined ? item.position : 0,
                      active: item.active !== undefined ? item.active : true,
                      recipeId: item.recipeId || null
                    }
                  });
                } else if (!item.deleted) {
                  // Create new item
                  await prisma.menuItem.create({
                    data: {
                      name: item.name,
                      description: item.description || '',
                      price: item.price || '',
                      position: item.position || 0,
                      active: item.active !== false,
                      recipeId: item.recipeId || null,
                      sectionId: section.id
                    }
                  });
                }
              }

              // Delete items that are in existingSection but not in section.items
              const updatedItemIds = section.items
                .filter((item: any) => !item.deleted && item.id)
                .map((item: any) => item.id);
              
              const itemsToDelete = existingSection.items
                .filter(item => !updatedItemIds.includes(item.id))
                .map(item => item.id);

              if (itemsToDelete.length > 0) {
                await prisma.menuItem.deleteMany({
                  where: { id: { in: itemsToDelete } }
                });
              }
            }
          }
        } else if (!section.deleted) {
          // Create new section
          const newSection = await prisma.menuSection.create({
            data: {
              name: section.name,
              position: section.position || 0,
              active: section.active !== false,
              menuId: menuId
            }
          });

          // Create items for the new section
          if (section.items && Array.isArray(section.items)) {
            for (const item of section.items) {
              if (!item.deleted) {
                await prisma.menuItem.create({
                  data: {
                    name: item.name,
                    description: item.description || '',
                    price: item.price || '',
                    position: item.position || 0,
                    active: item.active !== false,
                    recipeId: item.recipeId || null,
                    sectionId: newSection.id
                  }
                });
              }
            }
          }
        }
      }

      // Delete sections that are in existingSections but not in sections
      const updatedSectionIds = sections
        .filter((section: any) => !section.deleted && section.id)
        .map((section: any) => section.id);
      
      const sectionsToDelete = existingSections
        .filter(section => !updatedSectionIds.includes(section.id))
        .map(section => section.id);

      if (sectionsToDelete.length > 0) {
        await prisma.menuSection.deleteMany({
          where: { id: { in: sectionsToDelete } }
        });
      }
    }

    // Fetch the updated menu with all details
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' },
              include: {
                recipe: {
                  select: {
                    id: true,
                    name: true,
                    photoUrl: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.status(200).json(menu);
  } catch (error) {
    console.error(`Error updating menu: ${error}`);
    res.status(500).json({ message: 'Error updating menu' });
  }
};

/**
 * @desc    Delete a menu
 * @route   DELETE /api/menus/:id
 * @access  Private
 */
export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authorized, user ID missing' });
      return;
    }

    const { id } = req.params;
    const menuId = parseInt(id);

    if (isNaN(menuId)) {
      res.status(400).json({ message: 'Invalid menu ID' });
      return;
    }

    // Check if menu exists and belongs to user
    const existingMenu = await prisma.menu.findUnique({
      where: { id: menuId }
    });

    if (!existingMenu) {
      res.status(404).json({ message: 'Menu not found' });
      return;
    }

    if (existingMenu.userId !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to delete this menu' });
      return;
    }

    // Delete the menu (cascades to sections and items)
    await prisma.menu.delete({
      where: { id: menuId }
    });

    // Delete logo file if it exists
    if (existingMenu.logoPath) {
      try {
        // If using Cloudinary
        if (existingMenu.logoPath.includes('cloudinary')) {
          // Extract the public ID
          const parts = existingMenu.logoPath.split('/');
          const filename = parts[parts.length - 1];
          const publicId = `menu-logos/${filename.split('.')[0]}`;
          await cloudinaryService.deleteImage(publicId);
        } else {
          // If using local storage
          const filePath = `./public${existingMenu.logoPath}`;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (error) {
        console.error('Error deleting menu logo:', error);
        // Continue despite logo deletion error
      }
    }

    res.status(200).json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error(`Error deleting menu: ${error}`);
    res.status(500).json({ message: 'Error deleting menu' });
  }
};

/**
 * @desc    Archive a menu instead of deleting it
 * @route   PUT /api/menus/:id/archive
 * @access  Private
 */
export const archiveMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authorized, user ID missing' });
      return;
    }

    const { id } = req.params;
    const menuId = parseInt(id);

    if (isNaN(menuId)) {
      res.status(400).json({ message: 'Invalid menu ID' });
      return;
    }

    // Check if menu exists and belongs to user
    const existingMenu = await prisma.menu.findUnique({
      where: { id: menuId }
    });

    if (!existingMenu) {
      res.status(404).json({ message: 'Menu not found' });
      return;
    }

    if (existingMenu.userId !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to archive this menu' });
      return;
    }

    // Archive the menu
    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        isArchived: true,
        updatedAt: new Date()
      }
    });

    res.status(200).json(updatedMenu);
  } catch (error) {
    console.error(`Error archiving menu: ${error}`);
    res.status(500).json({ message: 'Error archiving menu' });
  }
};

/**
 * @desc    Duplicate a menu
 * @route   POST /api/menus/:id/duplicate
 * @access  Private
 */
export const duplicateMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authorized, user ID missing' });
      return;
    }

    const { id } = req.params;
    const menuId = parseInt(id);

    if (isNaN(menuId)) {
      res.status(400).json({ message: 'Invalid menu ID' });
      return;
    }

    // Check if menu exists and belongs to user
    const existingMenu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        sections: {
          include: {
            items: true
          }
        }
      }
    });

    if (!existingMenu) {
      res.status(404).json({ message: 'Menu not found' });
      return;
    }

    if (existingMenu.userId !== req.user.id || existingMenu.restaurantId !== req.restaurantId) {
      res.status(403).json({ message: 'Not authorized to duplicate this menu' });
      return;
    }

    // Create a copy of the menu with a new name
    const newMenu = await prisma.menu.create({
      data: {
        name: `${existingMenu.name} (Copy)`,
        title: existingMenu.title,
        subtitle: existingMenu.subtitle,
        font: existingMenu.font,
        layout: existingMenu.layout,
        showDollarSign: existingMenu.showDollarSign,
        showDecimals: existingMenu.showDecimals,
        showSectionDividers: existingMenu.showSectionDividers,
        logoPath: existingMenu.logoPath,
        logoPosition: existingMenu.logoPosition,
        logoSize: existingMenu.logoSize,
        logoOffset: existingMenu.logoOffset,
        backgroundColor: existingMenu.backgroundColor,
        textColor: existingMenu.textColor,
        accentColor: existingMenu.accentColor,
        userId: req.user.id,
        restaurantId: req.restaurantId!,
        sections: {
          create: existingMenu.sections.map(section => ({
            name: section.name,
            position: section.position,
            active: section.active,
            items: {
              create: section.items.map(item => ({
                name: item.name,
                description: item.description,
                price: item.price,
                position: item.position,
                active: item.active,
                recipeId: item.recipeId
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            items: true
          }
        }
      }
    });

    res.status(201).json(newMenu);
  } catch (error) {
    console.error(`Error duplicating menu: ${error}`);
    res.status(500).json({ message: 'Error duplicating menu' });
  }
};

/**
 * @desc    Upload a logo for a menu
 * @route   POST /api/menus/:id/logo
 * @access  Private
 */
export const uploadMenuLogo = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authorized, user ID missing' });
      return;
    }

    const { id } = req.params;
    const menuId = parseInt(id);

    if (isNaN(menuId)) {
      res.status(400).json({ message: 'Invalid menu ID' });
      return;
    }

    // Check if menu exists and belongs to user
    const existingMenu = await prisma.menu.findUnique({
      where: { id: menuId }
    });

    if (!existingMenu) {
      res.status(404).json({ message: 'Menu not found' });
      return;
    }

    if (existingMenu.userId !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to update this menu' });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Delete old logo if it exists
    if (existingMenu.logoPath) {
      try {
        // If using Cloudinary
        if (existingMenu.logoPath.includes('cloudinary')) {
          // Extract the public ID
          const parts = existingMenu.logoPath.split('/');
          const filename = parts[parts.length - 1];
          const publicId = `menu-logos/${filename.split('.')[0]}`;
          await cloudinaryService.deleteImage(publicId);
        } else {
          // If using local storage
          const filePath = `./public${existingMenu.logoPath}`;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (error) {
        console.error('Error deleting old menu logo:', error);
        // Continue despite logo deletion error
      }
    }

    // Upload the new logo to Cloudinary
    const folder = 'menu-logos';
    const result = await cloudinaryService.uploadImage(req.file.path, folder);

    // Update the menu with the new logo URL
    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        logoPath: result.url,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      logoUrl: result.url,
      menu: updatedMenu
    });
  } catch (error) {
    console.error(`Error uploading menu logo: ${error}`);
    res.status(500).json({ message: 'Error uploading menu logo' });
  }
}; 