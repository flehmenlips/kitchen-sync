import prisma from '../config/db';

export interface WebsiteResetOptions {
  preserveAssets: boolean;
  preserveSettings?: boolean;
}

export interface DefaultWebsiteTemplate {
  contentBlocks: Array<{
    page: string;
    blockType: string;
    title?: string;
    subtitle?: string;
    content?: string;
    displayOrder: number;
    settings?: any;
  }>;
  restaurantSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontPrimary?: string;
    fontSecondary?: string;
  };
}

// Default website template with basic content blocks
const DEFAULT_WEBSITE_TEMPLATE: DefaultWebsiteTemplate = {
  contentBlocks: [
    {
      page: 'home',
      blockType: 'hero',
      title: 'Welcome to Our Restaurant',
      subtitle: 'Experience exceptional dining',
      displayOrder: 0,
      settings: {
        style: 'standard',
        overlay: true
      }
    },
    {
      page: 'home',
      blockType: 'about',
      title: 'About Us',
      subtitle: 'Our Story',
      content: 'We are passionate about creating memorable dining experiences with fresh, locally-sourced ingredients.',
      displayOrder: 1,
      settings: {
        style: 'side-by-side'
      }
    },
    {
      page: 'home',
      blockType: 'contact',
      title: 'Contact Us',
      subtitle: 'Get in Touch',
      displayOrder: 2,
      settings: {
        showMap: true,
        showHours: true
      }
    }
  ],
  restaurantSettings: {
    primaryColor: '#1a1a1a',
    secondaryColor: '#ffffff',
    accentColor: '#d4af37',
    fontPrimary: 'Playfair Display, serif',
    fontSecondary: 'Inter, sans-serif'
  }
};

class WebsiteManagementService {
  /**
   * Get website summary/stats for a restaurant
   */
  async getWebsiteSummary(restaurantId: number) {
    const [contentBlocks, restaurantSettings, templateApplication] = await Promise.all([
      prisma.contentBlock.count({
        where: { restaurantId, isActive: true }
      }),
      prisma.restaurantSettings.findUnique({
        where: { restaurantId },
        select: {
          heroTitle: true,
          heroSubtitle: true,
          primaryColor: true,
          updatedAt: true
        }
      }),
      prisma.templateApplication.findFirst({
        where: { restaurantId, isActive: true },
        include: {
          template: {
            select: {
              name: true,
              displayName: true
            }
          }
        },
        orderBy: { appliedAt: 'desc' }
      })
    ]);

    return {
      contentBlocksCount: contentBlocks,
      hasSettings: !!restaurantSettings,
      currentTemplate: templateApplication?.template?.displayName || templateApplication?.template?.name || null,
      lastUpdated: restaurantSettings?.updatedAt || null
    };
  }

  /**
   * Reset website to default template
   * This deletes all content blocks and resets settings
   */
  async resetWebsite(restaurantId: number, options: WebsiteResetOptions = { preserveAssets: true }) {
    try {
      // Start transaction
      await prisma.$transaction(async (tx) => {
        // 1. Delete all content blocks
        await tx.contentBlock.deleteMany({
          where: { restaurantId }
        });

        // 2. Create default content blocks
        const defaultBlocks = DEFAULT_WEBSITE_TEMPLATE.contentBlocks.map(block => ({
          restaurantId,
          page: block.page,
          blockType: block.blockType,
          title: block.title,
          subtitle: block.subtitle,
          content: block.content,
          displayOrder: block.displayOrder,
          settings: block.settings || {},
          isActive: true
        }));

        await tx.contentBlock.createMany({
          data: defaultBlocks
        });

        // 3. Reset restaurant settings to defaults
        const defaultSettings = DEFAULT_WEBSITE_TEMPLATE.restaurantSettings || {};
        await tx.restaurantSettings.upsert({
          where: { restaurantId },
          create: {
            restaurantId,
            primaryColor: defaultSettings.primaryColor || '#1a1a1a',
            secondaryColor: defaultSettings.secondaryColor || '#ffffff',
            accentColor: defaultSettings.accentColor || '#d4af37',
            fontPrimary: defaultSettings.fontPrimary || 'Playfair Display, serif',
            fontSecondary: defaultSettings.fontSecondary || 'Inter, sans-serif',
            heroTitle: 'Welcome to Our Restaurant',
            heroSubtitle: 'Experience exceptional dining',
            aboutTitle: 'About Us',
            aboutDescription: 'We are passionate about creating memorable dining experiences.'
          },
          update: {
            primaryColor: defaultSettings.primaryColor || '#1a1a1a',
            secondaryColor: defaultSettings.secondaryColor || '#ffffff',
            accentColor: defaultSettings.accentColor || '#d4af37',
            fontPrimary: defaultSettings.fontPrimary || 'Playfair Display, serif',
            fontSecondary: defaultSettings.fontSecondary || 'Inter, sans-serif',
            heroTitle: 'Welcome to Our Restaurant',
            heroSubtitle: 'Experience exceptional dining',
            aboutTitle: 'About Us',
            aboutDescription: 'We are passionate about creating memorable dining experiences.',
            // Clear images if not preserving assets
            ...(options.preserveAssets ? {} : {
              heroImageUrl: null,
              aboutImageUrl: null,
              logoUrl: null
            })
          }
        });

        // 4. Deactivate all template applications
        await tx.templateApplication.updateMany({
          where: { restaurantId, isActive: true },
          data: { isActive: false }
        });

        // 5. Clear website settings in restaurant table
        await tx.restaurant.update({
          where: { id: restaurantId },
          data: {
            websiteSettings: null
          }
        });

        // 6. If not preserving assets, optionally delete asset references from content blocks
        // (Assets themselves are preserved in brand_assets table unless explicitly deleted)
        if (!options.preserveAssets) {
          // Update content blocks to remove image references
          await tx.contentBlock.updateMany({
            where: { restaurantId },
            data: {
              imageUrl: null,
              imagePublicId: null
            }
          });
        }
      });

      return {
        success: true,
        message: 'Website reset successfully',
        blocksCreated: DEFAULT_WEBSITE_TEMPLATE.contentBlocks.length
      };
    } catch (error) {
      console.error('Error resetting website:', error);
      throw error;
    }
  }

  /**
   * Delete website completely (more aggressive than reset)
   * This removes all content blocks, settings, and optionally assets
   */
  async deleteWebsite(restaurantId: number, options: WebsiteResetOptions = { preserveAssets: true }) {
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Delete all content blocks
        await tx.contentBlock.deleteMany({
          where: { restaurantId }
        });

        // 2. Delete restaurant settings
        await tx.restaurantSettings.deleteMany({
          where: { restaurantId }
        });

        // 3. Delete all template applications
        await tx.templateApplication.deleteMany({
          where: { restaurantId }
        });

        // 4. Clear website settings
        await tx.restaurant.update({
          where: { id: restaurantId },
          data: {
            websiteSettings: null,
            website_builder_enabled: false
          }
        });

        // 5. Optionally delete assets (if not preserving)
        if (!options.preserveAssets) {
          await tx.brandAsset.deleteMany({
            where: { restaurantId }
          });
        }
      });

      return {
        success: true,
        message: 'Website deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting website:', error);
      throw error;
    }
  }

  /**
   * Get default website template
   */
  getDefaultTemplate(): DefaultWebsiteTemplate {
    return DEFAULT_WEBSITE_TEMPLATE;
  }
}

export const websiteManagementService = new WebsiteManagementService();

