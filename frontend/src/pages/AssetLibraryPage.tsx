import React, { useState, useEffect } from 'react';
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
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  PhotoLibrary,
  Upload,
  Search,
  FilterList,
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
  Add,
  DriveFileMove,
  Home
} from '@mui/icons-material';
import { useRestaurant } from '../context/RestaurantContext';
import { assetApi } from '../services/assetApi';

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

  // Navigation
  const navigateToFolder = (folderId: string | null, folderName: string) => {
    setCurrentFolderId(folderId);
    setCurrentFolderPath(folderId ? folderName : 'All Assets');
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Asset Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your images, videos, and documents
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={importing ? <CircularProgress size={16} /> : <CloudDownload />}
            onClick={handleImportAll}
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import from Cloudinary'}
          </Button>
          
          <Button variant="contained" startIcon={<Upload />}>
            Upload Assets
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sidebar - Folders */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Folders</Typography>
              <IconButton size="small" onClick={() => setCreateFolderDialogOpen(true)}>
                <CreateNewFolder />
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
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Breadcrumb and Search */}
          <Box display="flex" gap={2} mb={3} alignItems="center">
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {currentFolderPath}
            </Typography>
            
            <TextField
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ width: 300 }}
            />

            <IconButton onClick={() => { fetchAssets(); fetchFolders(); }} title="Refresh">
              <Refresh />
            </IconButton>
          </Box>

          {/* Asset Grid */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {assets.map(asset => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                  <Card>
                    {asset.assetType.toLowerCase() === 'image' ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={asset.fileUrl}
                        alt={asset.altText || asset.fileName}
                        sx={{ objectFit: 'cover' }}
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
                        onClick={(e) => handleAssetMenuClick(e, asset)}
                      >
                        <MoreVert />
                      </IconButton>
                    </CardActions>
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
    </Container>
  );
}; 