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

  // Update asset metadata - FIXED: Use correct endpoint with restaurantId
  async updateAsset(restaurantId: number, assetId: string, data: {
    fileName?: string;
    altText?: string;
    description?: string;
    tags?: string;
    folderId?: string;
  }): Promise<Asset> {
    const response = await api.put(`/assets/restaurants/${restaurantId}/assets/${assetId}`, data);
    return response.data;
  },

  // Delete asset - FIXED: Use correct endpoint with restaurantId
  async deleteAsset(restaurantId: number, assetId: string): Promise<void> {
    await api.delete(`/assets/restaurants/${restaurantId}/assets/${assetId}`);
  },

  // Track asset usage - FIXED: Use correct endpoint with restaurantId
  async trackAssetUsage(restaurantId: number, assetId: string, usage: {
    moduleName: string;
    referenceId: string;
    referenceType: string;
  }): Promise<void> {
    await api.post(`/assets/restaurants/${restaurantId}/assets/${assetId}/track-usage`, usage);
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

  // Update folder - FIXED: Use correct endpoint with restaurantId
  async updateFolder(restaurantId: number, folderId: string, data: {
    name?: string;
    colorHex?: string;
    description?: string;
    sortOrder?: number;
  }): Promise<AssetFolder> {
    const response = await api.put(`/assets/restaurants/${restaurantId}/folders/${folderId}`, data);
    return response.data;
  },

  // Delete folder - FIXED: Use correct endpoint with restaurantId
  async deleteFolder(restaurantId: number, folderId: string, options?: {
    force?: boolean;
    moveAssetsToParent?: boolean;
  }): Promise<{ message: string; details?: any }> {
    const params = new URLSearchParams();
    if (options?.force) params.append('force', 'true');
    if (options?.moveAssetsToParent) params.append('moveAssetsToParent', 'true');
    
    const url = `/assets/restaurants/${restaurantId}/folders/${folderId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.delete(url);
    return response.data;
  },

  // Get asset analytics
  async getAnalytics(restaurantId: number, timeframe: '7d' | '30d' | '90d' = '30d'): Promise<AssetAnalytics> {
    const response = await api.get(`/assets/restaurants/${restaurantId}/assets/analytics?timeframe=${timeframe}`);
    return response.data;
  },

  // Get asset by ID (for detailed view) - FIXED: Use correct endpoint with restaurantId
  async getAsset(restaurantId: number, assetId: string): Promise<Asset> {
    const response = await api.get(`/assets/restaurants/${restaurantId}/assets/${assetId}`);
    return response.data;
  },

  // Bulk operations - FIXED: Use correct endpoints with restaurantId
  async bulkDelete(restaurantId: number, assetIds: string[]): Promise<void> {
    await api.post(`/assets/restaurants/${restaurantId}/bulk/delete`, { assetIds });
  },

  async bulkMove(restaurantId: number, assetIds: string[], folderId: string): Promise<void> {
    await api.post(`/assets/restaurants/${restaurantId}/bulk/move`, { assetIds, folderId });
  },

  async bulkTag(restaurantId: number, assetIds: string[], tags: string[]): Promise<void> {
    await api.post(`/assets/restaurants/${restaurantId}/bulk/tag`, { assetIds, tags });
  },

  // Import assets from Cloudinary
  async importAllAssets(restaurantId: number): Promise<{
    success: boolean;
    message: string;
    imported: number;
    totalCloudinary: number;
    totalDatabase: number;
    skipped: number;
  }> {
    const response = await api.post(`/assets/restaurants/${restaurantId}/import-all`);
    return response.data;
  },

  // Test API connection
  async testApi(restaurantId: number): Promise<{
    success: boolean;
    message: string;
    restaurantId: number;
    userId: number;
    environment: string;
    timestamp: string;
  }> {
    const response = await api.get(`/assets/restaurants/${restaurantId}/test`);
    return response.data;
  },

  // Migrate assets to standardized folder structure
  async migrateFolderStructure(restaurantId: number, folderMapping?: Record<string, string>): Promise<{
    success: boolean;
    message: string;
    migration: {
      migrated: number;
      failed: number;
      skipped: number;
      details: Array<{ oldPublicId: string; newPublicId: string; status: string }>;
    };
    databaseUpdates: number;
  }> {
    const response = await api.post(`/assets/restaurants/${restaurantId}/migrate-folder-structure`, { folderMapping });
    return response.data;
  }
}; 