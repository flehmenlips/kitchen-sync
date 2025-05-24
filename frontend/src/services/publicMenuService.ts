import { api } from './api';

export interface PublicMenu {
  id: number;
  name: string;
  title?: string;
  subtitle?: string;
  sections: PublicMenuSection[];
  font?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  titleFontSize?: string;
  subtitleFontSize?: string;
  sectionFontSize?: string;
  itemNameFontSize?: string;
  itemDescFontSize?: string;
  showDollarSign: boolean;
  showDecimals: boolean;
  showSectionDividers: boolean;
  sectionDividerStyle?: string;
  sectionDividerWidth?: string;
  sectionDividerColor?: string;
}

export interface PublicMenuSection {
  id: number;
  name: string;
  position: number;
  items: PublicMenuItem[];
}

export interface PublicMenuItem {
  id: number;
  name: string;
  description?: string;
  price?: string;
  position: number;
  recipe?: {
    menuTitle?: string;
    menuDescription?: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    tags?: string[];
  };
}

const BASE_URL = '/public/menus';

export const publicMenuService = {
  // Get published menus (no auth required)
  async getPublishedMenus(): Promise<PublicMenu[]> {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  // Get single menu by ID (no auth required)
  async getMenuById(id: number): Promise<PublicMenu> {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get active menus for display
  async getActiveMenus(): Promise<PublicMenu[]> {
    const response = await api.get(`${BASE_URL}/active`);
    return response.data;
  }
}; 