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
    
    // We'll need to upload to content blocks and then return the updated content
    // For now, we'll use the existing restaurant settings upload and then sync
    const response = await apiService.post<{ imageUrl: string; settings: any }>(
      `/restaurant/settings/image/${field}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // After uploading to restaurant settings, get the updated content from content blocks
    const updatedContent = await this.getContent();
    
    return {
      imageUrl: response.data.imageUrl,
      content: updatedContent
    };
  }
}

export const websiteBuilderContentService = new WebsiteBuilderContentService(); 