import { api } from './api';

export interface Menu {
  id: number;
  name: string;
  title?: string;
  subtitle?: string;
  sections?: MenuSection[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuSection {
  id: number;
  name: string;
  position: number;
  active: boolean;
  items?: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price?: string;
  position: number;
  active: boolean;
  recipeId?: number;
  recipe?: any;
}

export const menuService = {
  // Get all menus
  async getMenus(): Promise<Menu[]> {
    const response = await api.get('/menus');
    return response.data;
  },

  // Get single menu by ID with sections and items
  async getMenuById(id: number): Promise<Menu> {
    const response = await api.get(`/menus/${id}`);
    return response.data;
  },

  // Create a new menu
  async createMenu(data: Partial<Menu>): Promise<Menu> {
    const response = await api.post('/menus', data);
    return response.data;
  },

  // Update a menu
  async updateMenu(id: number, data: Partial<Menu>): Promise<Menu> {
    const response = await api.put(`/menus/${id}`, data);
    return response.data;
  },

  // Delete a menu
  async deleteMenu(id: number): Promise<void> {
    await api.delete(`/menus/${id}`);
  },

  // Archive/unarchive a menu
  async archiveMenu(id: number, archived: boolean): Promise<Menu> {
    const response = await api.put(`/menus/${id}/archive`, { archived });
    return response.data;
  }
}; 