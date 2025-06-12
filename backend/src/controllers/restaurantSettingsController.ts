import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary (if not already configured)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to parse opening hours (handles both JSON string and object)
const parseOpeningHours = (openingHours: any): any => {
  if (!openingHours) return null;
  
  // If it's already an object, return as-is
  if (typeof openingHours === 'object' && !Array.isArray(openingHours)) {
    return openingHours;
  }
  
  // If it's a string, try to parse it
  if (typeof openingHours === 'string') {
    try {
      return JSON.parse(openingHours);
    } catch (e) {
      console.warn('Failed to parse opening hours JSON:', openingHours);
      return null;
    }
  }
  
  return null;
};

export const getRestaurantSettings = async (req: Request, res: Response) => {
  try {
    // Use restaurant context from middleware
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }
    
    let settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId }
    });

    // If no settings exist, create default ones
    if (!settings) {
      // Get restaurant name for defaults
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { name: true }
      });
      
      const restaurantName = restaurant?.name || 'Your Restaurant';
      
      settings = await prisma.restaurantSettings.create({
        data: {
          restaurantId,
          websiteName: restaurantName,
          tagline: 'Fresh, local ingredients meet culinary excellence',
          heroTitle: `Welcome to ${restaurantName}`,
          heroSubtitle: 'Experience culinary excellence',
          heroCTAText: 'Make a Reservation',
          heroCTALink: '/customer/reservations/new',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          accentColor: '#333333',
          fontPrimary: 'Roboto, sans-serif',
          fontSecondary: 'Playfair Display, serif',
          openingHours: {
            monday: { open: '11:00 AM', close: '9:00 PM' },
            tuesday: { open: '11:00 AM', close: '9:00 PM' },
            wednesday: { open: '11:00 AM', close: '9:00 PM' },
            thursday: { open: '11:00 AM', close: '9:00 PM' },
            friday: { open: '11:00 AM', close: '10:00 PM' },
            saturday: { open: '11:00 AM', close: '10:00 PM' },
            sunday: { open: '10:00 AM', close: '9:00 PM' }
          }
        }
      });
    }

    // Get menus separately for the response - filter by restaurant
    const menus = await prisma.menu.findMany({
      where: { 
        restaurantId,
        isArchived: false 
      },
      select: {
        id: true,
        name: true,
        title: true
      }
    });

    // Get restaurant info
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { name: true, slug: true }
    });

    res.json({
      ...settings,
      openingHours: parseOpeningHours(settings.openingHours),
      restaurant: {
        name: settings.websiteName || restaurant?.name || 'Restaurant',
        slug: restaurant?.slug || 'restaurant',
        description: settings.tagline || 'Fresh, local ingredients meet culinary excellence',
        menus
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant settings:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant settings' });
  }
};

export const updateRestaurantSettings = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }
    const updateData = req.body;

    // Remove restaurant relation from update data if present
    delete updateData.restaurant;
    delete updateData.id;
    delete updateData.restaurantId;

    const settings = await prisma.restaurantSettings.update({
      where: { restaurantId },
      data: updateData
    });

    // Get menus separately for the response - filter by restaurant
    const menus = await prisma.menu.findMany({
      where: { 
        restaurantId,
        isArchived: false 
      },
      select: {
        id: true,
        name: true,
        title: true
      }
    });

    // Get restaurant info
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { name: true, slug: true }
    });

    res.json({
      ...settings,
      openingHours: parseOpeningHours(settings.openingHours),
      restaurant: {
        name: settings.websiteName || restaurant?.name || 'Restaurant',
        slug: restaurant?.slug || 'restaurant',
        description: settings.tagline || 'Fresh, local ingredients meet culinary excellence',
        menus
      }
    });
  } catch (error) {
    console.error('Error updating restaurant settings:', error);
    res.status(500).json({ error: 'Failed to update restaurant settings' });
  }
};

export const uploadRestaurantImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { field } = req.params; // hero, about, logo
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Get current settings to check for existing images
    const currentSettings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId }
    });

    // Map field names to database columns
    const fieldMap: { [key: string]: { url: string, publicId: string } } = {
      hero: { url: 'heroImageUrl', publicId: 'heroImagePublicId' },
      about: { url: 'aboutImageUrl', publicId: 'aboutImagePublicId' },
      logo: { url: 'logoUrl', publicId: 'logoPublicId' }
    };

    const dbFields = fieldMap[field];
    if (!dbFields) {
      res.status(400).json({ error: 'Invalid image field' });
      return;
    }

    // Delete old image from Cloudinary if exists
    const oldPublicId = currentSettings?.[dbFields.publicId as keyof typeof currentSettings];
    if (oldPublicId && typeof oldPublicId === 'string') {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (error) {
        console.error('Error deleting old image from Cloudinary:', error);
      }
    }

    // Upload new image to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'restaurant-settings',
          transformation: field === 'logo' ? [
            { width: 400, height: 400, crop: 'limit' }
          ] : [
            { width: 1920, height: 1080, crop: 'limit', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    // Update database with new image info
    const settings = await prisma.restaurantSettings.update({
      where: { restaurantId },
      data: {
        [dbFields.url]: result.secure_url,
        [dbFields.publicId]: result.public_id
      }
    });

    res.json({ 
      imageUrl: result.secure_url,
      publicId: result.public_id,
      settings 
    });
  } catch (error) {
    console.error('Error uploading restaurant image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// Public endpoint for customer portal
export const getPublicRestaurantSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get restaurant by slug or ID
    let restaurant;
    
    // First check for slug parameter
    if (req.params.slug || req.query.slug) {
      const slug = req.params.slug || req.query.slug as string;
      restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true }
      });
      
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
    } else {
      // Fall back to restaurantId for backward compatibility
      let restaurantId = 1;
      
      if (req.params.restaurantId) {
        restaurantId = parseInt(req.params.restaurantId, 10);
        if (isNaN(restaurantId)) {
          res.status(400).json({ error: 'Invalid restaurant ID' });
          return;
        }
      } else if (req.query.restaurantId) {
        restaurantId = parseInt(req.query.restaurantId as string, 10);
        if (isNaN(restaurantId)) {
          res.status(400).json({ error: 'Invalid restaurant ID' });
          return;
        }
      }
      
      restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { id: true, name: true, slug: true }
      });
      
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
    }
    
    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId: restaurant.id },
      select: {
        websiteName: true,
        tagline: true,
        logoUrl: true,
        heroTitle: true,
        heroSubtitle: true,
        heroImageUrl: true,
        heroCTAText: true,
        heroCTALink: true,
        aboutTitle: true,
        aboutDescription: true,
        aboutImageUrl: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        fontPrimary: true,
        fontSecondary: true,
        contactPhone: true,
        contactEmail: true,
        contactAddress: true,
        contactCity: true,
        contactState: true,
        contactZip: true,
        openingHours: true,
        facebookUrl: true,
        instagramUrl: true,
        twitterUrl: true,
        footerText: true,
        metaTitle: true,
        metaDescription: true,
        activeMenuIds: true,
        menuDisplayMode: true,
      }
    });

    if (!settings) {
      res.status(404).json({ error: 'Restaurant settings not found' });
      return;
    }

    // Add restaurant info
    const result = {
      ...settings,
      openingHours: parseOpeningHours(settings.openingHours),
      restaurant: {
        id: restaurant.id,
        name: settings.websiteName || restaurant.name || 'Restaurant',
        slug: restaurant.slug || 'restaurant',
        description: settings.tagline || 'Fresh, local ingredients meet culinary excellence'
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching public restaurant settings:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant information' });
  }
};

// Unified content endpoint that combines RestaurantSettings + ContentBlocks
export const getUnifiedRestaurantContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { page = 'home' } = req.query;
    
    // Get restaurant by slug
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true }
    });
    
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    
    // Get restaurant settings (old system)
    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId: restaurant.id }
    });
    
    // Get content blocks for this page (new system)
    const contentBlocks = await prisma.contentBlock.findMany({
      where: {
        restaurantId: restaurant.id,
        page: page as string,
        isActive: true
      },
      orderBy: { displayOrder: 'asc' }
    });
    
    // Find hero and about blocks specifically
    const heroBlock = contentBlocks.find(block => block.blockType === 'hero');
    const aboutBlocks = contentBlocks.filter(block => 
      block.blockType === 'text' && 
      (block.title?.toLowerCase().includes('about') || block.page === 'about')
    );
    const aboutBlock = aboutBlocks[0]; // Take first about block
    
    // Build unified response
    const unifiedContent = {
      restaurant: {
        id: restaurant.id,
        name: settings?.websiteName || restaurant.name,
        slug: restaurant.slug,
        description: settings?.tagline || 'Welcome to our restaurant'
      },
      hero: {
        title: heroBlock?.title || settings?.heroTitle || 'Welcome to Our Restaurant',
        subtitle: heroBlock?.subtitle || settings?.heroSubtitle || 'Experience culinary excellence',
        imageUrl: heroBlock?.imageUrl || settings?.heroImageUrl,
        ctaText: heroBlock?.buttonText || settings?.heroCTAText,
        ctaLink: heroBlock?.buttonLink || settings?.heroCTALink
      },
      about: {
        title: aboutBlock?.title || settings?.aboutTitle || 'About Us',
        description: aboutBlock?.content || settings?.aboutDescription || 'Welcome to our restaurant, where we serve delicious food made with love and the finest ingredients.',
        imageUrl: aboutBlock?.imageUrl || settings?.aboutImageUrl
      },
      contact: {
        phone: settings?.contactPhone,
        email: settings?.contactEmail,
        address: settings?.contactAddress,
        city: settings?.contactCity,
        state: settings?.contactState,
        zip: settings?.contactZip,
        openingHours: parseOpeningHours(settings?.openingHours)
      },
      branding: {
        logoUrl: settings?.logoUrl,
        primaryColor: settings?.primaryColor,
        secondaryColor: settings?.secondaryColor,
        accentColor: settings?.accentColor,
        fontPrimary: settings?.fontPrimary,
        fontSecondary: settings?.fontSecondary
      },
      social: {
        facebookUrl: settings?.facebookUrl,
        instagramUrl: settings?.instagramUrl,
        twitterUrl: settings?.twitterUrl
      },
      seo: {
        metaTitle: settings?.metaTitle,
        metaDescription: settings?.metaDescription,
        footerText: settings?.footerText
      },
      contentBlocks: contentBlocks
        .filter(block => 
          block.blockType !== 'hero' && 
          !(block.blockType === 'text' && block.title?.toLowerCase().includes('about'))
        )
        .map(block => ({
          id: block.id,
          blockType: block.blockType,
          title: block.title,
          subtitle: block.subtitle,
          content: block.content,
          imageUrl: block.imageUrl,
          videoUrl: block.videoUrl,
          buttonText: block.buttonText,
          buttonLink: block.buttonLink,
          settings: block.settings,
          displayOrder: block.displayOrder,
          isActive: block.isActive
        }))
    };
    
    res.json(unifiedContent);
  } catch (error) {
    console.error('Error fetching unified restaurant content:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant content' });
  }
}; 