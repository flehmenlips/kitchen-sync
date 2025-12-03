import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Image as ImageIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { themingService, BrandAsset, BrandAssetData } from '../services/themingService';
import { useSnackbar } from '../context/SnackbarContext';
import AssetLibraryModal from './AssetLibraryModal';

interface BrandAssetManagerProps {
  restaurantId: number;
  onAssetChange?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`brand-asset-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ASSET_TYPES = [
  { value: 'logo', label: 'Logo', description: 'Primary restaurant logo' },
  { value: 'logo-dark', label: 'Logo (Dark)', description: 'Dark variant of logo' },
  { value: 'logo-light', label: 'Logo (Light)', description: 'Light variant of logo' },
  { value: 'favicon', label: 'Favicon', description: 'Browser favicon' },
  { value: 'watermark', label: 'Watermark', description: 'Watermark for images' },
  { value: 'icon', label: 'Icon', description: 'App icon or social media icon' },
  { value: 'brand-pattern', label: 'Brand Pattern', description: 'Decorative pattern' },
  { value: 'signature', label: 'Signature', description: 'Chef or owner signature' }
];

const BrandAssetManager: React.FC<BrandAssetManagerProps> = ({
  restaurantId,
  onAssetChange
}) => {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedAssetType, setSelectedAssetType] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<BrandAsset | null>(null);
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const [formData, setFormData] = useState<Partial<BrandAssetData>>({
    assetType: 'logo',
    fileName: '',
    fileUrl: '',
    altText: '',
    description: '',
    isPrimary: false
  });

  useEffect(() => {
    loadBrandAssets();
  }, [restaurantId, selectedAssetType]);

  const loadBrandAssets = async () => {
    try {
      setLoading(true);
      const assetType = selectedAssetType !== 'all' ? selectedAssetType : undefined;
      const data = await themingService.getBrandAssets(restaurantId, assetType);
      setAssets(data);
    } catch (error) {
      console.error('Error loading brand assets:', error);
      showSnackbar('Failed to load brand assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (asset?: BrandAsset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        assetType: asset.assetType,
        fileName: asset.fileName,
        fileUrl: asset.fileUrl,
        altText: asset.altText || '',
        description: asset.description || '',
        isPrimary: asset.isPrimary
      });
    } else {
      setEditingAsset(null);
      setFormData({
        assetType: selectedAssetType !== 'all' ? selectedAssetType : 'logo',
        fileName: '',
        fileUrl: '',
        altText: '',
        description: '',
        isPrimary: false
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAsset(null);
    setFormData({
      assetType: 'logo',
      fileName: '',
      fileUrl: '',
      altText: '',
      description: '',
      isPrimary: false
    });
  };

  const handleSaveAsset = async () => {
    try {
      setUploading(true);
      
      if (editingAsset) {
        await themingService.updateBrandAsset(editingAsset.id, formData);
        showSnackbar('Brand asset updated successfully', 'success');
      } else {
        await themingService.createBrandAsset(restaurantId, formData as BrandAssetData);
        showSnackbar('Brand asset created successfully', 'success');
      }
      
      handleCloseDialog();
      loadBrandAssets();
      if (onAssetChange) onAssetChange();
    } catch (error) {
      console.error('Error saving brand asset:', error);
      showSnackbar('Failed to save brand asset', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAsset = async (asset: BrandAsset) => {
    if (!window.confirm(`Are you sure you want to delete "${asset.fileName}"?`)) {
      return;
    }

    try {
      await themingService.deleteBrandAsset(asset.id);
      showSnackbar('Brand asset deleted successfully', 'success');
      loadBrandAssets();
      if (onAssetChange) onAssetChange();
    } catch (error) {
      console.error('Error deleting brand asset:', error);
      showSnackbar('Failed to delete brand asset', 'error');
    }
  };

  const handleSetPrimary = async (asset: BrandAsset) => {
    try {
      await themingService.setPrimaryBrandAsset(restaurantId, asset.id, asset.assetType);
      showSnackbar('Primary brand asset updated', 'success');
      loadBrandAssets();
      if (onAssetChange) onAssetChange();
    } catch (error) {
      console.error('Error setting primary asset:', error);
      showSnackbar('Failed to set primary asset', 'error');
    }
  };

  const handleAssetSelect = (asset: any) => {
    setFormData({
      ...formData,
      fileUrl: asset.url,
      fileName: asset.fileName || asset.name,
      cloudinaryPublicId: asset.cloudinaryPublicId
    });
    setAssetLibraryOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // TODO: Upload to Cloudinary and get URL
      // For now, create a placeholder
      const fileUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        fileName: file.name,
        fileUrl,
        mimeType: file.type,
        fileSize: file.size
      });
      showSnackbar('File selected. Please save to upload.', 'info');
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar('Failed to upload file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const getAssetsByType = (type: string) => {
    return assets.filter(asset => asset.assetType === type);
  };

  const getPrimaryAsset = (type: string) => {
    return assets.find(asset => asset.assetType === type && asset.isPrimary);
  };

  const renderAssetCard = (asset: BrandAsset) => {
    const isPrimary = asset.isPrimary;
    const isImage = asset.mimeType?.startsWith('image/');

    return (
      <Card key={asset.id} sx={{ position: 'relative' }}>
        <CardActionArea onClick={() => handleOpenDialog(asset)}>
          {isImage ? (
            <CardMedia
              component="img"
              height="200"
              image={asset.fileUrl}
              alt={asset.altText || asset.fileName}
              sx={{ objectFit: 'contain', bgcolor: 'grey.100', p: 2 }}
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
              <DescriptionIcon sx={{ fontSize: 64, color: 'grey.400' }} />
            </Box>
          )}
        </CardActionArea>
        
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
            <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
              {asset.fileName}
            </Typography>
            {isPrimary && (
              <Chip
                icon={<StarIcon />}
                label="Primary"
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            {ASSET_TYPES.find(t => t.value === asset.assetType)?.label || asset.assetType}
          </Typography>
          
          {asset.description && (
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              {asset.description}
            </Typography>
          )}
          
          <Box display="flex" gap={1} mt={2}>
            <Tooltip title="Set as Primary">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetPrimary(asset);
                }}
                color={isPrimary ? 'primary' : 'default'}
              >
                {isPrimary ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDialog(asset);
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAsset(asset);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6">Brand Asset Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage logos, icons, and other brand assets
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Brand Asset
        </Button>
      </Box>

      {/* Asset Type Filter */}
      <Box mb={3}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={selectedAssetType}
            label="Filter by Type"
            onChange={(e) => setSelectedAssetType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            {ASSET_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="All Assets" />
          <Tab label="Logos" />
          <Tab label="Icons" />
          <Tab label="Other" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* All Assets Tab */}
          <TabPanel value={tabValue} index={0}>
            {assets.length === 0 ? (
              <Alert severity="info">
                No brand assets found. Click "Add Brand Asset" to get started.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {assets.map(renderAssetCard)}
              </Grid>
            )}
          </TabPanel>

          {/* Logos Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              {getAssetsByType('logo').map(renderAssetCard)}
              {getAssetsByType('logo-dark').map(renderAssetCard)}
              {getAssetsByType('logo-light').map(renderAssetCard)}
            </Grid>
            {getAssetsByType('logo').length === 0 && 
             getAssetsByType('logo-dark').length === 0 && 
             getAssetsByType('logo-light').length === 0 && (
              <Alert severity="info">No logos found.</Alert>
            )}
          </TabPanel>

          {/* Icons Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2}>
              {getAssetsByType('favicon').map(renderAssetCard)}
              {getAssetsByType('icon').map(renderAssetCard)}
            </Grid>
            {getAssetsByType('favicon').length === 0 && 
             getAssetsByType('icon').length === 0 && (
              <Alert severity="info">No icons found.</Alert>
            )}
          </TabPanel>

          {/* Other Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={2}>
              {assets
                .filter(asset => 
                  !['logo', 'logo-dark', 'logo-light', 'favicon', 'icon'].includes(asset.assetType)
                )
                .map(renderAssetCard)}
            </Grid>
            {assets.filter(asset => 
              !['logo', 'logo-dark', 'logo-light', 'favicon', 'icon'].includes(asset.assetType)
            ).length === 0 && (
              <Alert severity="info">No other assets found.</Alert>
            )}
          </TabPanel>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAsset ? 'Edit Brand Asset' : 'Add Brand Asset'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Asset Type</InputLabel>
                <Select
                  value={formData.assetType}
                  label="Asset Type"
                  onChange={(e) => setFormData({ ...formData, assetType: e.target.value as string })}
                >
                  {ASSET_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography>{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  disabled={uploading}
                >
                  Upload File
                  <input
                    type="file"
                    hidden
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                  />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PhotoLibraryIcon />}
                  onClick={() => setAssetLibraryOpen(true)}
                >
                  Select from Library
                </Button>
              </Box>
              {formData.fileUrl && (
                <Box mt={2}>
                  {formData.mimeType?.startsWith('image/') ? (
                    <Box
                      component="img"
                      src={formData.fileUrl}
                      alt="Preview"
                      sx={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                    />
                  ) : (
                    <Alert severity="info">File selected: {formData.fileName}</Alert>
                  )}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="File Name"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="File URL"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                required
                helperText="URL of the asset file"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alt Text"
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                helperText="Alternative text for accessibility"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                helperText="Optional description of the asset"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  />
                }
                label="Set as Primary Asset"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Primary assets are used as defaults for their type across your website
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveAsset}
            variant="contained"
            disabled={!formData.fileUrl || !formData.fileName || uploading}
          >
            {uploading ? <CircularProgress size={20} /> : editingAsset ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asset Library Modal */}
      <AssetLibraryModal
        open={assetLibraryOpen}
        onClose={() => setAssetLibraryOpen(false)}
        onSelect={handleAssetSelect}
        restaurantId={restaurantId}
        allowedTypes={['image']}
      />
    </Box>
  );
};

export default BrandAssetManager;

