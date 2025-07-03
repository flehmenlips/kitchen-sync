import React, { useState, useEffect } from 'react';
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
  Typography,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search, Image, VideoFile, Description, InsertDriveFile } from '@mui/icons-material';
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
  createdAt: string;
}

interface AssetPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  allowedTypes?: string[];
  title?: string;
}

const AssetPicker: React.FC<AssetPickerProps> = ({
  open,
  onClose,
  onSelect,
  allowedTypes = ['image'],
  title = 'Select Asset'
}) => {
  const { currentRestaurant } = useRestaurant();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Fetch assets
  const fetchAssets = async () => {
    if (!currentRestaurant) {
      console.log('[AssetPicker] No currentRestaurant found');
      return;
    }
    
    console.log('[AssetPicker] Fetching assets for restaurant:', currentRestaurant.id);
    setLoading(true);
    setError('');
    
    try {
      const response = await assetApi.getAssets(currentRestaurant.id, {
        assetType: assetTypeFilter || undefined,
        search: searchTerm || undefined,
        limit: 50
      });
      
      console.log('[AssetPicker] API Response:', response);
      
      // Filter by allowed types
      const filteredAssets = response.assets.filter(asset => 
        allowedTypes.includes(asset.assetType)
      );
      
      console.log('[AssetPicker] Filtered assets:', filteredAssets);
      setAssets(filteredAssets);
      
      if (filteredAssets.length === 0) {
        setError('No assets found for this restaurant. Try uploading some images first.');
      }
    } catch (error: any) {
      console.error('[AssetPicker] API Error:', error);
      console.error('[AssetPicker] Error response:', error.response);
      
      if (error.response?.status === 401) {
        setError('Authentication required. Please login to access assets.');
      } else if (error.response?.status === 404) {
        setError('No assets found. Upload some images to get started.');
      } else {
        setError(`Failed to load assets: ${error.message || 'Unknown error'}`);
      }
      
      // Show demo assets for development/testing
      setAssets([
        {
          id: 'demo-1',
          fileName: 'sample-hero.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          assetType: 'image',
          altText: 'Sample hero image',
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-2', 
          fileName: 'food-gallery.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
          fileSize: 856000,
          mimeType: 'image/jpeg',
          assetType: 'image',
          altText: 'Food gallery image',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load assets when dialog opens
  useEffect(() => {
    if (open && currentRestaurant) {
      fetchAssets();
    }
  }, [open, currentRestaurant, searchTerm, assetTypeFilter]);

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Box display="flex" gap={2} mb={2}>
          <TextField
            size="small"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ flexGrow: 1 }}
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
          
          <Button
            variant="outlined"
            size="small"
            component="label"
          >
            Upload
            <input
              type="file"
              hidden
              accept={allowedTypes.includes('image') ? 'image/*' : '*/*'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && currentRestaurant) {
                  // TODO: Implement upload functionality
                  console.log('Upload file:', file);
                  alert('Upload functionality coming soon! For now, upload through the main interface.');
                }
              }}
            />
          </Button>
        </Box>

        {/* Folder Navigation (placeholder for now) */}
        {assets.length > 0 && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              📁 All Assets ({assets.length}) - Folder organization coming soon!
            </Typography>
          </Box>
        )}

        {/* Assets Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {assets.map(asset => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
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
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="body2" noWrap title={asset.fileName}>
                      {asset.fileName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(asset.fileSize)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {assets.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No assets found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload some files to get started
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetPicker; 