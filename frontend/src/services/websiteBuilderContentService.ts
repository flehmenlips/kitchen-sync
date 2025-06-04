import apiService from './apiService';

export interface WebsiteBuilderContent {
  // Hero section
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  heroCTAText?: string;
  heroCTALink?: string;
  
  // About section  
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImageUrl?: string;
}

class WebsiteBuilderContentService {
  async getContent(): Promise<WebsiteBuilderContent> {
    const response = await apiService.get<WebsiteBuilderContent>('/content-blocks/website-builder');
    return response.data;
  }

  async updateContent(content: Partial<WebsiteBuilderContent>): Promise<WebsiteBuilderContent> {
    const response = await apiService.put<WebsiteBuilderContent>('/content-blocks/website-builder', content);
    return response.data;
  }

  async uploadImage(field: 'hero' | 'about', file: File): Promise<{ imageUrl: string; content: WebsiteBuilderContent }> {
    const formData = new FormData();
    formData.append('image', file);
    
    // Use the dedicated Website Builder image upload endpoint
    const response = await apiService.post<{ imageUrl: string; content: WebsiteBuilderContent }>(
      `/content-blocks/website-builder/image/${field}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  }
}

export const websiteBuilderContentService = new WebsiteBuilderContentService(); 