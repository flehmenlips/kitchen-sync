import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const templateController = {
  // Get all active templates
  async getTemplates(req: Request, res: Response) {
    try {
      const templates = await prisma.websiteTemplate.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      });
      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  },

  // Get template by ID
  async getTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await prisma.websiteTemplate.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  },

  // Get template by name
  async getTemplateByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const template = await prisma.websiteTemplate.findUnique({
        where: { name }
      });
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  },

  // Get templates by category
  async getTemplatesByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const templates = await prisma.websiteTemplate.findMany({
        where: { 
          category,
          isActive: true 
        },
        orderBy: { sortOrder: 'asc' }
      });
      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  },

  // Apply template to restaurant
  async applyTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      // Fetch the template
      const template = await prisma.websiteTemplate.findUnique({
        where: { id: parseInt(id) }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Get or create restaurant settings
      const existingSettings = await prisma.restaurantSettings.findUnique({
        where: { restaurantId }
      });

      const defaultColors = template.defaultColors as any;
      const defaultFonts = template.defaultFonts as any;
      const now = new Date();

      // Apply template settings
      const updatedSettings = await prisma.restaurantSettings.upsert({
        where: { restaurantId },
        create: {
          restaurantId,
          templateId: template.id,
          // Apply default colors
          primaryColor: defaultColors.primary || '#000000',
          secondaryColor: defaultColors.secondary || '#ffffff',
          accentColor: defaultColors.accent || '#666666',
          // Apply default fonts
          fontPrimary: defaultFonts.heading || 'Playfair Display, serif',
          fontSecondary: defaultFonts.body || 'Inter, sans-serif',
          // Keep existing content if available
          heroTitle: existingSettings?.heroTitle || 'Welcome to Our Restaurant',
          heroSubtitle: existingSettings?.heroSubtitle || 'Experience Fine Dining at Its Best',
          aboutTitle: existingSettings?.aboutTitle || 'About Us',
          aboutDescription: existingSettings?.aboutDescription || '',
          // Keep existing images
          heroImageUrl: existingSettings?.heroImageUrl,
          aboutImageUrl: existingSettings?.aboutImageUrl,
          logoUrl: existingSettings?.logoUrl,
          updatedAt: now
        },
        update: {
          templateId: template.id,
          primaryColor: defaultColors.primary || '#000000',
          secondaryColor: defaultColors.secondary || '#ffffff',
          accentColor: defaultColors.accent || '#666666',
          fontPrimary: defaultFonts.heading || 'Playfair Display, serif',
          fontSecondary: defaultFonts.body || 'Inter, sans-serif',
          updatedAt: now
        }
      });

      // Update restaurant with template features
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          websiteSettings: {
            template: template.name,
            features: template.features,
            layoutConfig: template.layoutConfig,
            spacing: template.defaultSpacing,
            animations: {
              style: template.animationStyle,
              speed: template.transitionSpeed
            }
          }
        }
      });

      res.json({ 
        message: 'Template applied successfully',
        settings: updatedSettings
      });
    } catch (error) {
      console.error('Error applying template:', error);
      res.status(500).json({ error: 'Failed to apply template' });
    }
  },

  // Preview template (returns preview URL)
  async previewTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { slug: true }
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Generate preview URL
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const previewUrl = `${baseUrl}/${restaurant.slug}/preview?templateId=${id}`;

      res.json({ 
        templateId: parseInt(id),
        previewUrl 
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      res.status(500).json({ error: 'Failed to generate preview' });
    }
  }
}; 