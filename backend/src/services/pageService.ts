import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PageData {
  id: number;
  restaurantId: number;
  name: string;
  slug: string;
  title: string | null;
  description: string | null;
  template: string;
  displayOrder: number;
  isActive: boolean;
  isSystem: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePageData {
  name: string;
  slug: string;
  title?: string | null;
  description?: string | null;
  template?: string;
  displayOrder?: number;
  isActive?: boolean;
  isSystem?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
}

export class PageService {
  async createPage(restaurantId: number, pageData: CreatePageData): Promise<PageData> {
    return prisma.page.create({
      data: {
        ...pageData,
        restaurantId,
        template: pageData.template || 'default',
        displayOrder: pageData.displayOrder || 0,
        isActive: pageData.isActive ?? true,
        isSystem: pageData.isSystem ?? false
      }
    });
  }

  async updatePage(pageId: number, restaurantId: number, pageData: Partial<CreatePageData>): Promise<PageData> {
    return prisma.page.update({
      where: {
        id: pageId
      },
      data: pageData
    });
  }

  async deletePage(pageId: number, restaurantId: number): Promise<void> {
    const page = await this.getPageById(pageId, restaurantId);
    if (!page) {
      throw new Error('Page not found');
    }
    if (page.isSystem) {
      throw new Error('Cannot delete system pages');
    }
    
    await prisma.page.delete({
      where: {
        id: pageId
      }
    });
  }

  async getPageById(pageId: number, restaurantId: number): Promise<PageData | null> {
    return prisma.page.findFirst({
      where: {
        id: pageId,
        restaurantId
      }
    });
  }

  async getPages(restaurantId: number): Promise<PageData[]> {
    return prisma.page.findMany({
      where: {
        restaurantId
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });
  }

  async getPagesWithContentCounts(restaurantId: number): Promise<PageData[]> {
    return this.getPages(restaurantId);
  }

  async getActivePages(restaurantId: number): Promise<PageData[]> {
    return prisma.page.findMany({
      where: {
        restaurantId,
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });
  }

  async reorderPages(restaurantId: number, pageOrders: Array<{ id: number; displayOrder: number }>): Promise<void> {
    await Promise.all(
      pageOrders.map(({ id, displayOrder }) =>
        prisma.page.update({
          where: { id },
          data: { displayOrder }
        })
      )
    );
  }

  async getSystemPages(restaurantId: number): Promise<PageData[]> {
    return prisma.page.findMany({
      where: {
        restaurantId,
        isSystem: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });
  }

  async getCustomPages(restaurantId: number): Promise<PageData[]> {
    return prisma.page.findMany({
      where: {
        restaurantId,
        isSystem: false
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });
  }

  async getPageCount(restaurantId: number): Promise<number> {
    return prisma.page.count({
      where: {
        restaurantId
      }
    });
  }

  async getActivePageCount(restaurantId: number): Promise<number> {
    return prisma.page.count({
      where: {
        restaurantId,
        isActive: true
      }
    });
  }
}

// Create and export service instance
export const pageService = new PageService(); 