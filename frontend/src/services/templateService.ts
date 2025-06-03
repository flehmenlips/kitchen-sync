import { api } from './api';

export interface WebsiteTemplate {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  thumbnail?: string;
  layoutConfig: any;
  defaultColors: any;
  defaultFonts: any;
  defaultSpacing: any;
  heroStyle: string;
  menuStyle: string;
  aboutStyle: string;
  navigationStyle: string;
  headingStyle: string;
  bodyStyle: string;
  letterSpacing: string;
  textTransform: string;
  animationStyle: string;
  transitionSpeed: string;
  features: string[];
  isPremium: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface TemplatePreview {
  templateId: number;
  previewUrl: string;
}

class TemplateService {
  async getTemplates(): Promise<WebsiteTemplate[]> {
    const response = await api.get('/templates');
    return response.data;
  }

  async getTemplate(id: number): Promise<WebsiteTemplate> {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  }

  async getTemplateByName(name: string): Promise<WebsiteTemplate> {
    const response = await api.get(`/templates/name/${name}`);
    return response.data;
  }

  async applyTemplate(templateId: number): Promise<void> {
    await api.post(`/templates/${templateId}/apply`);
  }

  async previewTemplate(templateId: number): Promise<TemplatePreview> {
    const response = await api.post(`/templates/${templateId}/preview`);
    return response.data;
  }

  async getActiveTemplates(): Promise<WebsiteTemplate[]> {
    const response = await api.get('/templates/active');
    return response.data;
  }

  async getTemplatesByCategory(category: string): Promise<WebsiteTemplate[]> {
    const response = await api.get(`/templates/category/${category}`);
    return response.data;
  }
}

export const templateService = new TemplateService(); 