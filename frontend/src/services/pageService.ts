import { api } from './api';

export interface Page {
  id: number;
  restaurantId: number;
  name: string;
  slug: string;
  title?: string;
  description?: string;
  template: string;
  displayOrder: number;
  isActive: boolean;
  isSystem: boolean;
  metaTitle?: string;
  metaKeywords?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contentBlocks: number;
  };
}

export interface CreatePageRequest {
  name: string;
  slug?: string;
  title?: string;
  description?: string;
  template?: string;
  isActive?: boolean;
  metaTitle?: string;
  metaKeywords?: string;
}

export interface UpdatePageRequest {
  name?: string;
  slug?: string;
  title?: string;
  description?: string;
  template?: string;
  isActive?: boolean;
  metaTitle?: string;
  metaKeywords?: string;
}

export const PAGE_TEMPLATES = {
  DEFAULT: 'default',
  TWO_COLUMN: 'two-column',
  GALLERY: 'gallery',
  LANDING: 'landing',
  BLOG: 'blog',
  EVENTS: 'events'
} as const;

export const PAGE_TEMPLATE_LABELS = {
  [PAGE_TEMPLATES.DEFAULT]: 'Default Layout',
  [PAGE_TEMPLATES.TWO_COLUMN]: 'Two Column',
  [PAGE_TEMPLATES.GALLERY]: 'Gallery Grid',
  [PAGE_TEMPLATES.LANDING]: 'Landing Page',
  [PAGE_TEMPLATES.BLOG]: 'Blog Style',
  [PAGE_TEMPLATES.EVENTS]: 'Events List'
};

export const pageService = {
  // Get all pages for restaurant
  async getPages(): Promise<{ pages: Page[] }> {
    const response = await api.get('/pages');
    return response.data;
  },

  // Create new page
  async createPage(page: CreatePageRequest): Promise<Page> {
    const response = await api.post('/pages', page);
    return response.data;
  },

  // Update existing page
  async updatePage(id: number, page: UpdatePageRequest): Promise<Page> {
    const response = await api.put(`/pages/${id}`, page);
    return response.data;
  },

  // Delete page
  async deletePage(id: number): Promise<void> {
    await api.delete(`/pages/${id}`);
  },

  // Reorder pages
  async reorderPages(pages: { id: number; displayOrder: number }[]): Promise<void> {
    await api.post('/pages/reorder', { pages });
  },

  // Duplicate page
  async duplicatePage(id: number): Promise<Page> {
    const response = await api.post(`/pages/${id}/duplicate`);
    return response.data;
  },

  // Generate slug from name
  generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}; 