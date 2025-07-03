import { api } from './api';

export interface AssetFilters {
  folderId?: string;
  assetType?: string;
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface Asset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  assetType: string;
  altText?: string;
  description?: string;
  tags: string[];
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  folderId?: string;
  folderPath?: string;
  cloudinaryPublicId?: string;
  folder?: {
    id: string;
    name: string;
    colorHex: string;
  };
  usageRecords?: Array<{
    moduleName: string;
    referenceType: string;
    usedAt: string;
  }>;
}

export interface AssetFolder {
  id: string;
  name: string;
  colorHex: string;
  description?: string;
  parentFolderId?: string;
  sortOrder: number;
  isSystemFolder: boolean;
  createdAt: string;
  updatedAt: string;
  parentFolder?: AssetFolder;
  _count: {
    assets: number;
    subFolders: number;
  };
}

export interface AssetResponse {
  assets: Asset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AssetAnalytics {
  overview: {
    totalAssets: number;
    totalStorage: number;
    recentUploads: number;
  };
  mostUsedAssets: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    usageCount: number;
    assetType: string;
  }>;
  distribution: {
    byType: Array<{
      type: string;
      count: number;
    }>;
    storageByType: Array<{
      type: string;
      storage: number;
    }>;
  };
}

export const assetApi = {
  // Get assets with filtering and pagination
  async getAssets(restaurantId: number, filters: AssetFilters = {}): Promise<AssetResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/assets/restaurants/${restaurantId}/assets?${params}`);
    return response.data;
  },

  // Upload new asset
  async uploadAsset(
    restaurantId: number, 
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<Asset> {
    const response = await api.post(
      `/assets/restaurants/${restaurantId}/assets`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    return response.data;
  },

  // Update asset metadata
  async updateAsset(assetId: string, data: {
    fileName?: string;
    altText?: string;
    description?: string;
    tags?: string;
    folderId?: string;
  }): Promise<Asset> {
    const response = await api.put(`/assets/assets/${assetId}`, data);
    return response.data;
  },

  // Delete asset
  async deleteAsset(assetId: string): Promise<void> {
    await api.delete(`/assets/assets/${assetId}`);
  },

  // Track asset usage
  async trackAssetUsage(assetId: string, usage: {
    moduleName: string;
    referenceId: string;
    referenceType: string;
  }): Promise<void> {
    await api.post(`/assets/assets/${assetId}/usage`, usage);
  },

  // Get asset folders
  async getFolders(restaurantId: number): Promise<AssetFolder[]> {
    const response = await api.get(`/assets/restaurants/${restaurantId}/folders`);
    return response.data;
  },

  // Create new folder
  async createFolder(restaurantId: number, data: {
    name: string;
    parentFolderId?: string;
    colorHex?: string;
    description?: string;
  }): Promise<AssetFolder> {
    const response = await api.post(`/assets/restaurants/${restaurantId}/folders`, data);
    return response.data;
  },

  // Update folder
  async updateFolder(folderId: string, data: {
    name?: string;
    colorHex?: string;
    description?: string;
    sortOrder?: number;
  }): Promise<AssetFolder> {
    const response = await api.put(`/assets/folders/${folderId}`, data);
    return response.data;
  },

  // Delete folder
  async deleteFolder(folderId: string): Promise<void> {
    await api.delete(`/assets/folders/${folderId}`);
  },

  // Get asset analytics
  async getAnalytics(restaurantId: number, timeframe: '7d' | '30d' | '90d' = '30d'): Promise<AssetAnalytics> {
    const response = await api.get(`/assets/restaurants/${restaurantId}/assets/analytics?timeframe=${timeframe}`);
    return response.data;
  },

  // Get asset by ID (for detailed view)
  async getAsset(assetId: string): Promise<Asset> {
    const response = await api.get(`/assets/assets/${assetId}`);
    return response.data;
  },

  // Bulk operations
  async bulkDelete(assetIds: string[]): Promise<void> {
    await api.post('/assets/bulk/delete', { assetIds });
  },

  async bulkMove(assetIds: string[], folderId: string): Promise<void> {
    await api.post('/assets/bulk/move', { assetIds, folderId });
  },

  async bulkTag(assetIds: string[], tags: string[]): Promise<void> {
    await api.post('/assets/bulk/tag', { assetIds, tags });
  }
}; 