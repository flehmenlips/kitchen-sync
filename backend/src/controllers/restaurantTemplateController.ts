import { Request, Response } from 'express';
import { restaurantTemplateService } from '../services/restaurantTemplateService';

export const restaurantTemplateController = {
  // Get all active restaurant templates
  async getActiveTemplates(req: Request, res: Response) {
    try {
      const templates = await restaurantTemplateService.getActiveTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching restaurant templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  },

  // Get templates by category
  async getTemplatesByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const templates = await restaurantTemplateService.getTemplatesByCategory(category);
      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      res.status(500).json({ error: 'Failed to fetch templates by category' });
    }
  },

  // Get single template by ID
  async getTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await restaurantTemplateService.getTemplate(id);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
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

      await restaurantTemplateService.applyTemplate(id, restaurantId);
      
      res.json({ 
        message: 'Template applied successfully',
        templateId: id,
        restaurantId
      });
    } catch (error) {
      console.error('Error applying template:', error);
      res.status(500).json({ error: 'Failed to apply template' });
    }
  },

  // Generate template preview URL
  async previewTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      // Get restaurant info for preview URL
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { slug: true }
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const previewUrl = restaurantTemplateService.generatePreviewUrl(id, restaurant.slug);

      res.json({ 
        templateId: id,
        previewUrl,
        restaurantSlug: restaurant.slug
      });
    } catch (error) {
      console.error('Error generating template preview:', error);
      res.status(500).json({ error: 'Failed to generate preview' });
    }
  },

  // Get template categories
  async getTemplateCategories(req: Request, res: Response) {
    try {
      const categories = restaurantTemplateService.getTemplateCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching template categories:', error);
      res.status(500).json({ error: 'Failed to fetch template categories' });
    }
  },

  // Seed templates to database (admin endpoint)
  async seedTemplates(req: Request, res: Response) {
    try {
      await restaurantTemplateService.seedTemplates();
      res.json({ message: 'Templates seeded successfully' });
    } catch (error) {
      console.error('Error seeding templates:', error);
      res.status(500).json({ error: 'Failed to seed templates' });
    }
  },

  // Get template recommendations for restaurant
  async getRecommendedTemplates(req: Request, res: Response) {
    try {
      const restaurantId = req.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant context required' });
      }

      // Get restaurant info to make intelligent recommendations
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: { plan: true }
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Get all templates and filter based on plan
      const allTemplates = await restaurantTemplateService.getActiveTemplates();
      
      // Filter premium templates based on plan
      const isPremiumPlan = restaurant.plan && ['PROFESSIONAL', 'ENTERPRISE'].includes(restaurant.plan.name);
      const availableTemplates = allTemplates.filter(template => 
        !template.isPremium || isPremiumPlan
      );

      // Recommend 3-5 templates based on restaurant characteristics
      // This is a simple recommendation - could be enhanced with ML
      const recommended = availableTemplates
        .sort((a, b) => {
          // Prioritize free templates for non-premium plans
          if (!isPremiumPlan && a.isPremium !== b.isPremium) {
            return a.isPremium ? 1 : -1;
          }
          // Then by sort order
          return a.sortOrder - b.sortOrder;
        })
        .slice(0, 5);

      res.json({
        recommended,
        availableCount: availableTemplates.length,
        totalCount: allTemplates.length,
        isPremiumPlan,
        planName: restaurant.plan?.name || 'FREE'
      });
    } catch (error) {
      console.error('Error getting template recommendations:', error);
      res.status(500).json({ error: 'Failed to get template recommendations' });
    }
  }
}; 