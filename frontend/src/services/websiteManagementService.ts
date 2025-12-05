import { api } from './api';

export interface WebsiteSummary {
  contentBlocksCount: number;
  hasSettings: boolean;
  currentTemplate: string | null;
  lastUpdated: string | null;
}

export interface WebsiteResetOptions {
  preserveAssets: boolean;
  preserveSettings?: boolean;
}

export interface WebsiteResetResult {
  success: boolean;
  message: string;
  blocksCreated?: number;
}

class WebsiteManagementService {
  // Get website summary/stats
  async getWebsiteSummary(): Promise<WebsiteSummary> {
    const response = await api.get('/website-management/summary');
    return response.data;
  }

  // Reset website to default template
  async resetWebsite(options: WebsiteResetOptions): Promise<WebsiteResetResult> {
    const response = await api.post('/website-management/reset', options);
    return response.data;
  }

  // Delete website completely
  async deleteWebsite(options: WebsiteResetOptions): Promise<WebsiteResetResult> {
    const response = await api.delete('/website-management', { data: options });
    return response.data;
  }

  // Get default template preview
  async getDefaultTemplate() {
    const response = await api.get('/website-management/default-template');
    return response.data;
  }
}

export const websiteManagementService = new WebsiteManagementService();

