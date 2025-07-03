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
  Fab
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
  Add
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
}

// Folder interface
interface AssetFolder {
  id: string;
  name: string;
  parentFolderId?: string;
  colorHex: string;
  description?: string;
  assetCount: number;
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
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (currentRestaurant) {
      fetchAssets();
    }
  }, [currentRestaurant, searchTerm, currentFolderId]);

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
      setFolders([
        { id: 'website-assets', name: 'Website Assets', colorHex: '#1976d2', description: 'Images for website builder', assetCount: 4 },
        { id: 'recipe-photos', name: 'Recipe Photos', colorHex: '#4caf50', description: 'Recipe and food photography', assetCount: 0 },
        { id: 'hero-images', name: 'Hero Images', colorHex: '#f44336', description: 'Hero section backgrounds', assetCount: 2 }
      ]);
    } catch (error: any) {
      setError(`Failed to load assets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportAll = async () => {
    if (!currentRestaurant) return;

    setImporting(true);
    try {
      const response = await fetch(`/api/assets/restaurants/${currentRestaurant.id}/import-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        await fetchAssets();
        alert(`🎉 Import complete! Imported ${result.imported} assets from Cloudinary.`);
      }
    } catch (error: any) {
      setError(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getAssetIcon = (assetType: string) => {
    switch (assetType.toLowerCase()) {
      case 'image': return <Image color="primary" />;
      case 'video': return <VideoFile color="secondary" />;
      case 'document': return <Description color="action" />;
      default: return <Description color="disabled" />;
    }
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
              <IconButton size="small">
                <CreateNewFolder />
              </IconButton>
            </Box>

            <List dense>
              <ListItemButton
                selected={currentFolderId === null}
                onClick={() => setCurrentFolderId(null)}
              >
                <ListItemIcon><PhotoLibrary /></ListItemIcon>
                <ListItemText primary="All Assets" secondary={`${assets.length} items`} />
              </ListItemButton>

              {folders.map(folder => (
                <ListItemButton
                  key={folder.id}
                  selected={currentFolderId === folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  <ListItemIcon>
                    <Folder sx={{ color: folder.colorHex }} />
                  </ListItemIcon>
                  <ListItemText primary={folder.name} secondary={`${folder.assetCount} items`} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Filters and Search */}
          <Box display="flex" gap={2} mb={3}>
            <TextField
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flexGrow: 1 }}
            />
            
            <Button variant="outlined" startIcon={<FilterList />}>
              Filter
            </Button>

            <IconButton onClick={fetchAssets} title="Refresh">
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
                    <CardMedia
                      component="img"
                      height="200"
                      image={asset.fileUrl}
                      alt={asset.altText || asset.fileName}
                      sx={{ objectFit: 'cover' }}
                    />
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
                      <IconButton size="small">
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
              <PhotoLibrary sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No assets found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Upload images, videos, or documents to get started
              </Typography>
              <Button variant="contained" startIcon={<Upload />}>
                Upload Your First Asset
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Add />
      </Fab>
    </Container>
  );
}; 