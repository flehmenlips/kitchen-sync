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
  Fab,
  Slider,
  Autocomplete
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
  Add,
  FolderOpen,
  ColorLens,
  DriveFileMove,
  CheckCircle
} from '@mui/icons-material';
import { assetApi } from '../services/assetApi';
import { api } from '../services/api';
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
  cloudinaryPublicId?: string;
}

interface AssetFolder {
  id: string;
  name: string;
  parentFolderId?: string;
  colorHex: string;
  description?: string;
  assetCount?: number; // Make optional to match API response
  sortOrder?: number;
  isSystemFolder?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    assets: number;
    subFolders: number;
  };
  parentFolder?: AssetFolder; // Added for folder deletion options
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
  
  // Asset management state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetMenuAnchor, setAssetMenuAnchor] = useState<null | HTMLElement>(null);
  const [editAssetDialogOpen, setEditAssetDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editAssetData, setEditAssetData] = useState<Partial<Asset>>({});
  
  // Folder management state
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [editFolderDialogOpen, setEditFolderDialogOpen] = useState(false);
  const [deleteFolderConfirmOpen, setDeleteFolderConfirmOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<AssetFolder | null>(null);
  const [folderMenuAnchor, setFolderMenuAnchor] = useState<null | HTMLElement>(null);
  const [folderDeleteOption, setFolderDeleteOption] = useState<'move' | 'force'>('move');
  const [newFolderData, setNewFolderData] = useState({
    name: '',
    description: '',
    colorHex: '#1976d2',
    parentFolderId: null as string | null
  });
  const [editFolderData, setEditFolderData] = useState({
    name: '',
    description: '',
    colorHex: '#1976d2'
  });
  
  // Asset move state
  const [moveAssetDialogOpen, setMoveAssetDialogOpen] = useState(false);
  const [selectedAssetForMove, setSelectedAssetForMove] = useState<Asset | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  
  // Drag and drop state
  const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Predefined folder colors
  const folderColors = [
    '#1976d2', '#2196f3', '#03a9f4', '#00bcd4', '#009688',
    '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107',
    '#ff9800', '#ff5722', '#f44336', '#e91e63', '#9c27b0',
    '#673ab7', '#3f51b5', '#607d8b', '#795548', '#9e9e9e'
  ];

  // Fetch assets and folders
  const fetchAssets = async () => {
    if (!currentRestaurant) {
      console.log('[AssetLibrary] No currentRestaurant found');
      return;
    }
    
    console.log('[AssetLibrary] Fetching assets for restaurant:', currentRestaurant.id);
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
      
      console.log('[AssetLibrary] Total assets returned:', assetResponse.assets?.length || 0);
      
      // Filter by allowed types
      const filteredAssets = assetResponse.assets.filter(asset => 
        allowedTypes.includes(asset.assetType.toLowerCase())
      );
      
      setAssets(filteredAssets);
      
      if (filteredAssets.length === 0 && !searchTerm) {
        setError(`No assets found. Upload some images to get started!`);
      }
    } catch (error: any) {
      console.error('[AssetLibrary] API Error:', error);
      setError(`Failed to load assets: ${error.message || 'Connection error'}`);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch folders
  const fetchFolders = async () => {
    if (!currentRestaurant) return;
    
    try {
      const foldersResponse = await assetApi.getFolders(currentRestaurant.id);
      console.log('[AssetLibrary] Folders loaded:', foldersResponse.length);
      setFolders(foldersResponse);
    } catch (error: any) {
      console.log('[AssetLibrary] Folders not available:', error.message);
      // Set demo folders for development
      setFolders([
        {
          id: 'website-assets',
          name: 'Website Assets',
          colorHex: '#1976d2',
          description: 'Images for website builder',
          assetCount: 4
        },
        {
          id: 'recipe-photos',
          name: 'Recipe Photos',
          colorHex: '#4caf50',
          description: 'Recipe and food photography',
          assetCount: 0
        }
      ]);
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open && currentRestaurant) {
      fetchAssets();
      fetchFolders();
    }
  }, [open, currentRestaurant, searchTerm, assetTypeFilter, currentFolderId]);

  // Utility Functions
  const getAssetIcon = (assetType: string) => {
    switch (assetType.toLowerCase()) {
      case 'image': return <Image />;
      case 'video': return <VideoFile />;
      case 'document': return <Description />;
      default: return <InsertDriveFile />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

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
      
      const response = await api.post(`/assets/restaurants/${currentRestaurant.id}/import`);
      console.log('[AssetLibrary] Import result:', response.data);
      
      // Show success message
      setError(`✅ Successfully imported ${response.data.imported} assets from Cloudinary!`);
      
      // Refresh the asset list
      fetchAssets();
      
    } catch (error: any) {
      console.error('[AssetLibrary] Import error:', error);
      setError(`Import failed: ${error.response?.data?.message || error.message}`);
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
      console.log('[AssetLibrary] Starting ALL asset import for restaurant:', currentRestaurant.id);
      
      const response = await assetApi.importAllAssets(currentRestaurant.id);
      console.log('[AssetLibrary] Import ALL result:', response);
      
      // Show success message
      setError(`✅ Successfully imported ${response.imported} assets from Cloudinary! (${response.skipped} skipped, ${response.totalDatabase} total in database)`);
      
      // Refresh the asset list
      await fetchAssets();
      await fetchFolders();
      
    } catch (error: any) {
      console.error('[AssetLibrary] Import ALL error:', error);
      setError(`Import failed: ${error.response?.data?.message || error.message}`);
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
      
      // Prepare update data (only fields supported in production schema)
      const updateData = {
        fileName: editAssetData.fileName,
        altText: editAssetData.altText,
        // Note: description and tags are not supported in production schema yet
      };
      
      // Update the asset
      await assetApi.updateAsset(currentRestaurant.id, selectedAsset.id, updateData);
      
      console.log('[AssetLibrary] Asset updated successfully:', updateData);
      
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
      
      // Delete the asset
      await assetApi.deleteAsset(currentRestaurant.id, selectedAsset.id);
      
      console.log('[AssetLibrary] Asset deleted successfully:', selectedAsset.id);
      
      setDeleteConfirmOpen(false);
      setSelectedAsset(null);
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
      
      // First check for auth interference
      const customerAuth = sessionStorage.getItem('customerAuth');
      const adminToken = localStorage.getItem('token') || JSON.parse(localStorage.getItem('kitchenSyncUserInfo') || '{}').token;
      
      console.log('[AssetLibrary] Auth status:', {
        hasCustomerAuth: !!customerAuth,
        hasAdminToken: !!adminToken,
        pathname: window.location.pathname
      });
      
      if (customerAuth) {
        console.warn('[AssetLibrary] Customer auth detected in sessionStorage - this may interfere with admin API calls');
      }
      
      const result = await assetApi.testApi(currentRestaurant.id);
      console.log('[AssetLibrary] Test API response:', result);
      
      alert(`✅ API Test Success!\n\nRestaurant ID: ${result.restaurantId}\nUser ID: ${result.userId}\nEnvironment: ${result.environment}\nTimestamp: ${result.timestamp}`);
      
    } catch (error: any) {
      console.error('[AssetLibrary] Test API error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`❌ API Test Error: ${errorMessage}\n\nIf you see 401 errors, try clicking "Clear Auth Interference" below.`);
    }
  };

  // Clear customer auth interference
  const handleClearAuthInterference = () => {
    const customerAuth = sessionStorage.getItem('customerAuth');
    if (customerAuth) {
      sessionStorage.removeItem('customerAuth');
      console.log('[AssetLibrary] Cleared customer auth from sessionStorage');
      alert('✅ Customer auth interference cleared! Try refreshing the Asset Library now.');
    } else {
      alert('ℹ️ No customer auth found in sessionStorage.');
    }
  };

  // Folder Management Functions
  const handleCreateFolder = async () => {
    if (!currentRestaurant || !newFolderData.name.trim()) return;
    
    try {
      setLoading(true);
      
      await assetApi.createFolder(currentRestaurant.id, {
        name: newFolderData.name.trim(),
        description: newFolderData.description.trim() || undefined,
        colorHex: newFolderData.colorHex,
        parentFolderId: newFolderData.parentFolderId || undefined
      });
      
      // Reset form and close dialog
      setNewFolderData({
        name: '',
        description: '',
        colorHex: '#1976d2',
        parentFolderId: null
      });
      setCreateFolderDialogOpen(false);
      
      // Refresh folders
      await fetchFolders();
      
    } catch (error: any) {
      console.error('[AssetLibrary] Create folder failed:', error);
      setError(`Failed to create folder: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFolder = async () => {
    if (!currentRestaurant || !selectedFolder || !editFolderData.name.trim()) return;
    
    try {
      setLoading(true);
      
      await assetApi.updateFolder(currentRestaurant.id, selectedFolder.id, {
        name: editFolderData.name.trim(),
        description: editFolderData.description.trim() || undefined,
        colorHex: editFolderData.colorHex
      });
      
      setEditFolderDialogOpen(false);
      setSelectedFolder(null);
      
      // Refresh folders
      await fetchFolders();
      
    } catch (error: any) {
      console.error('[AssetLibrary] Edit folder failed:', error);
      setError(`Failed to update folder: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!currentRestaurant || !selectedFolder) return;
    
    try {
      setLoading(true);
      
      const options = folderDeleteOption === 'move' 
        ? { moveAssetsToParent: true } 
        : { force: true };
      
      const result = await assetApi.deleteFolder(currentRestaurant.id, selectedFolder.id, options);
      
      console.log('[AssetLibrary] Folder deletion result:', result);
      
      setDeleteFolderConfirmOpen(false);
      setSelectedFolder(null);
      
      // If we're currently viewing the deleted folder, go back to all assets
      if (currentFolderId === selectedFolder.id) {
        setCurrentFolderId(null);
        setCurrentFolderPath('All Assets');
      }
      
      // Refresh folders and assets
      await fetchFolders();
      await fetchAssets();
      
      // Show success message
      setError(`✅ ${result.message}`);
      
    } catch (error: any) {
      console.error('[AssetLibrary] Delete folder failed:', error);
      const errorMsg = error.response?.data?.error || error.message;
      const suggestions = error.response?.data?.details?.suggestions || [];
      
      setError(`Failed to delete folder: ${errorMsg}${suggestions.length > 0 ? '\n\nSuggestions:\n' + suggestions.join('\n') : ''}`);
    } finally {
      setLoading(false);
    }
  };

  // Folder Context Menu Handlers
  const handleFolderMenuClick = (event: React.MouseEvent<HTMLElement>, folder: AssetFolder) => {
    event.stopPropagation();
    setSelectedFolder(folder);
    setFolderMenuAnchor(event.currentTarget);
  };

  const handleFolderMenuClose = () => {
    setFolderMenuAnchor(null);
    setSelectedFolder(null);
  };

  const handleEditFolderClick = () => {
    if (selectedFolder) {
      setEditFolderData({
        name: selectedFolder.name,
        description: selectedFolder.description || '',
        colorHex: selectedFolder.colorHex
      });
      setEditFolderDialogOpen(true);
    }
    handleFolderMenuClose();
  };

  const handleDeleteFolderClick = () => {
    setDeleteFolderConfirmOpen(true);
    handleFolderMenuClose();
  };

  // Asset Move Functions
  const handleMoveAsset = (asset: Asset) => {
    setSelectedAssetForMove(asset);
    setTargetFolderId(asset.folderId || null);
    setMoveAssetDialogOpen(true);
    handleAssetMenuClose();
  };

  const handleMoveAssetConfirm = async () => {
    if (!currentRestaurant || !selectedAssetForMove) return;
    
    try {
      setLoading(true);
      
      // Update asset with new folder
      await assetApi.updateAsset(currentRestaurant.id, selectedAssetForMove.id, {
        folderId: targetFolderId || undefined
      });
      
      setMoveAssetDialogOpen(false);
      setSelectedAssetForMove(null);
      setTargetFolderId(null);
      
      // Refresh assets
      await fetchAssets();
      
    } catch (error: any) {
      console.error('[AssetLibrary] Move asset failed:', error);
      setError(`Failed to move asset: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop Functions
  const handleAssetDragStart = (event: React.DragEvent, asset: Asset) => {
    setDraggedAsset(asset);
    event.dataTransfer.setData('text/plain', asset.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAssetDragEnd = () => {
    setDraggedAsset(null);
    setDragOverFolder(null);
  };

  const handleFolderDragOver = (event: React.DragEvent, folderId: string | null) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderId);
  };

  const handleFolderDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleFolderDrop = async (event: React.DragEvent, folderId: string | null) => {
    event.preventDefault();
    setDragOverFolder(null);
    
    const assetId = event.dataTransfer.getData('text/plain');
    const asset = assets.find(a => a.id === assetId);
    
    if (!asset || !currentRestaurant) return;
    
    // Don't move if dropping on the same folder
    if (asset.folderId === folderId) return;
    
    try {
      setLoading(true);
      
      await assetApi.updateAsset(currentRestaurant.id, asset.id, {
        folderId: folderId || undefined
      });
      
      console.log(`[AssetLibrary] Moved asset ${asset.fileName} to folder ${folderId || 'root'}`);
      
      // Refresh assets and folders to update counts
      await fetchAssets();
      await fetchFolders();
      
    } catch (error: any) {
      console.error('[AssetLibrary] Move asset failed:', error);
      setError(`Failed to move asset: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
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
              onDragOver={(e) => handleFolderDragOver(e, null)}
              onDragLeave={handleFolderDragLeave}
              onDrop={(e) => handleFolderDrop(e, null)}
              sx={{
                bgcolor: dragOverFolder === null ? 'action.hover' : 'transparent'
              }}
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
                onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                onDragLeave={handleFolderDragLeave}
                onDrop={(e) => handleFolderDrop(e, folder.id)}
                sx={{ 
                  pl: folder.parentFolderId ? 4 : 2,
                  bgcolor: dragOverFolder === folder.id ? 'action.hover' : 'transparent'
                }}
              >
                <ListItemIcon>
                  <Folder sx={{ color: folder.colorHex }} />
                </ListItemIcon>
                <ListItemText 
                  primary={folder.name}
                  secondary={`${(folder._count && folder._count.assets) || folder.assetCount || 0} items`}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleFolderMenuClick(e, folder)}
                  sx={{ ml: 1 }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Button
            size="small"
            startIcon={<CreateNewFolder />}
            onClick={() => setCreateFolderDialogOpen(true)}
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
                    draggable
                    onDragStart={(e) => handleAssetDragStart(e, asset)}
                    onDragEnd={handleAssetDragEnd}
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      opacity: draggedAsset?.id === asset.id ? 0.5 : 1,
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
          onClick={handleClearAuthInterference}
          variant="outlined"
          size="small"
          sx={{ mr: 1 }}
        >
          Clear Auth Interference
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
        <MenuItem onClick={() => handleMoveAsset(selectedAsset!)}>
          <ListItemIcon><DriveFileMove fontSize="small" /></ListItemIcon>
          <ListItemText>Move to Folder</ListItemText>
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

      {/* Folder Context Menu */}
      <Menu
        anchorEl={folderMenuAnchor}
        open={Boolean(folderMenuAnchor)}
        onClose={handleFolderMenuClose}
      >
        <MenuItem onClick={handleEditFolderClick}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Folder</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setNewFolderData({
            ...newFolderData,
            parentFolderId: selectedFolder?.id || null
          });
          setCreateFolderDialogOpen(true);
          handleFolderMenuClose();
        }}>
          <ListItemIcon><CreateNewFolder fontSize="small" /></ListItemIcon>
          <ListItemText>Create Subfolder</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteFolderClick} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete Folder</ListItemText>
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

      {/* Create Folder Dialog */}
      <Dialog open={createFolderDialogOpen} onClose={() => setCreateFolderDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Folder Name"
              value={newFolderData.name}
              onChange={(e) => setNewFolderData({ ...newFolderData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description (optional)"
              value={newFolderData.description}
              onChange={(e) => setNewFolderData({ ...newFolderData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Parent Folder</InputLabel>
              <Select
                value={newFolderData.parentFolderId || ''}
                onChange={(e) => setNewFolderData({ ...newFolderData, parentFolderId: e.target.value || null })}
              >
                <MenuItem value="">No Parent</MenuItem>
                {folders.map(folder => (
                  <MenuItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Folder Color</InputLabel>
              <Select
                value={newFolderData.colorHex}
                onChange={(e) => setNewFolderData({ ...newFolderData, colorHex: e.target.value })}
              >
                {folderColors.map(color => (
                  <MenuItem key={color} value={color}>
                    <Box sx={{ width: 20, height: 20, bgcolor: color, borderRadius: '4px', mr: 1 }} />
                    {color}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFolderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">Create Folder</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={editFolderDialogOpen} onClose={() => setEditFolderDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Folder Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Folder Name"
              value={editFolderData.name}
              onChange={(e) => setEditFolderData({ ...editFolderData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description (optional)"
              value={editFolderData.description}
              onChange={(e) => setEditFolderData({ ...editFolderData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Folder Color</InputLabel>
              <Select
                value={editFolderData.colorHex}
                onChange={(e) => setEditFolderData({ ...editFolderData, colorHex: e.target.value })}
              >
                {folderColors.map(color => (
                  <MenuItem key={color} value={color}>
                    <Box sx={{ width: 20, height: 20, bgcolor: color, borderRadius: '4px', mr: 1 }} />
                    {color}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFolderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditFolder} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <Dialog open={deleteFolderConfirmOpen} onClose={() => setDeleteFolderConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete folder "{selectedFolder?.name}"?
          </Typography>
          
          {selectedFolder && (((selectedFolder._count && selectedFolder._count.assets) || 0) > 0 || ((selectedFolder._count && selectedFolder._count.subFolders) || 0) > 0) && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
              <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
                ⚠️ This folder contains:
              </Typography>
              <Typography variant="body2">
                • {(selectedFolder._count && selectedFolder._count.assets) || 0} assets
              </Typography>
              <Typography variant="body2">
                • {(selectedFolder._count && selectedFolder._count.subFolders) || 0} subfolders
              </Typography>
            </Box>
          )}
          
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              What should happen to the folder contents?
            </Typography>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <input
                  type="radio"
                  id="move-option"
                  checked={folderDeleteOption === 'move'}
                  onChange={() => setFolderDeleteOption('move')}
                  style={{ marginRight: 8 }}
                />
                <label htmlFor="move-option">
                  <Typography variant="body2">
                    Move contents to parent folder ({selectedFolder?.parentFolder?.name || 'Root'})
                  </Typography>
                </label>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  id="force-option"
                  checked={folderDeleteOption === 'force'}
                  onChange={() => setFolderDeleteOption('force')}
                  style={{ marginRight: 8 }}
                />
                <label htmlFor="force-option">
                  <Typography variant="body2" color="error.main">
                    Delete all contents permanently (cannot be undone)
                  </Typography>
                </label>
              </Box>
            </Box>
          </FormControl>
          
          <Typography variant="caption" color="text.secondary">
            {folderDeleteOption === 'move' 
              ? 'Assets and subfolders will be moved to the parent folder before deletion.'
              : 'All contents will be permanently deleted along with the folder.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFolderConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteFolder} 
            variant="contained" 
            color="error"
            startIcon={folderDeleteOption === 'force' ? <Delete /> : <DriveFileMove />}
          >
            {folderDeleteOption === 'move' ? 'Move & Delete' : 'Force Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asset Move Dialog */}
      <Dialog open={moveAssetDialogOpen} onClose={() => setMoveAssetDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Move Asset</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Current Folder: {currentFolderPath}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Target Folder: {folders.find(f => f.id === targetFolderId)?.name || 'No Folder Selected'}
            </Typography>
            <Autocomplete
              options={folders.map(folder => folder.name)}
              value={folders.find(f => f.id === targetFolderId)?.name || ''}
              onChange={(event, newValue) => {
                const folder = folders.find(f => f.name === newValue);
                setTargetFolderId(folder?.id || null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Move to Folder"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <Box sx={{ mr: 1 }}>
                        <FolderOpen fontSize="small" />
                      </Box>
                    ),
                    endAdornment: (
                      <Box sx={{ mr: 1 }}>
                        {params.InputProps.endAdornment}
                      </Box>
                    ),
                  }}
                />
              )}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              This action will move the selected asset to the target folder.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveAssetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMoveAssetConfirm} variant="contained">Move Asset</Button>
        </DialogActions>
      </Dialog>

    </Dialog>
  );
};

export default AssetLibraryModal; 