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

export const getRestaurantSettings = async (req: Request, res: Response) => {
  try {
    // For MVP, we're using restaurant ID 1
    const restaurantId = 1;
    
    let settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId }
    });

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.restaurantSettings.create({
        data: {
          restaurantId,
          websiteName: 'Seabreeze Kitchen',
          tagline: 'Fresh, local ingredients meet culinary excellence',
          heroTitle: 'Welcome to Seabreeze Kitchen',
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

    // Get menus separately for the response
    const menus = await prisma.menu.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        name: true,
        title: true
      }
    });

    res.json({
      ...settings,
      restaurant: {
        name: settings.websiteName || 'Seabreeze Kitchen',
        slug: 'seabreeze-kitchen',
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
    const restaurantId = 1;
    const updateData = req.body;

    // Remove restaurant relation from update data if present
    delete updateData.restaurant;
    delete updateData.id;
    delete updateData.restaurantId;

    const settings = await prisma.restaurantSettings.update({
      where: { restaurantId },
      data: updateData
    });

    // Get menus separately for the response
    const menus = await prisma.menu.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        name: true,
        title: true
      }
    });

    res.json({
      ...settings,
      restaurant: {
        name: settings.websiteName || 'Seabreeze Kitchen',
        slug: 'seabreeze-kitchen',
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
    const restaurantId = 1;

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
    const restaurantId = 1;
    
    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId },
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
        menuDisplayMode: true
      }
    });

    if (!settings) {
      res.status(404).json({ error: 'Restaurant settings not found' });
      return;
    }

    // Add restaurant info
    const result = {
      ...settings,
      restaurant: {
        name: settings.websiteName || 'Seabreeze Kitchen',
        description: settings.tagline || 'Fresh, local ingredients meet culinary excellence'
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching public restaurant settings:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant information' });
  }
}; 