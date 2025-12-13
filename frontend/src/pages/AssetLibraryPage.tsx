import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Toolbar,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Collapse
} from '@mui/material';
import {
  PhotoLibrary,
  Upload,
  Search,
  MoreVert,
  Delete,
  Edit,
  Download,
  CloudDownload,
  Folder,
  CreateNewFolder,
  Refresh,
  Image,
  VideoFile,
  Description,
  Home,
  FilterList,
  MoveToInbox,
  Label,
  SelectAll,
  Deselect,
  ChevronRight,
  ExpandMore,
  DragIndicator
} from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRestaurant } from '../context/RestaurantContext';
import { assetApi } from '../services/assetApi';
import { getAssetThumbnailMedium } from '../utils/assetThumbnails';

// Asset interface
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
  usageCount?: number;
  cloudinaryPublicId?: string;
}

interface AssetFolder {
  id: string;
  name: string;
  parentFolderId?: string;
  colorHex: string;
  description?: string;
  assetCount?: number;
  sortOrder?: number;
  isSystemFolder?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    assets: number;
    subFolders: number;
  };
}

export const AssetLibraryPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('All Assets');
  
  // Bulk selection state
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [bulkActionMenuAnchor, setBulkActionMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Advanced filtering state
  const [filterAssetType, setFilterAssetType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  // Context menu states
  const [assetMenuAnchor, setAssetMenuAnchor] = useState<null | HTMLElement>(null);
  const [folderMenuAnchor, setFolderMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<AssetFolder | null>(null);
  
  // Dialog states
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [editFolderDialogOpen, setEditFolderDialogOpen] = useState(false);
  const [deleteFolderConfirmOpen, setDeleteFolderConfirmOpen] = useState(false);
  const [deleteAssetConfirmOpen, setDeleteAssetConfirmOpen] = useState(false);
  const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Form states
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

  // Predefined folder colors
  const folderColors = [
    '#1976d2', '#2196f3', '#03a9f4', '#00bcd4', '#009688',
    '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107',
    '#ff9800', '#ff5722', '#f44336', '#e91e63', '#9c27b0',
    '#673ab7', '#3f51b5', '#607d8b', '#795548', '#9e9e9e'
  ];

  // Fetch assets
  const fetchAssets = async () => {
    if (!currentRestaurant) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await assetApi.getAssets(currentRestaurant.id, {
        search: searchTerm || undefined,
        folderId: currentFolderId || undefined,
        limit: 100
      });
      
      setAssets(response.assets);
    } catch (error: any) {
      setError(`Failed to load assets: ${error.message}`);
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
      setFolders(foldersResponse);
    } catch (error: any) {
      console.log('[AssetLibraryPage] Folders not available:', error.message);
      setFolders([]);
    }
  };

  // Filter assets based on search and filters
  const filteredAssets = useMemo(() => {
    let filtered = assets;
    
    // Filter by asset type
    if (filterAssetType !== 'all') {
      filtered = filtered.filter(asset => asset.assetType.toUpperCase() === filterAssetType.toUpperCase());
    }
    
    return filtered;
  }, [assets, filterAssetType]);

  useEffect(() => {
    if (currentRestaurant) {
      fetchAssets();
      fetchFolders();
    }
  }, [currentRestaurant, searchTerm, currentFolderId]);

  // Utility functions
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getAssetIcon = (assetType: string) => {
    switch (assetType.toLowerCase()) {
      case 'image': return <Image />;
      case 'video': return <VideoFile />;
      case 'document': return <Description />;
      default: return <Description />;
    }
  };

  // Build hierarchical folder tree
  const buildFolderTree = (folders: AssetFolder[]): AssetFolder[] => {
    const folderMap = new Map<string, AssetFolder & { children: AssetFolder[] }>();
    const rootFolders: AssetFolder[] = [];

    // Create map of all folders with children array
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Build tree structure
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!;
      if (folder.parentFolderId && folderMap.has(folder.parentFolderId)) {
        folderMap.get(folder.parentFolderId)!.children.push(folderWithChildren);
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    return rootFolders;
  };

  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);

  // Toggle folder expansion
  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Render folder tree recursively
  const renderFolderTree = (folderList: AssetFolder[], level: number = 0) => {
    return folderList.map(folder => {
      const hasChildren = (folder as any).children?.length > 0;
      const isExpanded = expandedFolders.has(folder.id);
      
      return (
        <React.Fragment key={folder.id}>
          <ListItemButton
            selected={currentFolderId === folder.id}
            onClick={() => navigateToFolder(folder.id, folder.name)}
            sx={{ pl: 2 + level * 2 }}
          >
            {hasChildren && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpansion(folder.id);
                }}
                sx={{ mr: 0.5 }}
              >
                {isExpanded ? <ExpandMore /> : <ChevronRight />}
              </IconButton>
            )}
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
          {hasChildren && isExpanded && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              {renderFolderTree((folder as any).children, level + 1)}
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  // Navigation
  const navigateToFolder = (folderId: string | null, folderName: string) => {
    setCurrentFolderId(folderId);
    setCurrentFolderPath(folderId ? folderName : 'All Assets');
    setSelectedAssetIds(new Set()); // Clear selection when navigating
  };

  // Bulk selection handlers
  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedAssetIds.size === assets.length) {
      setSelectedAssetIds(new Set());
    } else {
      setSelectedAssetIds(new Set(assets.map(a => a.id)));
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (!currentRestaurant || selectedAssetIds.size === 0) return;
    
    try {
      setLoading(true);
      await assetApi.bulkDelete(currentRestaurant.id, Array.from(selectedAssetIds));
      setSelectedAssetIds(new Set());
      setBulkDeleteConfirmOpen(false);
      await fetchAssets();
    } catch (error: any) {
      setError(`Failed to delete assets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMove = async (targetFolderId: string | null) => {
    if (!currentRestaurant || selectedAssetIds.size === 0) return;
    
    try {
      setLoading(true);
      await assetApi.bulkMove(currentRestaurant.id, Array.from(selectedAssetIds), targetFolderId || '');
      setSelectedAssetIds(new Set());
      setBulkMoveDialogOpen(false);
      await fetchAssets();
    } catch (error: any) {
      setError(`Failed to move assets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !currentRestaurant) return;
    
    // Handle folder reordering (if needed)
    if (active.id.toString().startsWith('folder-')) {
      // Folder drag logic can be added here
      return;
    }
    
    // Handle asset drag to folder
    if (active.id.toString().startsWith('asset-') && over.id.toString().startsWith('folder-')) {
      const assetId = active.id.toString().replace('asset-', '');
      const folderId = over.id.toString().replace('folder-', '');
      
      try {
        await assetApi.updateAsset(currentRestaurant.id, assetId, { folderId });
        await fetchAssets();
      } catch (error: any) {
        setError(`Failed to move asset: ${error.message}`);
      }
    }
  };

  // Import handler
  const handleImportAll = async () => {
    if (!currentRestaurant) return;
    
    setImporting(true);
    try {
      const result = await assetApi.importAllAssets(currentRestaurant.id);
      alert(`✅ Import successful! Imported ${result.imported} assets.`);
      await fetchAssets();
    } catch (error: any) {
      setError(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Folder management functions
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
      
      setNewFolderData({
        name: '',
        description: '',
        colorHex: '#1976d2',
        parentFolderId: null
      });
      setCreateFolderDialogOpen(false);
      
      await fetchFolders();
      
    } catch (error: any) {
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
      
      await fetchFolders();
      
    } catch (error: any) {
      setError(`Failed to update folder: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!currentRestaurant || !selectedFolder) return;
    
    try {
      setLoading(true);
      
      await assetApi.deleteFolder(currentRestaurant.id, selectedFolder.id);
      
      setDeleteFolderConfirmOpen(false);
      setSelectedFolder(null);
      
      if (currentFolderId === selectedFolder.id) {
        setCurrentFolderId(null);
        setCurrentFolderPath('All Assets');
      }
      
      await fetchFolders();
      await fetchAssets();
      
    } catch (error: any) {
      setError(`Failed to delete folder: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async () => {
    if (!currentRestaurant || !selectedAsset) return;
    
    try {
      setLoading(true);
      
      await assetApi.deleteAsset(currentRestaurant.id, selectedAsset.id);
      
      setDeleteAssetConfirmOpen(false);
      setSelectedAsset(null);
      
      await fetchAssets();
      
    } catch (error: any) {
      setError(`Failed to delete asset: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Context menu handlers
  const handleAssetMenuClick = (event: React.MouseEvent<HTMLElement>, asset: Asset) => {
    event.stopPropagation();
    setSelectedAsset(asset);
    setAssetMenuAnchor(event.currentTarget);
  };

  const handleFolderMenuClick = (event: React.MouseEvent<HTMLElement>, folder: AssetFolder) => {
    event.stopPropagation();
    setSelectedFolder(folder);
    setFolderMenuAnchor(event.currentTarget);
  };

  const handleAssetMenuClose = () => {
    setAssetMenuAnchor(null);
    setSelectedAsset(null);
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

  const handleDeleteAssetClick = () => {
    setDeleteAssetConfirmOpen(true);
    handleAssetMenuClose();
  };

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

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Hero Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              mr: 3
            }}>
              <PhotoLibrary sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                fontWeight="800"
                sx={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 0.5
                }}
              >
                Asset Library
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                Manage your images, videos, and documents
              </Typography>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }} sx={{ ml: 15 }}>
            <Button
              variant="outlined"
              startIcon={importing ? <CircularProgress size={16} /> : <CloudDownload />}
              onClick={handleImportAll}
              disabled={importing}
              sx={{
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#3b82f6',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(20px)',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '2px solid rgba(59, 130, 246, 0.5)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {importing ? 'Importing...' : 'Import from Cloudinary'}
            </Button>
            
            <Button 
              variant="contained" 
              startIcon={<Upload />}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '16px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Upload Assets
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 15, fontSize: '1rem', mb: 3 }}>
          Organize and manage all your digital assets in one place
        </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sidebar - Folders */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ 
            p: 3,
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography 
                variant="h6" 
                fontWeight="700"
                sx={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Folders
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setCreateFolderDialogOpen(true)}
                sx={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'rgba(59, 130, 246, 0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CreateNewFolder sx={{ color: '#3b82f6' }} />
              </IconButton>
            </Box>

            <List dense>
              <ListItemButton
                selected={currentFolderId === null}
                onClick={() => navigateToFolder(null, 'All Assets')}
              >
                <ListItemIcon><Home /></ListItemIcon>
                <ListItemText primary="All Assets" secondary={`${assets.length} items`} />
              </ListItemButton>

              {renderFolderTree(folderTree)}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Breadcrumb and Search */}
          <Paper sx={{
            p: 3,
            mb: 3,
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <Typography 
                variant="h6" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {currentFolderPath}
              </Typography>
              
              <TextField
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#3b82f6' }} />
                }}
                sx={{ 
                  width: { xs: '100%', sm: 300 },
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.9)'
                    }
                  }
                }}
              />

              <Tooltip title="Filter Options">
                <IconButton 
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    background: showFilters ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    '&:hover': {
                      background: 'rgba(59, 130, 246, 0.2)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Badge badgeContent={filterAssetType !== 'all' ? 1 : 0} color="primary">
                    <FilterList sx={{ color: '#3b82f6' }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <IconButton 
                onClick={() => { fetchAssets(); fetchFolders(); }} 
                title="Refresh"
                sx={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'rgba(59, 130, 246, 0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Refresh sx={{ color: '#3b82f6' }} />
              </IconButton>
            </Box>

            {/* Advanced Filters */}
            <Collapse in={showFilters}>
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Asset Type</InputLabel>
                  <Select
                    value={filterAssetType}
                    onChange={(e) => setFilterAssetType(e.target.value)}
                    label="Asset Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="IMAGE">Images</MenuItem>
                    <MenuItem value="VIDEO">Videos</MenuItem>
                    <MenuItem value="DOCUMENT">Documents</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Collapse>

            {/* Bulk Actions Toolbar */}
            {selectedAssetIds.size > 0 && (
              <Toolbar sx={{ 
                mt: 2, 
                pt: 2, 
                borderTop: '1px solid rgba(0,0,0,0.1)',
                background: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '12px'
              }}>
                <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
                  {selectedAssetIds.size} asset{selectedAssetIds.size !== 1 ? 's' : ''} selected
                </Typography>
                <Button
                  startIcon={<SelectAll />}
                  onClick={handleSelectAll}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  {selectedAssetIds.size === assets.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  startIcon={<MoveToInbox />}
                  onClick={() => setBulkMoveDialogOpen(true)}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Move
                </Button>
                <Button
                  startIcon={<Delete />}
                  onClick={() => setBulkDeleteConfirmOpen(true)}
                  size="small"
                  color="error"
                >
                  Delete
                </Button>
              </Toolbar>
            )}
          </Paper>

          {/* Asset Grid */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredAssets.map(a => `asset-${a.id}`)} strategy={verticalListSortingStrategy}>
                <Grid container spacing={2}>
                  {filteredAssets.map(asset => {
                    const isSelected = selectedAssetIds.has(asset.id);
                    return (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                        <Card
                          sx={{
                            position: 'relative',
                            border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: 4,
                              transform: 'translateY(-2px)',
                              transition: 'all 0.2s ease'
                            }
                          }}
                          onClick={() => handleSelectAsset(asset.id)}
                        >
                          <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                            <Checkbox
                              checked={isSelected}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAsset(asset.id);
                              }}
                              sx={{
                                color: 'white',
                                '&.Mui-checked': {
                                  color: '#3b82f6'
                                },
                                '& .MuiSvgIcon-root': {
                                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }
                              }}
                            />
                          </Box>
                          {asset.assetType.toLowerCase() === 'image' ? (
                            <CardMedia
                              component="img"
                              height="200"
                              image={getAssetThumbnailMedium(asset.fileUrl, asset.cloudinaryPublicId) || asset.fileUrl}
                              alt={asset.altText || asset.fileName}
                              sx={{ objectFit: 'cover' }}
                              onError={(e) => {
                                // Fallback to original URL if thumbnail fails
                                const target = e.target as HTMLImageElement;
                                if (target.src !== asset.fileUrl) {
                                  target.src = asset.fileUrl;
                                }
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'grey.100'
                              }}
                            >
                              {getAssetIcon(asset.assetType)}
                            </Box>
                          )}
                          <CardContent sx={{ pb: 1 }}>
                            <Typography variant="body2" fontWeight="bold" noWrap>
                              {asset.fileName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(asset.fileSize)} • {asset.mimeType}
                            </Typography>
                            <Box mt={1}>
                              <Chip 
                                icon={getAssetIcon(asset.assetType)}
                                label={asset.assetType.toUpperCase()}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </CardContent>
                          <CardActions>
                            <Button size="small">Use</Button>
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssetMenuClick(e, asset);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </SortableContext>
            </DndContext>
          )}

          {filteredAssets.length === 0 && !loading && (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm || filterAssetType !== 'all' ? 'No matching assets found' : 'No assets in this folder'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || filterAssetType !== 'all' ? 'Try adjusting your filters' : 'Upload some files to get started'}
              </Typography>
              <Button variant="contained" startIcon={<Upload />}>
                Upload Files
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Asset Context Menu */}
      <Menu
        anchorEl={assetMenuAnchor}
        open={Boolean(assetMenuAnchor)}
        onClose={handleAssetMenuClose}
      >
        <MenuItem onClick={handleDownloadAsset}>
          <ListItemIcon><Download fontSize="small" /></ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteAssetClick} sx={{ color: 'error.main' }}>
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

      {/* Delete Folder Confirmation */}
      <Dialog open={deleteFolderConfirmOpen} onClose={() => setDeleteFolderConfirmOpen(false)}>
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete folder "{selectedFolder?.name}"? This action cannot be undone.
            All assets and sub-folders within this folder will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFolderConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteFolder} variant="contained" color="error">Delete Folder</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Asset Confirmation */}
      <Dialog open={deleteAssetConfirmOpen} onClose={() => setDeleteAssetConfirmOpen(false)}>
        <DialogTitle>Delete Asset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedAsset?.fileName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAssetConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAsset} variant="contained" color="error">Delete Asset</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={bulkDeleteConfirmOpen} onClose={() => setBulkDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Multiple Assets</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedAssetIds.size} asset{selectedAssetIds.size !== 1 ? 's' : ''}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkDelete} variant="contained" color="error">
            Delete {selectedAssetIds.size} Asset{selectedAssetIds.size !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Move Dialog */}
      <Dialog open={bulkMoveDialogOpen} onClose={() => setBulkMoveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Move {selectedAssetIds.size} Asset{selectedAssetIds.size !== 1 ? 's' : ''}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Target Folder</InputLabel>
            <Select
              value=""
              onChange={(e) => {
                const folderId = e.target.value || null;
                handleBulkMove(folderId);
              }}
              label="Target Folder"
            >
              <MenuItem value="">Root (No Folder)</MenuItem>
              {folders.map(folder => (
                <MenuItem key={folder.id} value={folder.id}>
                  {folder.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkMoveDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
}; 