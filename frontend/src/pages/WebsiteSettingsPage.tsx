import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import {
  Web as WebIcon,
  Settings as SettingsIcon,
  Pages as PagesIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import PageManagementDialog from '../components/PageManagementDialog';
import { restaurantSettingsService, RestaurantSettings } from '../services/restaurantSettingsService';
import { pageService, Page } from '../services/pageService';
import { buildRestaurantUrl } from '../utils/subdomain';

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
      id={`website-tabpanel-${index}`}
      aria-labelledby={`website-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Using imported types from services

const WebsiteSettingsPage: React.FC = () => {
  // Handle tab navigation via URL hash
  const getTabFromHash = () => {
    const hash = window.location.hash.slice(1); // Remove #
    switch (hash) {
      case 'content': return 0;
      case 'pages': return 1;
      case 'preview': return 2;
      default: return 0;
    }
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Listen for hash changes to update active tab
  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsData, pagesResponse] = await Promise.all([
        restaurantSettingsService.getSettings(),
        pageService.getPages()
      ]);
      setSettings(settingsData);
      setPages(pagesResponse.pages);
    } catch (error) {
      console.error('Error fetching website data:', error);
      setMessage({ type: 'error', text: 'Failed to load website data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await restaurantSettingsService.updateSettings(settings);
      setMessage({ type: 'success', text: 'Website settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save website settings' });
    } finally {
      setSaving(false);
    }
  };

  const handlePageSave = async (pageData: any) => {
    try {
      if (selectedPage) {
        await pageService.updatePage(selectedPage.id, pageData);
        setMessage({ type: 'success', text: 'Page updated successfully!' });
      } else {
        await pageService.createPage(pageData);
        setMessage({ type: 'success', text: 'Page created successfully!' });
      }
      fetchData(); // Refresh data
      setPageDialogOpen(false);
      setSelectedPage(null);
    } catch (error) {
      console.error('Error saving page:', error);
      setMessage({ type: 'error', text: 'Failed to save page' });
    }
  };

  const handlePageDelete = async (pageId: number) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    
    try {
      await pageService.deletePage(pageId);
      setMessage({ type: 'success', text: 'Page deleted successfully!' });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting page:', error);
      setMessage({ type: 'error', text: 'Failed to delete page' });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Update URL hash to match tab
    const hashes = ['content', 'pages', 'preview'];
    window.location.hash = hashes[newValue] || '';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading website settings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Website Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your restaurant's website content, pages, and appearance
        </Typography>
      </Box>

      {/* Alert Messages */}
      {message && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage(null)}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="website settings tabs"
          variant="fullWidth"
        >
          <Tab 
            icon={<SettingsIcon />} 
            label="Content & Styling" 
            id="website-tab-0"
            aria-controls="website-tabpanel-0"
          />
          <Tab 
            icon={<PagesIcon />} 
            label="Page Management" 
            id="website-tab-1"
            aria-controls="website-tabpanel-1"
          />
          <Tab 
            icon={<WebIcon />} 
            label="Website Preview" 
            id="website-tab-2"
            aria-controls="website-tabpanel-2"
          />
        </Tabs>
      </Paper>

      {/* Content & Styling Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Hero Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hero Section
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Hero Title"
                      value={settings?.heroTitle || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, heroTitle: e.target.value} : null)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Hero Subtitle"
                      value={settings?.heroSubtitle || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, heroSubtitle: e.target.value} : null)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Call-to-Action Text"
                      value={settings?.heroCTAText || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, heroCTAText: e.target.value} : null)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Call-to-Action Link"
                      value={settings?.heroCTALink || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, heroCTALink: e.target.value} : null)}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* About Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About Section
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="About Title"
                      value={settings?.aboutTitle || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, aboutTitle: e.target.value} : null)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="About Description"
                      multiline
                      rows={4}
                      value={settings?.aboutDescription || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, aboutDescription: e.target.value} : null)}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Styling */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Colors & Branding
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Primary Color"
                      type="color"
                      value={settings?.primaryColor || '#1976d2'}
                      onChange={(e) => setSettings(prev => prev ? {...prev, primaryColor: e.target.value} : null)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Secondary Color"
                      type="color"
                      value={settings?.secondaryColor || '#dc004e'}
                      onChange={(e) => setSettings(prev => prev ? {...prev, secondaryColor: e.target.value} : null)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Accent Color"
                      type="color"
                      value={settings?.accentColor || '#333333'}
                      onChange={(e) => setSettings(prev => prev ? {...prev, accentColor: e.target.value} : null)}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSettingsSave}
                disabled={saving}
                size="large"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Page Management Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Website Pages
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedPage(null);
              setPageDialogOpen(true);
            }}
          >
            Add New Page
          </Button>
        </Box>

        <Grid container spacing={2}>
          {pages.map((page) => (
            <Grid item xs={12} md={6} lg={4} key={page.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h3">
                      {page.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {page.isSystem && <Chip size="small" label="System" color="primary" />}
                      {!page.isActive && <Chip size="small" label="Inactive" color="default" />}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    /{page.slug}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {page.description || 'No description'}
                  </Typography>
                  <Typography variant="caption" display="block" gutterBottom>
                    Template: {page.template}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setSelectedPage(page);
                      setPageDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  {!page.isSystem && (
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handlePageDelete(page.id)}
                      color="error"
                    >
                      Delete
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Website Preview Tab */}
      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Website Preview & Deployment
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Your restaurant website is live and accessible to customers!
              </Typography>
              {settings?.restaurant?.slug && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Website URL: {buildRestaurantUrl(settings.restaurant.slug)}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    href={buildRestaurantUrl(settings.restaurant.slug)}
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    🌐 View Live Website
                  </Button>
                </>
              )}
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Pro Tip:</strong> All changes you make in the Content & Styling tab are immediately visible on your live website.
                Use the Page Management tab to add custom pages and organize your site navigation.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Page Management Dialog */}
      {pageDialogOpen && (
        <PageManagementDialog
          open={pageDialogOpen}
          onClose={() => {
            setPageDialogOpen(false);
            setSelectedPage(null);
          }}
          onSave={handlePageSave}
          page={selectedPage}
        />
      )}
    </Container>
  );
};

export default WebsiteSettingsPage; 