import { api } from './api';
import { customerApi } from './customerApi';

export interface ContentBlock {
  id: number;
  restaurantId: number;
  page: string;
  blockType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  imagePublicId?: string;
  videoUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: string;
  settings?: any;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
} as const;

export const BLOCK_TYPE_LABELS = {
  [BLOCK_TYPES.TEXT]: 'Text Block',
  [BLOCK_TYPES.HTML]: 'HTML Block',
  [BLOCK_TYPES.IMAGE]: 'Image Block',
  [BLOCK_TYPES.VIDEO]: 'Video Block',
  [BLOCK_TYPES.CTA]: 'Call to Action',
  [BLOCK_TYPES.HERO]: 'Hero Section',
  [BLOCK_TYPES.FEATURES]: 'Features Grid',
  [BLOCK_TYPES.TESTIMONIAL]: 'Testimonial',
  [BLOCK_TYPES.GALLERY]: 'Image Gallery',
  [BLOCK_TYPES.CONTACT]: 'Contact Info',
  [BLOCK_TYPES.MAP]: 'Map',
  [BLOCK_TYPES.MENU_PREVIEW]: 'Menu Preview',
  [BLOCK_TYPES.RESERVATION_FORM]: 'Reservation Form'
};

export const contentBlockService = {
  // Get public content blocks for a page (customer portal)
  async getPublicBlocks(page: string = 'home'): Promise<ContentBlock[]> {
    const response = await customerApi.get('/content-blocks/public', {
      params: { page }
    });
    return response.data;
  },

  // Admin endpoints
  async getAllBlocks(): Promise<ContentBlock[]> {
    const response = await api.get('/content-blocks');
    return response.data;
  },

  async createBlock(block: Partial<ContentBlock>): Promise<ContentBlock> {
    const response = await api.post('/content-blocks', block);
    return response.data;
  },

  async updateBlock(id: number, block: Partial<ContentBlock>): Promise<ContentBlock> {
    const response = await api.put(`/content-blocks/${id}`, block);
    return response.data;
  },

  async deleteBlock(id: number): Promise<void> {
    await api.delete(`/content-blocks/${id}`);
  },

  async reorderBlocks(blocks: { id: number; displayOrder: number }[]): Promise<void> {
    await api.post('/content-blocks/reorder', { blocks });
  },

  async uploadImage(id: number, file: File): Promise<{ imageUrl: string; publicId: string; block: ContentBlock }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(`/content-blocks/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async duplicateBlock(id: number): Promise<ContentBlock> {
    const response = await api.post(`/content-blocks/${id}/duplicate`);
    return response.data;
  }
}; 