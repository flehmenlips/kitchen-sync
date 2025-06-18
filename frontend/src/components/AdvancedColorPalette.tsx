import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Visibility as PreviewIcon,
  ContentCopy as CopyIcon,
  CloudUpload as UploadIcon,
  Accessibility as AccessibilityIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { 
  themingService, 
  ColorPalette, 
  ColorPaletteData, 
  PredefinedColorScheme 
} from '../services/themingService';

interface AdvancedColorPaletteProps {
  restaurantId: number;
  onPaletteChange?: (palette: ColorPalette | null) => void;
  currentColors?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}

const AdvancedColorPalette: React.FC<AdvancedColorPaletteProps> = ({
  restaurantId,
  onPaletteChange,
  currentColors
}) => {
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [activePalette, setActivePalette] = useState<ColorPalette | null>(null);
  const [predefinedSchemes, setPredefinedSchemes] = useState<PredefinedColorScheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPalette, setEditingPalette] = useState<ColorPalette | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [showPredefined, setShowPredefined] = useState(true);

  // Form state for creating/editing palettes
  const [formData, setFormData] = useState<ColorPaletteData>({
    name: '',
    primaryColor: currentColors?.primaryColor || '#1976d2',
    secondaryColor: currentColors?.secondaryColor || '#dc004e',
    accentColor: currentColors?.accentColor || '#333333',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    successColor: '#4caf50',
    warningColor: '#ff9800',
    errorColor: '#f44336'
  });

  // Load data on component mount
  useEffect(() => {
    loadPalettes();
    loadPredefinedSchemes();
  }, [restaurantId]);

  const loadPalettes = async () => {
    try {
      setLoading(true);
      const [palettesData, activeData] = await Promise.all([
        themingService.getColorPalettes(restaurantId),
        themingService.getActiveColorPalette(restaurantId)
      ]);
      setPalettes(palettesData);
      setActivePalette(activeData);
      if (onPaletteChange) {
        onPaletteChange(activeData);
      }
    } catch (error) {
      console.error('Error loading palettes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPredefinedSchemes = async () => {
    try {
      const schemes = await themingService.getPredefinedColorSchemes();
      setPredefinedSchemes(schemes);
    } catch (error) {
      console.error('Error loading predefined schemes:', error);
    }
  };

  const calculateContrastRatio = (color1: string, color2: string): number => {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      
      const toLinear = (c: number) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const getWCAGLevel = (contrastRatio: number): 'AA' | 'AAA' | 'FAIL' => {
    if (contrastRatio >= 7) return 'AAA';
    if (contrastRatio >= 4.5) return 'AA';
    return 'FAIL';
  };

  const getAccessibilityInfo = (palette: ColorPalette | ColorPaletteData) => {
    const contrast = calculateContrastRatio(palette.textColor, palette.backgroundColor);
    const level = getWCAGLevel(contrast);
    return { contrast, level };
  };

  const handleCreatePalette = async () => {
    try {
      setLoading(true);
      const newPalette = await themingService.createColorPalette(restaurantId, formData);
      setPalettes([newPalette, ...palettes]);
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating palette:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePalette = async () => {
    if (!editingPalette) return;
    
    try {
      setLoading(true);
      const updatedPalette = await themingService.updateColorPalette(editingPalette.id, formData);
      setPalettes(palettes.map(p => p.id === updatedPalette.id ? updatedPalette : p));
      setEditingPalette(null);
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating palette:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePalette = async (palette: ColorPalette) => {
    try {
      setLoading(true);
      const activatedPalette = await themingService.setActiveColorPalette(restaurantId, palette.id);
      setActivePalette(activatedPalette);
      setPalettes(palettes.map(p => ({ ...p, isActive: p.id === palette.id })));
      if (onPaletteChange) {
        onPaletteChange(activatedPalette);
      }
    } catch (error) {
      console.error('Error activating palette:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePalette = async (palette: ColorPalette) => {
    try {
      setLoading(true);
      await themingService.deleteColorPalette(palette.id);
      setPalettes(palettes.filter(p => p.id !== palette.id));
      if (palette.isActive) {
        setActivePalette(null);
        if (onPaletteChange) {
          onPaletteChange(null);
        }
      }
    } catch (error) {
      console.error('Error deleting palette:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPalette = (palette: ColorPalette) => {
    setEditingPalette(palette);
    setFormData({
      name: palette.name,
      primaryColor: palette.primaryColor,
      secondaryColor: palette.secondaryColor,
      accentColor: palette.accentColor,
      backgroundColor: palette.backgroundColor,
      textColor: palette.textColor,
      successColor: palette.successColor,
      warningColor: palette.warningColor,
      errorColor: palette.errorColor
    });
    setCreateDialogOpen(true);
  };

  const handleCreateFromScheme = (scheme: PredefinedColorScheme) => {
    setFormData({
      name: scheme.name,
      primaryColor: scheme.primaryColor,
      secondaryColor: scheme.secondaryColor,
      accentColor: scheme.accentColor,
      backgroundColor: scheme.backgroundColor,
      textColor: scheme.textColor,
      successColor: '#4caf50',
      warningColor: '#ff9800',
      errorColor: '#f44336'
    });
    setCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      primaryColor: currentColors?.primaryColor || '#1976d2',
      secondaryColor: currentColors?.secondaryColor || '#dc004e',
      accentColor: currentColors?.accentColor || '#333333',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      successColor: '#4caf50',
      warningColor: '#ff9800',
      errorColor: '#f44336'
    });
    setEditingPalette(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, palette: ColorPalette) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPalette(palette);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedPalette(null);
  };

  const ColorPreview = ({ colors, name, isActive, onClick, onMenuClick }: {
    colors: any;
    name: string;
    isActive?: boolean;
    onClick?: () => void;
    onMenuClick?: (event: React.MouseEvent<HTMLElement>) => void;
  }) => {
    const accessibility = getAccessibilityInfo(colors);
    
    return (
      <Card 
        sx={{ 
          position: 'relative',
          border: isActive ? '2px solid' : '1px solid',
          borderColor: isActive ? 'primary.main' : 'divider',
          '&:hover': { borderColor: 'primary.main' }
        }}
      >
        <CardActionArea onClick={onClick}>
          <CardContent sx={{ p: 2 }}>
            {/* Color Swatches */}
            <Box display="flex" height={40} borderRadius={1} overflow="hidden" mb={1}>
              <Box flex={2} bgcolor={colors.primaryColor} />
              <Box flex={1} bgcolor={colors.secondaryColor} />
              <Box flex={1} bgcolor={colors.accentColor} />
              <Box flex={1} bgcolor={colors.backgroundColor} />
              <Box flex={1} bgcolor={colors.textColor} />
            </Box>
            
            {/* Name and Status */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" noWrap>
                {name}
              </Typography>
              {isActive && (
                <Chip 
                  size="small" 
                  icon={<CheckIcon />} 
                  label="Active" 
                  color="primary"
                />
              )}
            </Box>
            
            {/* Accessibility Info */}
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <AccessibilityIcon 
                fontSize="small" 
                color={accessibility.level === 'FAIL' ? 'error' : 'success'}
              />
              <Typography variant="caption" color="text.secondary">
                {accessibility.level} ({accessibility.contrast.toFixed(1)}:1)
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
        
        {onMenuClick && (
          <IconButton
            size="small"
            onClick={onMenuClick}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <MoreIcon />
          </IconButton>
        )}
      </Card>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Advanced Color Palettes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Palette
        </Button>
      </Box>

      {/* Toggle for Predefined Schemes */}
      <FormControlLabel
        control={
          <Switch
            checked={showPredefined}
            onChange={(e) => setShowPredefined(e.target.checked)}
          />
        }
        label="Show Predefined Color Schemes"
        sx={{ mb: 2 }}
      />

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Predefined Color Schemes */}
      {showPredefined && (
        <Box mb={4}>
          <Typography variant="subtitle1" gutterBottom>
            Predefined Color Schemes
          </Typography>
          <Grid container spacing={2}>
            {predefinedSchemes.map((scheme, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ColorPreview
                  colors={scheme}
                  name={scheme.name}
                  onClick={() => handleCreateFromScheme(scheme)}
                />
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 3 }} />
        </Box>
      )}

      {/* Custom Palettes */}
      <Typography variant="subtitle1" gutterBottom>
        Your Custom Palettes
      </Typography>
      
      {palettes.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No custom palettes created yet. Create your first palette using the button above or by selecting a predefined scheme.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {palettes.map((palette) => (
            <Grid item xs={12} sm={6} md={4} key={palette.id}>
              <ColorPreview
                colors={palette}
                name={palette.name}
                isActive={palette.isActive}
                onClick={() => handleActivatePalette(palette)}
                onMenuClick={(event) => handleMenuClick(event, palette)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedPalette) handleEditPalette(selectedPalette);
          handleMenuClose();
        }}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedPalette) handleDeletePalette(selectedPalette);
          handleMenuClose();
        }}>
          <ListItemIcon><DeleteIcon /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPalette ? 'Edit Color Palette' : 'Create Color Palette'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Palette Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Palette Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            {/* Color Inputs */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Secondary Color"
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Accent Color"
                type="color"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Background Color"
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Text Color"
                type="color"
                value={formData.textColor}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
              />
            </Grid>

            {/* Preview */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Preview</Typography>
              <ColorPreview colors={formData} name={formData.name || 'New Palette'} />
            </Grid>

            {/* Accessibility Alert */}
            <Grid item xs={12}>
              {(() => {
                const accessibility = getAccessibilityInfo(formData);
                return (
                  <Alert 
                    severity={accessibility.level === 'FAIL' ? 'error' : 'success'}
                    icon={<AccessibilityIcon />}
                  >
                    <Typography variant="body2">
                      <strong>Accessibility:</strong> {accessibility.level} compliance 
                      (contrast ratio: {accessibility.contrast.toFixed(1)}:1)
                    </Typography>
                    {accessibility.level === 'FAIL' && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Consider adjusting text and background colors for better accessibility.
                      </Typography>
                    )}
                  </Alert>
                );
              })()}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button 
            onClick={editingPalette ? handleUpdatePalette : handleCreatePalette}
            variant="contained"
            disabled={!formData.name.trim() || loading}
          >
            {editingPalette ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedColorPalette; 