import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  FormControl,
  FormLabel,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  Save,
  CloudUpload as UploadIcon,
  Palette as PaletteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { restaurantSettingsService, RestaurantSettings } from '../services/restaurantSettingsService';
import { useSnackbar } from '../context/SnackbarContext';

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
      id={`settings-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const RestaurantSettingsPage: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await restaurantSettingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showSnackbar('Failed to load restaurant settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const updatedSettings = await restaurantSettingsService.updateSettings(settings);
      setSettings(updatedSettings);
      setHasChanges(false);
      showSnackbar('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof RestaurantSettings | string, value: any) => {
    setSettings(prev => {
      if (!prev) return null;
      
      // Handle nested fields like openingHours.monday.open
      if (field.includes('.')) {
        const parts = field.split('.');
        const newSettings = { ...prev };
        let current: any = newSettings;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          } else {
            current[parts[i]] = { ...current[parts[i]] };
          }
          current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = value;
        return newSettings;
      }
      
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  };

  const handleImageUpload = async (field: 'hero' | 'about' | 'cover' | 'logo', file: File) => {
    try {
      const result = await restaurantSettingsService.uploadImage(field, file);
      setSettings(result.settings);
      showSnackbar(`${field} image uploaded successfully`, 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showSnackbar('Failed to upload image', 'error');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!settings) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">Failed to load restaurant settings</Alert>
      </Container>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Restaurant Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all customer-facing content and settings for your restaurant
            </Typography>
          </Box>
          <Button
            variant="outlined"
            component={Link}
            to="/content-blocks"
            startIcon={<EditIcon />}
          >
            Manage Content Blocks
          </Button>
        </Box>
      </Box>

      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Branding & Theme" />
          <Tab label="Hero & About" />
          <Tab label="Contact & Hours" />
          <Tab label="Menu Display" />
          <Tab label="Social & Footer" />
          <Tab label="SEO" />
          <Tab 
            label="Billing" 
            icon={<PaymentIcon />} 
            iconPosition="start"
            onClick={(e) => {
              e.preventDefault();
              navigate('/settings/billing');
            }}
          />
        </Tabs>
      </Paper>

      <Paper>
        {/* Branding & Theme Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Website Branding</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website Name"
                value={settings.websiteName || ''}
                onChange={(e) => handleFieldChange('websiteName', e.target.value)}
                helperText="The name displayed in the header and browser tab"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tagline"
                value={settings.tagline || ''}
                onChange={(e) => handleFieldChange('tagline', e.target.value)}
                helperText="Short description of your restaurant"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" gutterBottom>Logo</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                  >
                    Upload Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('logo', file);
                      }}
                    />
                  </Button>
                  {settings.logoUrl && (
                    <Box
                      component="img"
                      src={settings.logoUrl}
                      alt="Logo"
                      sx={{ height: 60, objectFit: 'contain' }}
                    />
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Theme Colors</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                value={settings.primaryColor || '#1976d2'}
                onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaletteIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Main brand color"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Secondary Color"
                type="color"
                value={settings.secondaryColor || '#dc004e'}
                onChange={(e) => handleFieldChange('secondaryColor', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaletteIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Accent color"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Text/Accent Color"
                type="color"
                value={settings.accentColor || '#333333'}
                onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaletteIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Text and accent elements"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Typography</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Primary Font</InputLabel>
                <Select
                  value={settings.fontPrimary || 'Roboto, sans-serif'}
                  onChange={(e) => handleFieldChange('fontPrimary', e.target.value)}
                  label="Primary Font"
                >
                  <MenuItem value="Roboto, sans-serif">Roboto</MenuItem>
                  <MenuItem value="Open Sans, sans-serif">Open Sans</MenuItem>
                  <MenuItem value="Lato, sans-serif">Lato</MenuItem>
                  <MenuItem value="Montserrat, sans-serif">Montserrat</MenuItem>
                  <MenuItem value="Playfair Display, serif">Playfair Display</MenuItem>
                  <MenuItem value="Georgia, serif">Georgia</MenuItem>
                  <MenuItem value="Merriweather, serif">Merriweather</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Secondary Font</InputLabel>
                <Select
                  value={settings.fontSecondary || 'Playfair Display, serif'}
                  onChange={(e) => handleFieldChange('fontSecondary', e.target.value)}
                  label="Secondary Font"
                >
                  <MenuItem value="Roboto, sans-serif">Roboto</MenuItem>
                  <MenuItem value="Open Sans, sans-serif">Open Sans</MenuItem>
                  <MenuItem value="Lato, sans-serif">Lato</MenuItem>
                  <MenuItem value="Montserrat, sans-serif">Montserrat</MenuItem>
                  <MenuItem value="Playfair Display, serif">Playfair Display</MenuItem>
                  <MenuItem value="Georgia, serif">Georgia</MenuItem>
                  <MenuItem value="Merriweather, serif">Merriweather</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preview
                  </Typography>
                  <Box
                    sx={{
                      p: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: '#fff'
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: settings.fontPrimary || 'Roboto, sans-serif',
                        color: settings.primaryColor || '#1976d2',
                        mb: 1
                      }}
                    >
                      {settings.websiteName || 'Restaurant Name'}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: settings.fontSecondary || 'Playfair Display, serif',
                        color: settings.accentColor || '#333333',
                        mb: 2
                      }}
                    >
                      {settings.tagline || 'Your tagline here'}
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: settings.primaryColor || '#1976d2',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: settings.secondaryColor || '#dc004e'
                        }
                      }}
                    >
                      Sample Button
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Hero & About Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Hero Section</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hero Title"
                value={settings.heroTitle || ''}
                onChange={(e) => handleFieldChange('heroTitle', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hero Subtitle"
                value={settings.heroSubtitle || ''}
                onChange={(e) => handleFieldChange('heroSubtitle', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CTA Button Text"
                value={settings.heroCTAText || ''}
                onChange={(e) => handleFieldChange('heroCTAText', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CTA Button Link"
                value={settings.heroCTALink || ''}
                onChange={(e) => handleFieldChange('heroCTALink', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" gutterBottom>Hero Image</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Upload Hero Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('hero', file);
                    }}
                  />
                </Button>
                {settings.heroImageUrl && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Current: {settings.heroImageUrl}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>About Section</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="About Title"
                value={settings.aboutTitle || ''}
                onChange={(e) => handleFieldChange('aboutTitle', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="About Description"
                value={settings.aboutDescription || ''}
                onChange={(e) => handleFieldChange('aboutDescription', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" gutterBottom>About Image</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Upload About Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('about', file);
                    }}
                  />
                </Button>
                {settings.aboutImageUrl && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Current: {settings.aboutImageUrl}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Contact & Hours Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Contact Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={settings.contactPhone || ''}
                onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={settings.contactEmail || ''}
                onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={settings.contactAddress || ''}
                onChange={(e) => handleFieldChange('contactAddress', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={settings.contactCity || ''}
                onChange={(e) => handleFieldChange('contactCity', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={settings.contactState || ''}
                onChange={(e) => handleFieldChange('contactState', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={settings.contactZip || ''}
                onChange={(e) => handleFieldChange('contactZip', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Opening Hours</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {days.map(day => (
              <Grid item xs={12} key={day}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography sx={{ width: 100, textTransform: 'capitalize' }}>
                    {day}:
                  </Typography>
                  <TextField
                    size="small"
                    label="Open"
                    value={settings.openingHours?.[day]?.open || ''}
                    onChange={(e) => handleFieldChange(`openingHours.${day}.open`, e.target.value)}
                    sx={{ width: 150 }}
                  />
                  <Typography>to</Typography>
                  <TextField
                    size="small"
                    label="Close"
                    value={settings.openingHours?.[day]?.close || ''}
                    onChange={(e) => handleFieldChange(`openingHours.${day}.close`, e.target.value)}
                    sx={{ width: 150 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Menu Display Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Menu Display Settings</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Menu Display Mode</FormLabel>
                <RadioGroup
                  value={settings.menuDisplayMode || 'tabs'}
                  onChange={(e) => handleFieldChange('menuDisplayMode', e.target.value)}
                >
                  <FormControlLabel value="tabs" control={<Radio />} label="Tabs (Multiple menus as tabs)" />
                  <FormControlLabel value="accordion" control={<Radio />} label="Accordion (Expandable sections)" />
                  <FormControlLabel value="single" control={<Radio />} label="Single Page (All menus on one page)" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Active Menus</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select which menus to display on the customer portal
              </Typography>
              <Box sx={{ mt: 2 }}>
                {settings.restaurant?.menus.map(menu => (
                  <Chip
                    key={menu.id}
                    label={menu.name}
                    onClick={() => {
                      const activeIds = settings.activeMenuIds || [];
                      const newIds = activeIds.includes(menu.id)
                        ? activeIds.filter(id => id !== menu.id)
                        : [...activeIds, menu.id];
                      handleFieldChange('activeMenuIds', newIds);
                    }}
                    color={settings.activeMenuIds?.includes(menu.id) ? 'primary' : 'default'}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Social & Footer Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Social Media</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Facebook URL"
                value={settings.facebookUrl || ''}
                onChange={(e) => handleFieldChange('facebookUrl', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FacebookIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Instagram URL"
                value={settings.instagramUrl || ''}
                onChange={(e) => handleFieldChange('instagramUrl', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InstagramIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Twitter URL"
                value={settings.twitterUrl || ''}
                onChange={(e) => handleFieldChange('twitterUrl', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TwitterIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Footer</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Footer Text"
                value={settings.footerText || ''}
                onChange={(e) => handleFieldChange('footerText', e.target.value)}
                helperText="Use {year} to automatically insert the current year"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* SEO Tab */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Search Engine Optimization</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Title"
                value={settings.metaTitle || ''}
                onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
                helperText="Title that appears in search results"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Meta Description"
                value={settings.metaDescription || ''}
                onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
                helperText="Description that appears in search results (150-160 characters recommended)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Keywords"
                value={settings.metaKeywords || ''}
                onChange={(e) => handleFieldChange('metaKeywords', e.target.value)}
                helperText="Comma-separated keywords for search engines"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Floating Save Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          disabled={!hasChanges || saving}
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Container>
  );
};

export default RestaurantSettingsPage; 