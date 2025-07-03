import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Tabs,
  Tab,
  Menu,
  Fab
} from '@mui/material';
import {
  Close,
  Search,
  Folder,
  Home,
  CloudDownload,
  ViewModule,
  ViewList,
  ArrowBack,
  CreateNewFolder,
  Refresh,
  Image,
  VideoFile,
  Description,
  InsertDriveFile,
  Upload,
  MoreVert,
  Edit,
  Delete,
  Download,
  Add
} from '@mui/icons-material';
import { assetApi } from '../services/assetApi';
import { useRestaurant } from '../context/RestaurantContext';

interface Asset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  assetType: string;
  altText?: string;
  description?: string;
  createdAt: string;
  folderId?: string;
  folderPath?: string;
  tags?: string[];
}

interface AssetFolder {
  id: string;
  name: string;
  parentFolderId?: string;
  colorHex: string;
  description?: string;
  assetCount: number;
}

interface AssetLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  allowedTypes?: string[];
  title?: string;
}

const AssetLibraryModal: React.FC<AssetLibraryModalProps> = ({
  open,
  onClose,
  onSelect,
  allowedTypes = ['image'],
  title = 'Asset Library'
}) => {
  const { currentRestaurant } = useRestaurant();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('All Assets');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetMenuAnchor, setAssetMenuAnchor] = useState<null | HTMLElement>(null);
  const [editAssetDialogOpen, setEditAssetDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editAssetData, setEditAssetData] = useState<Partial<Asset>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch assets and folders
  const fetchAssets = async () => {
    if (!currentRestaurant) {
      console.log('[AssetLibrary] No currentRestaurant found');
      return;
    }
    
    console.log('[AssetLibrary] Fetching assets for restaurant:', currentRestaurant.id);
    console.log('[AssetLibrary] Search term:', searchTerm);
    console.log('[AssetLibrary] Asset type filter:', assetTypeFilter);
    console.log('[AssetLibrary] Current folder ID:', currentFolderId);
    setLoading(true);
    setError('');
    
    try {
      // Fetch assets
      const assetResponse = await assetApi.getAssets(currentRestaurant.id, {
        assetType: assetTypeFilter || undefined,
        search: searchTerm || undefined,
        folderId: currentFolderId || undefined,
        limit: 100
      });
      
      console.log('[AssetLibrary] Raw API response:', assetResponse);
      console.log('[AssetLibrary] Total assets returned:', assetResponse.assets?.length || 0);
      
      // Fetch folders (placeholder - will implement when backend is ready)
      const demoFolders: AssetFolder[] = [
        {
          id: 'website-assets',
          name: 'Website Assets',
          colorHex: '#1976d2',
          description: 'Images for website builder',
          assetCount: 4
        },
        {
          id: 'hero-images',
          name: 'Hero Images',
          parentFolderId: 'website-assets',
          colorHex: '#f44336',
          description: 'Hero section backgrounds',
          assetCount: 2
        },
        {
          id: 'recipe-photos',
          name: 'Recipe Photos',
          colorHex: '#4caf50',
          description: 'Recipe and food photography',
          assetCount: 0
        }
      ];
      
      // Filter by allowed types
      const filteredAssets = assetResponse.assets.filter(asset => 
        allowedTypes.includes(asset.assetType.toLowerCase())
      );
      
      console.log('[AssetLibrary] Filtered assets (by type):', filteredAssets.length);
      console.log('[AssetLibrary] Allowed types:', allowedTypes);
      console.log('[AssetLibrary] Sample assets:', filteredAssets.slice(0, 3));
      
      setAssets(filteredAssets);
      setFolders(demoFolders);
      
      if (filteredAssets.length === 0 && !searchTerm) {
        setError(`No assets found. Total from API: ${assetResponse.assets?.length || 0}. Upload some images to get started!`);
      }
    } catch (error: any) {
      console.error('[AssetLibrary] API Error:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication required. Please login to access assets.');
      } else if (error.response?.status === 404) {
        setError('No assets found. Upload some images to get started.');
      } else {
        setError(`Failed to load assets: ${error.message || 'Connection error'}`);
      }
      
      // Show demo assets for development
      setAssets([
        {
          id: 'demo-1',
          fileName: 'hero-restaurant.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
          fileSize: 856000,
          mimeType: 'image/jpeg',
          assetType: 'image',
          altText: 'Elegant restaurant interior',
          createdAt: new Date().toISOString(),
          folderId: 'hero-images',
          folderPath: '/Website Assets/Hero Images',
          tags: ['hero', 'restaurant', 'interior']
        },
        {
          id: 'demo-2',
          fileName: 'food-platter.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
          fileSize: 724000,
          mimeType: 'image/jpeg',
          assetType: 'image',
          altText: 'Delicious food platter',
          createdAt: new Date().toISOString(),
          folderId: 'website-assets',
          folderPath: '/Website Assets',
          tags: ['food', 'platter', 'menu']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open && currentRestaurant) {
      fetchAssets();
    }
  }, [open, currentRestaurant, searchTerm, assetTypeFilter, currentFolderId]);

  // Get asset icon
  const getAssetIcon = (assetType: string) => {
    switch (assetType) {
      case 'image': return <Image />;
      case 'video': return <VideoFile />;
      case 'document': return <Description />;
      default: return <InsertDriveFile />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Navigate to folder
  const navigateToFolder = (folderId: string | null, folderName: string) => {
    setCurrentFolderId(folderId);
    setCurrentFolderPath(folderId ? folderName : 'All Assets');
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !currentRestaurant) return;
    
    const file = files[0];
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata
      formData.append('description', `Uploaded from Asset Library`);
      formData.append('altText', file.name);
      if (currentFolderId) {
        formData.append('folderId', currentFolderId);
      }
      
      // Upload the asset
      const uploadedAsset = await assetApi.uploadAsset(
        currentRestaurant.id,
        formData,
        (progress) => setUploadProgress(progress)
      );
      
      console.log('[AssetLibrary] Upload successful:', uploadedAsset);
      
      // Refresh the assets list
      await fetchAssets();
      
      // Clear the file input
      event.target.value = '';
      
    } catch (error) {
      console.error('[AssetLibrary] Upload failed:', error);
      setError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Import existing assets from Cloudinary
  const handleImportAssets = async () => {
    if (!currentRestaurant) {
      setError('No restaurant selected');
      return;
    }
    
    setImporting(true);
    setError('');
    
    try {
      console.log('[AssetLibrary] Starting asset import for restaurant:', currentRestaurant.id);
      
      const response = await fetch(`/api/assets/restaurants/${currentRestaurant.id}/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('[AssetLibrary] Import result:', result);
      
      // Show success message
      setError(`✅ Successfully imported ${result.imported} assets from Cloudinary!`);
      
      // Refresh the asset list
      fetchAssets();
      
    } catch (error: any) {
      console.error('[AssetLibrary] Import error:', error);
      setError(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Import ALL historical assets from Cloudinary
  const handleImportAllAssets = async () => {
    if (!currentRestaurant) {
      setError('No restaurant selected');
      return;
    }
    
    setImporting(true);
    setError('');
    
    try {
      console.log('[AssetLibrary] Starting FULL historical import for restaurant:', currentRestaurant.id);
      
      const response = await fetch(`/api/assets/restaurants/${currentRestaurant.id}/import-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[AssetLibrary] Response status:', response.status);
      console.log('[AssetLibrary] Response headers:', response.headers);
      
      // Get the response text once
      const responseText = await response.text();
      console.log('[AssetLibrary] Raw response length:', responseText.length);
      console.log('[AssetLibrary] Raw response preview:', responseText.substring(0, 200));
      
      if (!response.ok) {
        console.error('[AssetLibrary] Import failed:', response.status, responseText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${responseText}`);
      }
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      console.log('[AssetLibrary] Content-Type:', contentType);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('[AssetLibrary] Full import result:', result);
      } catch (jsonError) {
        console.error('[AssetLibrary] JSON parsing failed:', jsonError);
        console.error('[AssetLibrary] Raw response:', responseText);
        throw new Error(`JSON parsing failed: ${jsonError.message}. Raw response: ${responseText.substring(0, 500)}...`);
      }
      
      // Refresh the asset list first
      await fetchAssets();
      
      // Show detailed success message
      if (result.success) {
        const message = `🎉 Historical import complete! 
        
Imported ${result.imported} new assets:
• 📸 ${result.categories?.recipes || 0} recipe photos
• 🌐 ${result.categories?.contentBlocks || 0} website images  
• 🎥 ${result.categories?.videos || 0} videos
• 📁 ${result.categories?.other || 0} other assets

Total in your library: ${result.totalDatabase} assets
Found in Cloudinary: ${result.totalCloudinary} assets`;
      
        alert(message); // Use alert for immediate visibility
        setError('✅ Import completed successfully!');
      } else {
        setError(`Import completed with issues: ${result.message}`);
      }
      
    } catch (error: any) {
      console.error('[AssetLibrary] Full import error:', error);
      setError(`❌ Historical import failed: ${error.message}`);
      alert(`Import failed: ${error.message}`); // Show error prominently
    } finally {
      setImporting(false);
    }
  };

  // Asset Context Menu Handlers
  const handleAssetMenuClick = (event: React.MouseEvent<HTMLElement>, asset: Asset) => {
    event.stopPropagation();
    setSelectedAsset(asset);
    setAssetMenuAnchor(event.currentTarget);
  };

  const handleAssetMenuClose = () => {
    setAssetMenuAnchor(null);
    setSelectedAsset(null);
  };

  // Edit Asset Handler
  const handleEditAsset = () => {
    if (selectedAsset) {
      setEditAssetData({
        fileName: selectedAsset.fileName,
        altText: selectedAsset.altText || '',
        description: selectedAsset.description || '',
        tags: selectedAsset.tags || []
      });
      setEditAssetDialogOpen(true);
    }
    handleAssetMenuClose();
  };

  const handleEditAssetSave = async () => {
    if (!selectedAsset || !currentRestaurant) return;
    
    try {
      setLoading(true);
      // TODO: Implement asset update API call
      // await assetApi.updateAsset(currentRestaurant.id, selectedAsset.id, editAssetData);
      
      console.log('[AssetLibrary] Asset edit would save:', editAssetData);
      alert('Asset edit functionality coming soon!');
      
      setEditAssetDialogOpen(false);
      await fetchAssets();
    } catch (error) {
      console.error('[AssetLibrary] Edit failed:', error);
      setError(`Edit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete Asset Handler
  const handleDeleteAsset = () => {
    setDeleteConfirmOpen(true);
    handleAssetMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAsset || !currentRestaurant) return;
    
    try {
      setLoading(true);
      // TODO: Implement asset delete API call
      // await assetApi.deleteAsset(currentRestaurant.id, selectedAsset.id);
      
      console.log('[AssetLibrary] Asset delete would remove:', selectedAsset.id);
      alert('Asset delete functionality coming soon!');
      
      setDeleteConfirmOpen(false);
      await fetchAssets();
    } catch (error) {
      console.error('[AssetLibrary] Delete failed:', error);
      setError(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Download Asset Handler
  const handleDownloadAsset = () => {
    if (selectedAsset) {
      const link = document.createElement('a');
      link.href = selectedAsset.fileUrl;
      link.download = selectedAsset.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    handleAssetMenuClose();
  };

  // Test API connection
  const handleTestApi = async () => {
    if (!currentRestaurant) {
      setError('No restaurant selected');
      return;
    }
    
    try {
      console.log('[AssetLibrary] Testing API connection...');
      
      const response = await fetch(`/api/assets/restaurants/${currentRestaurant.id}/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const responseText = await response.text();
      console.log('[AssetLibrary] Test API response:', responseText);
      
      if (response.ok) {
        const result = JSON.parse(responseText);
        alert(`✅ API Test Success!\n\nRestaurant ID: ${result.restaurantId}\nUser ID: ${result.userId}\nEnvironment: ${result.environment}\nTimestamp: ${result.timestamp}`);
      } else {
        alert(`❌ API Test Failed!\n\nStatus: ${response.status}\nResponse: ${responseText}`);
      }
    } catch (error: any) {
      console.error('[AssetLibrary] Test API error:', error);
      alert(`❌ API Test Error: ${error.message}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '85vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={uploading ? <CircularProgress size={16} /> : <Upload />}
            disabled={uploading}
            component="label"
          >
            {uploading ? `Uploading ${uploadProgress}%` : 'Upload Files'}
            <input
              type="file"
              hidden
              accept={allowedTypes.includes('image') ? 'image/*' : '*/*'}
              onChange={handleFileUpload}
            />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', gap: 2 }}>
        {/* Folder Sidebar */}
        <Paper sx={{ width: 250, p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            📁 Folders
          </Typography>
          
          <List dense>
            <ListItemButton
              selected={currentFolderId === null}
              onClick={() => navigateToFolder(null, 'All Assets')}
            >
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="All Assets" />
            </ListItemButton>
            
            {folders.map(folder => (
              <ListItemButton
                key={folder.id}
                selected={currentFolderId === folder.id}
                onClick={() => navigateToFolder(folder.id, folder.name)}
                sx={{ pl: folder.parentFolderId ? 4 : 2 }}
              >
                <ListItemIcon>
                  <Folder sx={{ color: folder.colorHex }} />
                </ListItemIcon>
                <ListItemText 
                  primary={folder.name}
                  secondary={`${folder.assetCount} items`}
                />
              </ListItemButton>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Button
            size="small"
            startIcon={<CreateNewFolder />}
            onClick={() => alert('Folder creation coming soon!')}
            fullWidth
          >
            New Folder
          </Button>
        </Paper>

        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          {/* Breadcrumb and Search */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {currentFolderId && (
              <IconButton
                size="small"
                onClick={() => navigateToFolder(null, 'All Assets')}
              >
                <ArrowBack />
              </IconButton>
            )}
            
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {currentFolderPath}
            </Typography>
            
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                console.log('[AssetLibrary] Manual refresh triggered');
                fetchAssets();
              }}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
            
            <TextField
              size="small"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ width: 250 }}
            />
            
            {allowedTypes.length > 1 && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={assetTypeFilter}
                  onChange={(e) => setAssetTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {allowedTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}s
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Assets Grid */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              {assets.map(asset => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { 
                        transform: 'scale(1.02)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                  >
                    {asset.assetType === 'image' ? (
                      <CardMedia
                        component="img"
                        height="120"
                        image={asset.fileUrl}
                        alt={asset.altText}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 120,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100'
                        }}
                      >
                        {getAssetIcon(asset.assetType)}
                      </Box>
                    )}
                    <CardContent sx={{ p: 1.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box flex={1} minWidth={0}>
                          <Typography variant="body2" noWrap title={asset.fileName}>
                            {asset.fileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(asset.fileSize)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleAssetMenuClick(e, asset)}
                          sx={{ ml: 1 }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>
                      {asset.tags && asset.tags.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {asset.tags.slice(0, 2).map(tag => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.6rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {assets.length === 0 && !loading && (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm ? 'No matching assets found' : 'No assets in this folder'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm ? 'Try a different search term' : 'Upload some files to get started'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => alert('Use the main upload interface for now')}
              >
                Upload Files
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
          {assets.length} assets • Folder management in development
        </Typography>
        <Button
          onClick={handleTestApi}
          variant="outlined"
          size="small"
          sx={{ mr: 1 }}
        >
          🧪 Test API
        </Button>
        <Button
          onClick={handleImportAssets}
          disabled={importing}
          startIcon={importing ? <CircularProgress size={16} /> : <Upload />}
          variant="outlined"
        >
          {importing ? 'Importing...' : 'Import from Cloudinary'}
        </Button>
        <Button
          onClick={handleImportAllAssets}
          disabled={importing}
          startIcon={importing ? <CircularProgress size={16} /> : <Upload />}
          variant="outlined"
        >
          {importing ? 'Importing...' : 'Import ALL historical assets'}
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>

      {/* Asset Context Menu */}
      <Menu
        anchorEl={assetMenuAnchor}
        open={Boolean(assetMenuAnchor)}
        onClose={handleAssetMenuClose}
      >
        <MenuItem onClick={handleEditAsset}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownloadAsset}>
          <ListItemIcon><Download fontSize="small" /></ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteAsset} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Asset Dialog */}
      <Dialog open={editAssetDialogOpen} onClose={() => setEditAssetDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Asset Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="File Name"
              value={editAssetData.fileName || ''}
              onChange={(e) => setEditAssetData({ ...editAssetData, fileName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Alt Text"
              value={editAssetData.altText || ''}
              onChange={(e) => setEditAssetData({ ...editAssetData, altText: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={editAssetData.description || ''}
              onChange={(e) => setEditAssetData({ ...editAssetData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Tags (comma separated)"
              value={editAssetData.tags?.join(', ') || ''}
              onChange={(e) => setEditAssetData({ 
                ...editAssetData, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
              helperText="Enter tags separated by commas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAssetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditAssetSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Asset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedAsset?.fileName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

    </Dialog>
  );
};

export default AssetLibraryModal; 