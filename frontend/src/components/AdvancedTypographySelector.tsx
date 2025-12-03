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
  FormControl,
  InputLabel,
  Select,
  Slider,
  Tabs,
  Tab,
  Autocomplete,
  Divider,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import {
  TextFields as TypographyIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Visibility as PreviewIcon,
  ContentCopy as CopyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as MagicIcon,
  TextDecrease as TextDecreaseIcon,
  TextIncrease as TextIncreaseIcon,
  Style as StyleIcon,
  FontDownload as FontDownloadIcon
} from '@mui/icons-material';
import { 
  themingService, 
  TypographyConfig, 
  TypographyConfigData, 
  GoogleFont,
  FontPairing,
  DefaultTypographyConfigs,
  TypographyValidation
} from '../services/themingService';

interface AdvancedTypographySelectorProps {
  restaurantId: number;
  onTypographyChange?: (config: TypographyConfig | null) => void;
  currentFonts?: {
    fontPrimary?: string;
    fontSecondary?: string;
  };
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
      id={`typography-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AdvancedTypographySelector: React.FC<AdvancedTypographySelectorProps> = ({
  restaurantId,
  onTypographyChange,
  currentFonts
}) => {
  const [configs, setConfigs] = useState<TypographyConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<TypographyConfig | null>(null);
  const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
  const [fontPairings, setFontPairings] = useState<FontPairing[]>([]);
  const [defaultConfigs, setDefaultConfigs] = useState<DefaultTypographyConfigs>({});
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TypographyConfig | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedConfig, setSelectedConfig] = useState<TypographyConfig | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0: Quick Start, 1: Custom Config, 2: Font Pairing
  const [validation, setValidation] = useState<TypographyValidation | null>(null);
  const [showPairings, setShowPairings] = useState(true);

  // Form state for creating/editing typography configs
  const [formData, setFormData] = useState<TypographyConfigData>({
    name: '',
    headingFontFamily: currentFonts?.fontPrimary || 'Playfair Display',
    bodyFontFamily: currentFonts?.fontSecondary || 'Open Sans',
    fontSizes: {
      h1: '3rem',
      h2: '2.25rem',
      h3: '1.75rem',
      h4: '1.375rem',
      h5: '1.125rem',
      h6: '1rem',
      body1: '1rem',
      body2: '0.875rem',
      caption: '0.75rem'
    },
    lineHeights: {
      heading: 1.3,
      body: 1.6
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700
    }
  });

  // Load Google Fonts dynamically
  const loadGoogleFont = (fontFamily: string) => {
    if (!document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`)) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  };

  // Load fonts when form data changes
  useEffect(() => {
    if (formData.headingFontFamily) {
      loadGoogleFont(formData.headingFontFamily);
    }
    if (formData.bodyFontFamily) {
      loadGoogleFont(formData.bodyFontFamily);
    }
  }, [formData.headingFontFamily, formData.bodyFontFamily]);

  // Load data on component mount
  useEffect(() => {
    loadTypographyData();
  }, [restaurantId]);

  // Validate form data when it changes
  useEffect(() => {
    if (formData.name) {
      validateCurrentConfig();
    }
  }, [formData]);

  const loadTypographyData = async () => {
    try {
      setLoading(true);
      const [configsData, activeData, fontsData, pairingsData, defaultsData] = await Promise.all([
        themingService.getTypographyConfigs(restaurantId),
        themingService.getActiveTypographyConfig(restaurantId),
        themingService.getGoogleFonts(),
        themingService.getFontPairings(),
        themingService.getDefaultTypographyConfigs()
      ]);
      
      setConfigs(configsData);
      setActiveConfig(activeData);
      setGoogleFonts(fontsData);
      setFontPairings(pairingsData);
      setDefaultConfigs(defaultsData);
      
      if (onTypographyChange) {
        onTypographyChange(activeData);
      }
    } catch (error) {
      console.error('Error loading typography data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentConfig = async () => {
    try {
      const result = await themingService.validateTypography(formData);
      setValidation(result);
    } catch (error) {
      console.error('Error validating typography:', error);
    }
  };

  const handleCreateConfig = async () => {
    try {
      setLoading(true);
      const newConfig = await themingService.createTypographyConfig(restaurantId, formData);
      setConfigs([newConfig, ...configs]);
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating typography config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    if (!editingConfig) return;
    
    try {
      setLoading(true);
      const updatedConfig = await themingService.updateTypographyConfig(editingConfig.id, formData);
      setConfigs(configs.map(c => c.id === updatedConfig.id ? updatedConfig : c));
      setEditingConfig(null);
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating typography config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateConfig = async (config: TypographyConfig) => {
    try {
      setLoading(true);
      const activatedConfig = await themingService.setActiveTypographyConfig(restaurantId, config.id);
      setActiveConfig(activatedConfig);
      setConfigs(configs.map(c => ({ ...c, isActive: c.id === config.id })));
      if (onTypographyChange) {
        onTypographyChange(activatedConfig);
      }
    } catch (error) {
      console.error('Error activating typography config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async (config: TypographyConfig) => {
    try {
      setLoading(true);
      await themingService.deleteTypographyConfig(config.id);
      setConfigs(configs.filter(c => c.id !== config.id));
      if (config.isActive) {
        setActiveConfig(null);
        if (onTypographyChange) {
          onTypographyChange(null);
        }
      }
    } catch (error) {
      console.error('Error deleting typography config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromDefault = async (style: string) => {
    try {
      setLoading(true);
      const newConfig = await themingService.createDefaultTypographyConfig(restaurantId, style);
      setConfigs([newConfig, ...configs]);
    } catch (error) {
      console.error('Error creating default typography config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromPairing = (pairing: FontPairing) => {
    setFormData({
      ...formData,
      name: `${pairing.category} Typography`,
      headingFontFamily: pairing.heading,
      bodyFontFamily: pairing.body
    });
    setCreateDialogOpen(true);
    setTabValue(1); // Switch to Custom Config tab
  };

  const handleEditConfig = (config: TypographyConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      headingFontFamily: config.headingFontFamily,
      bodyFontFamily: config.bodyFontFamily,
      fontSizes: config.fontSizes,
      lineHeights: config.lineHeights,
      letterSpacing: config.letterSpacing || {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em'
      },
      fontWeights: config.fontWeights || {
        light: 300,
        normal: 400,
        medium: 500,
        bold: 700
      }
    });
    setCreateDialogOpen(true);
    setTabValue(1); // Switch to Custom Config tab
  };

  const resetForm = () => {
    setFormData({
      name: '',
      headingFontFamily: currentFonts?.fontPrimary || 'Playfair Display',
      bodyFontFamily: currentFonts?.fontSecondary || 'Open Sans',
      fontSizes: {
        h1: '3rem',
        h2: '2.25rem',
        h3: '1.75rem',
        h4: '1.375rem',
        h5: '1.125rem',
        h6: '1rem',
        body1: '1rem',
        body2: '0.875rem',
        caption: '0.75rem'
      },
      lineHeights: {
        heading: 1.3,
        body: 1.6
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em'
      },
      fontWeights: {
        light: 300,
        normal: 400,
        medium: 500,
        bold: 700
      }
    });
    setEditingConfig(null);
    setValidation(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, config: TypographyConfig) => {
    setMenuAnchor(event.currentTarget);
    setSelectedConfig(config);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedConfig(null);
  };

  const TypographyPreview = ({ config, name, isActive, onClick, onMenuClick }: {
    config: any;
    name: string;
    isActive?: boolean;
    onClick?: () => void;
    onMenuClick?: (event: React.MouseEvent<HTMLElement>) => void;
  }) => {
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
          <CardContent sx={{ p: 3 }}>
            {/* Typography Preview */}
            <Box mb={2}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: config.headingFontFamily,
                  fontWeight: config.fontWeights?.bold || 700,
                  fontSize: config.fontSizes?.h4 || '1.375rem',
                  lineHeight: config.lineHeights?.heading || 1.3,
                  mb: 1
                }}
              >
                Restaurant Name
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: config.bodyFontFamily,
                  fontWeight: config.fontWeights?.normal || 400,
                  fontSize: config.fontSizes?.body1 || '1rem',
                  lineHeight: config.lineHeights?.body || 1.6,
                  color: 'text.secondary'
                }}
              >
                Fresh ingredients, authentic flavors, exceptional dining experience.
              </Typography>
            </Box>
            
            {/* Configuration Name and Status */}
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
            
            {/* Font Information */}
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary" display="block">
                Heading: {config.headingFontFamily}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Body: {config.bodyFontFamily}
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

  const FontPairingCard = ({ pairing, onClick }: {
    pairing: FontPairing;
    onClick: () => void;
  }) => (
    <Card sx={{ '&:hover': { borderColor: 'primary.main' } }}>
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ p: 2 }}>
          <Box mb={1}>
            <Chip 
              size="small" 
              label={pairing.category} 
              color="primary" 
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {pairing.style}
            </Typography>
          </Box>
          
          <Typography
            variant="h6"
            sx={{ fontFamily: pairing.heading, mb: 0.5 }}
          >
            {pairing.heading}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: pairing.body, color: 'text.secondary', mb: 1 }}
          >
            {pairing.body}
          </Typography>
          
          <Typography variant="caption" display="block">
            {pairing.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Advanced Typography Control</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Typography
        </Button>
      </Box>

      {/* Toggle for Font Pairings */}
      <FormControlLabel
        control={
          <Switch
            checked={showPairings}
            onChange={(e) => setShowPairings(e.target.checked)}
          />
        }
        label="Show Professional Font Pairings"
        sx={{ mb: 2 }}
      />

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Quick Start - Default Configurations */}
      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Quick Start Templates
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(defaultConfigs).map(([style, config]) => (
            <Grid item xs={12} sm={6} md={4} key={style}>
              <TypographyPreview
                config={config}
                name={config.name}
                onClick={() => handleCreateFromDefault(style)}
              />
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 3 }} />
      </Box>

      {/* Professional Font Pairings */}
      {showPairings && (
        <Box mb={4}>
          <Typography variant="subtitle1" gutterBottom>
            Professional Font Pairings
          </Typography>
          <Grid container spacing={2}>
            {fontPairings.map((pairing, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FontPairingCard
                  pairing={pairing}
                  onClick={() => handleCreateFromPairing(pairing)}
                />
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 3 }} />
        </Box>
      )}

      {/* Custom Typography Configurations */}
      <Typography variant="subtitle1" gutterBottom>
        Your Custom Typography Configurations
      </Typography>
      
      {configs.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No custom typography configurations created yet. Create your first configuration using the templates above or by clicking "Create Typography".
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {configs.map((config) => (
            <Grid item xs={12} sm={6} md={4} key={config.id}>
              <TypographyPreview
                config={config}
                name={config.name}
                isActive={config.isActive}
                onClick={() => handleActivateConfig(config)}
                onMenuClick={(event) => handleMenuClick(event, config)}
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
          if (selectedConfig) handleEditConfig(selectedConfig);
          handleMenuClose();
        }}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedConfig) handleDeleteConfig(selectedConfig);
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
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {editingConfig ? 'Edit Typography Configuration' : 'Create Typography Configuration'}
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Quick Start" />
            <Tab label="Custom Configuration" />
            <Tab label="Font Pairing Guide" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              {Object.entries(defaultConfigs).map(([style, config]) => (
                <Grid item xs={12} sm={6} key={style}>
                  <TypographyPreview
                    config={config}
                    name={config.name}
                    onClick={() => {
                      setFormData({ ...config });
                      setTabValue(1);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Configuration Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Configuration Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>

              {/* Font Selection */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={formData.headingFontFamily}
                  onChange={(e, value) => setFormData({ ...formData, headingFontFamily: value || 'Playfair Display' })}
                  options={googleFonts.map(font => font.family)}
                  renderInput={(params) => <TextField {...params} label="Heading Font" />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={formData.bodyFontFamily}
                  onChange={(e, value) => setFormData({ ...formData, bodyFontFamily: value || 'Open Sans' })}
                  options={googleFonts.map(font => font.family)}
                  renderInput={(params) => <TextField {...params} label="Body Font" />}
                />
              </Grid>

              {/* Font Sizes */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Font Sizes</Typography>
              </Grid>
              {Object.entries(formData.fontSizes).map(([key, value]) => (
                <Grid item xs={6} md={3} key={key}>
                  <TextField
                    fullWidth
                    label={key.toUpperCase()}
                    value={value}
                    onChange={(e) => setFormData({
                      ...formData,
                      fontSizes: { ...formData.fontSizes, [key]: e.target.value }
                    })}
                  />
                </Grid>
              ))}

              {/* Line Heights */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Heading Line Height</Typography>
                <Slider
                  value={formData.lineHeights.heading}
                  onChange={(e, value) => setFormData({
                    ...formData,
                    lineHeights: { ...formData.lineHeights, heading: value as number }
                  })}
                  min={1}
                  max={2}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Body Line Height</Typography>
                <Slider
                  value={formData.lineHeights.body}
                  onChange={(e, value) => setFormData({
                    ...formData,
                    lineHeights: { ...formData.lineHeights, body: value as number }
                  })}
                  min={1}
                  max={2.5}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>

              {/* Enhanced Preview */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Live Preview</Typography>
                <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ 
                    fontFamily: formData.bodyFontFamily,
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      fontFamily: formData.headingFontFamily,
                      fontWeight: formData.fontWeights?.bold || 700,
                      lineHeight: formData.lineHeights?.heading || 1.3
                    },
                    '& p': {
                      fontFamily: formData.bodyFontFamily,
                      fontWeight: formData.fontWeights?.normal || 400,
                      lineHeight: formData.lineHeights?.body || 1.6
                    }
                  }}>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: formData.fontSizes.h1,
                        mb: 2,
                        fontFamily: formData.headingFontFamily,
                        fontWeight: formData.fontWeights?.bold || 700,
                        lineHeight: formData.lineHeights?.heading || 1.3
                      }}
                    >
                      Restaurant Name
                    </Typography>
                    <Typography
                      variant="h2"
                      sx={{
                        fontSize: formData.fontSizes.h2,
                        mb: 2,
                        fontFamily: formData.headingFontFamily,
                        fontWeight: formData.fontWeights?.bold || 700,
                        lineHeight: formData.lineHeights?.heading || 1.3
                      }}
                    >
                      Welcome to Our Restaurant
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: formData.fontSizes.body1,
                        mb: 2,
                        fontFamily: formData.bodyFontFamily,
                        fontWeight: formData.fontWeights?.normal || 400,
                        lineHeight: formData.lineHeights?.body || 1.6
                      }}
                    >
                      Experience the finest dining with our carefully crafted menu featuring fresh, locally-sourced ingredients. Our chefs combine traditional techniques with modern innovation to create unforgettable flavors.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: formData.fontSizes.body2,
                        fontFamily: formData.bodyFontFamily,
                        fontWeight: formData.fontWeights?.normal || 400,
                        lineHeight: formData.lineHeights?.body || 1.6
                      }}
                    >
                      Visit us for lunch, dinner, or weekend brunch. We offer private dining options for special events and celebrations.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Validation */}
              {validation && (
                <Grid item xs={12}>
                  <Alert 
                    severity={validation.isValid ? 'success' : 'warning'}
                    icon={validation.isValid ? <CheckCircleIcon /> : <WarningIcon />}
                  >
                    <Typography variant="body2">
                      <strong>Accessibility Status:</strong> {validation.isValid ? 'Compliant' : 'Issues Found'}
                    </Typography>
                    {validation.warnings.map((warning, index) => (
                      <Typography key={index} variant="caption" display="block" sx={{ mt: 0.5 }}>
                        • {warning}
                      </Typography>
                    ))}
                    {validation.suggestions.map((suggestion, index) => (
                      <Typography key={index} variant="caption" display="block" sx={{ mt: 0.5, color: 'primary.main' }}>
                        💡 {suggestion}
                      </Typography>
                    ))}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose from professionally curated font pairings designed for different restaurant styles.
            </Typography>
            <Grid container spacing={2}>
              {fontPairings.map((pairing, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <FontPairingCard
                    pairing={pairing}
                    onClick={() => handleCreateFromPairing(pairing)}
                  />
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button 
            onClick={editingConfig ? handleUpdateConfig : handleCreateConfig}
            variant="contained"
            disabled={!formData.name.trim() || loading}
          >
            {editingConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedTypographySelector; 