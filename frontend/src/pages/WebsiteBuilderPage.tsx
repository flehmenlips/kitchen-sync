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
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  ListItemIcon as MuiListItemIcon,
  Fab
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
  Payment as PaymentIcon,
  Edit as EditIcon,
  Public as PublicIcon,
  ColorLens as ColorLensIcon,
  Pages as PagesIcon,
  Settings as SettingsIcon,
  Search as SeoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Restaurant as RestaurantIcon,
  Contacts as ContactIcon,
  MoreVert as MoreIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { restaurantSettingsService, RestaurantSettings } from '../services/restaurantSettingsService';
import { api } from '../services/api';
import { 
  websiteBuilderService, 
  WebsiteBuilderData, 
  WBPage,
  WBBlock,
  PageCreationData,
  BlockCreationData 
} from '../services/websiteBuilderService';
import ContentBlockEditor from '../components/ContentBlockEditor';
import { useSnackbar } from '../context/SnackbarContext';
import { useRestaurant } from '../context/RestaurantContext';
import { buildRestaurantUrl } from '../utils/subdomain';
import { SubdomainInfo } from '../components/SubdomainInfo';
import TemplateSelector from '../components/TemplateSelector';

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

const WebsiteBuilderPage: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [websiteData, setWebsiteData] = useState<WebsiteBuilderData | null>(null);
  const [selectedPage, setSelectedPage] = useState<WBPage | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [blockMenuAnchor, setBlockMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0: Settings, 1: Pages, 2: Branding, 3: SEO
  const [hasChanges, setHasChanges] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [editPageDialogOpen, setEditPageDialogOpen] = useState(false);
  const [addBlockDialogOpen, setAddBlockDialogOpen] = useState(false);
  const [newPageData, setNewPageData] = useState<PageCreationData>({
    name: '',
    slug: '',
    template: 'default'
  });
  const [editPageData, setEditPageData] = useState<PageCreationData>({
    name: '',
    slug: '',
    template: 'default'
  });
  const [newBlockData, setNewBlockData] = useState<BlockCreationData>({
    blockType: 'text',
    title: '',
    content: ''
  });
  const navigate = useNavigate();
  const { currentRestaurant } = useRestaurant();

  useEffect(() => {
    fetchWebsiteData();
  }, []);

  const fetchWebsiteData = async () => {
    try {
      setLoading(true);
      const data = await websiteBuilderService.getWebsiteBuilderData();
      setWebsiteData(data);
      setHasChanges(false); // Reset changes state when data is loaded
      // Select the first page by default
      if (data.pages.length > 0) {
        setSelectedPage(data.pages[0]);
      }
    } catch (error) {
      console.error('Error fetching website data:', error);
      showSnackbar('Failed to load website data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!websiteData) return;

    try {
      setSaving(true);
      await websiteBuilderService.updateSettings(websiteData.settings);
      setHasChanges(false);
      showSnackbar('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    setWebsiteData(prev => {
      if (!prev) return null;
      
      // Handle nested fields like openingHours.monday.open
      if (field.includes('.')) {
        const parts = field.split('.');
        const newSettings = { ...prev.settings };
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
        return { ...prev, settings: newSettings };
      }
      
      return { 
        ...prev, 
        settings: { ...prev.settings, [field]: value }
      };
    });
    setHasChanges(true);
  };

  const handleCreatePage = async () => {
    try {
      const newPage = await websiteBuilderService.createPage(newPageData);
      setWebsiteData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          pages: [...prev.pages, newPage].sort((a, b) => a.displayOrder - b.displayOrder)
        };
      });
      setSelectedPage(newPage);
      setPageDialogOpen(false);
      setNewPageData({ name: '', slug: '', template: 'default' });
      showSnackbar('Page created successfully', 'success');
    } catch (error) {
      console.error('Error creating page:', error);
      showSnackbar('Failed to create page', 'error');
    }
  };

  const handleDeletePage = async (pageSlug: string) => {
    try {
      await websiteBuilderService.deletePage(pageSlug);
      setWebsiteData(prev => {
        if (!prev) return null;
        const updatedPages = prev.pages.filter(p => p.slug !== pageSlug);
        return { ...prev, pages: updatedPages };
      });
      
      // If deleted page was selected, select first remaining page
      if (selectedPage?.slug === pageSlug && websiteData) {
        const remainingPages = websiteData.pages.filter(p => p.slug !== pageSlug);
        setSelectedPage(remainingPages.length > 0 ? remainingPages[0] : null);
      }
      
      showSnackbar('Page deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting page:', error);
      showSnackbar('Failed to delete page', 'error');
    }
  };

  const handleEditPage = (page: WBPage) => {
    setEditPageData({
      name: page.name,
      slug: page.slug,
      template: 'default', // We'll need to add template to WBPage interface if needed
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || ''
    });
    setEditPageDialogOpen(true);
  };

  const handleUpdatePage = async () => {
    if (!selectedPage) return;
    
    try {
      const updatedPage = await websiteBuilderService.updatePage(selectedPage.slug, editPageData);
      
      // Update local state
      setWebsiteData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          pages: prev.pages.map(page =>
            page.slug === selectedPage.slug ? updatedPage : page
          )
        };
      });
      
      // Update selected page
      setSelectedPage(updatedPage);
      setEditPageDialogOpen(false);
      setEditPageData({ name: '', slug: '', template: 'default' });
      showSnackbar('Page updated successfully', 'success');
    } catch (error) {
      console.error('Error updating page:', error);
      showSnackbar('Failed to update page', 'error');
    }
  };

  // Content Block Management Handlers
  const handleSaveBlock = async (blockData: Partial<WBBlock>) => {
    // Get the block ID from the blockData if editingBlockId is not set (for auto-save)
    const blockId = editingBlockId || blockData.id;
    if (!selectedPage || !blockId) return;

    try {
      const updatedBlock = await websiteBuilderService.updateContentBlock(
        selectedPage.slug,
        blockId,
        blockData
      );

      // Update the block in local state
      setWebsiteData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          pages: prev.pages.map(page =>
            page.slug === selectedPage.slug
              ? {
                  ...page,
                  blocks: page.blocks.map(block =>
                    block.id === blockId ? updatedBlock : block
                  )
                }
              : page
          )
        };
      });

      // Update selected page
      setSelectedPage(prev => {
        if (!prev) return null;
        return {
          ...prev,
          blocks: prev.blocks.map(block =>
            block.id === blockId ? updatedBlock : block
          )
        };
      });

      // Note: Don't set hasChanges for block updates since they're already saved individually
      // The main save button is only for website settings, not content blocks
      
      // Only reset editingBlockId if we were in explicit edit mode
      if (editingBlockId) {
        setEditingBlockId(null);
        showSnackbar('Block updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating block:', error);
      if (editingBlockId) {
        showSnackbar('Failed to update block', 'error');
      }
    }
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (!selectedPage) return;

    try {
      await websiteBuilderService.deleteContentBlock(selectedPage.slug, blockId);

      // Update local state
      setWebsiteData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          pages: prev.pages.map(page =>
            page.slug === selectedPage.slug
              ? {
                  ...page,
                  blocks: page.blocks.filter(block => block.id !== blockId)
                }
              : page
          )
        };
      });

      // Update selected page
      setSelectedPage(prev => {
        if (!prev) return null;
        return {
          ...prev,
          blocks: prev.blocks.filter(block => block.id !== blockId)
        };
      });

      showSnackbar('Block deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting block:', error);
      showSnackbar('Failed to delete block', 'error');
    }
  };

  const handleAddBlock = async () => {
    if (!selectedPage) return;

    try {
      const newBlock = await websiteBuilderService.createContentBlock(
        selectedPage.slug,
        newBlockData
      );

      // Update local state
      setWebsiteData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          pages: prev.pages.map(page =>
            page.slug === selectedPage.slug
              ? {
                  ...page,
                  blocks: [...page.blocks, newBlock].sort((a, b) => a.displayOrder - b.displayOrder)
                }
              : page
          )
        };
      });

      // Update selected page
      setSelectedPage(prev => {
        if (!prev) return null;
        return {
          ...prev,
          blocks: [...prev.blocks, newBlock].sort((a, b) => a.displayOrder - b.displayOrder)
        };
      });

      setAddBlockDialogOpen(false);
      setNewBlockData({ blockType: 'text', title: '', content: '' });
      showSnackbar('Block added successfully', 'success');
    } catch (error) {
      console.error('Error adding block:', error);
      showSnackbar('Failed to add block', 'error');
    }
  };

  const handleBlockMenuClick = (event: React.MouseEvent<HTMLButtonElement>, blockId: number) => {
    setBlockMenuAnchor(event.currentTarget);
    setSelectedBlockId(blockId);
  };

  const handleBlockMenuClose = () => {
    setBlockMenuAnchor(null);
    setSelectedBlockId(null);
  };

  const handleImageUpload = async (field: 'hero' | 'about' | 'cover' | 'logo', file: File) => {
    try {
      const result = await restaurantSettingsService.uploadImage(field, file);
      
      setWebsiteData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          settings: {
            ...prevData.settings,
            ...result.settings
          }
        };
      });
      
      showSnackbar('Image uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showSnackbar('Failed to upload image', 'error');
    }
  };

  const handlePostCreateImageUpload = async (blockId: number, file: File): Promise<{ imageUrl: string; publicId: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post(`/content-blocks/${blockId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const data = response.data;
      
      // Refresh the website data to show the updated block
      await fetchWebsiteData();
      
      return {
        imageUrl: data.imageUrl,
        publicId: data.publicId
      };
    } catch (error) {
      console.error('Error uploading image after block creation:', error);
      throw error;
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

  if (!websiteData) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">Failed to load website data</Alert>
      </Container>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Container maxWidth="lg">
      {/* Show subdomain info in development */}
      {process.env.NODE_ENV === 'development' && <SubdomainInfo />}
      
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Website Builder
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all customer-facing content and settings for your website
            </Typography>
          </Box>
          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            <Button
              variant="contained"
              component="a"
              href={buildRestaurantUrl(currentRestaurant?.slug || 'restaurant')}
              target="_blank"
              startIcon={<PublicIcon />}
              color="primary"
              size="large"
            >
              🌐 Preview Live Website
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to="/website/content"
              startIcon={<EditIcon />}
            >
              Manage Content Blocks
            </Button>
            <Button
              variant="outlined"
              onClick={() => setTemplateSelectorOpen(true)}
              startIcon={<ColorLensIcon />}
            >
              Choose Template
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Website Deployment Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.lighter', border: '1px solid', borderColor: 'primary.light' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <PublicIcon color="primary" />
          <Box>
            <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
              Your Website is Live! 🎉
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your restaurant website is automatically deployed at:{' '}
              <strong>{buildRestaurantUrl(currentRestaurant?.slug || 'restaurant')}</strong>
              <br />
              Changes you make here are instantly reflected on your live website. No manual deployment needed!
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<SettingsIcon />} label="Settings" />
          <Tab icon={<PagesIcon />} label="Pages" />
          <Tab icon={<PaletteIcon />} label="Branding" />
          <Tab icon={<SeoIcon />} label="SEO" />
        </Tabs>
      </Paper>

      <Paper>
        {/* Settings Tab - Contact & Hours, Menu Display */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Contact Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={websiteData.settings.contactPhone || ''}
                onChange={(e) => handleSettingsChange('contactPhone', e.target.value)}
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
                value={websiteData.settings.contactEmail || ''}
                onChange={(e) => handleSettingsChange('contactEmail', e.target.value)}
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
                value={websiteData.settings.contactAddress || ''}
                onChange={(e) => handleSettingsChange('contactAddress', e.target.value)}
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
                value={websiteData.settings.contactCity || ''}
                onChange={(e) => handleSettingsChange('contactCity', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={websiteData.settings.contactState || ''}
                onChange={(e) => handleSettingsChange('contactState', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={websiteData.settings.contactZip || ''}
                onChange={(e) => handleSettingsChange('contactZip', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Opening Hours</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            {days.map(day => (
              <Grid item xs={12} key={day}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body1" sx={{ minWidth: 120, textTransform: 'capitalize' }}>
                    {day}
                  </Typography>
                  <TextField
                    size="small"
                    label="Open"
                    value={websiteData.settings.openingHours?.[day]?.open || ''}
                    onChange={(e) => handleSettingsChange(`openingHours.${day}.open`, e.target.value)}
                    sx={{ width: 150 }}
                  />
                  <Typography variant="body2">to</Typography>
                  <TextField
                    size="small"
                    label="Close"
                    value={websiteData.settings.openingHours?.[day]?.close || ''}
                    onChange={(e) => handleSettingsChange(`openingHours.${day}.close`, e.target.value)}
                    sx={{ width: 150 }}
                  />
                </Box>
              </Grid>
            ))}

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Menu Display</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Menu Display Mode</FormLabel>
                <RadioGroup
                  value={websiteData.settings.menuDisplayMode || 'tabs'}
                  onChange={(e) => handleSettingsChange('menuDisplayMode', e.target.value)}
                >
                  <FormControlLabel value="tabs" control={<Radio />} label="Tabs (Multiple menus as tabs)" />
                  <FormControlLabel value="sections" control={<Radio />} label="Sections (All menus on one page)" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Active Menus
              </Typography>
              <Box sx={{ mt: 2 }}>
                {/* Note: Restaurant menus will be fetched separately when needed */}
                <Typography variant="body2" color="text.secondary">
                  Menu management integration to be added
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Pages Tab - Hero & About + Custom Pages */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              {/* Page Sidebar */}
              <Paper sx={{ p: 2, height: 'fit-content' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Pages</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setPageDialogOpen(true)}
                  >
                    Add Page
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click on a page to edit its content
                </Typography>
                <List>
                  {websiteData.pages.map(page => (
                    <ListItem key={page.slug} disablePadding>
                      <ListItemButton
                        selected={selectedPage?.slug === page.slug}
                        onClick={() => setSelectedPage(page)}
                      >
                        <ListItemIcon>
                          {page.slug === 'home' && <HomeIcon />}
                          {page.slug === 'about' && <InfoIcon />}
                          {page.slug === 'contact' && <ContactIcon />}
                          {!['home', 'about', 'contact'].includes(page.slug) && <PagesIcon />}
                        </ListItemIcon>
                        <ListItemText 
                          primary={page.name}
                          secondary={page.isActive ? 'Published' : 'Draft'}
                        />
                        {!page.isSystem && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(page.slug);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              {/* Enhanced Page Content Editor */}
              {selectedPage ? (
                <Box>
                  {/* Page Header */}
                  <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.lighter', border: '1px solid', borderColor: 'success.light' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box>
                        <Typography variant="h6" color="success.main">
                          ✏️ Editing: {selectedPage.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedPage.blocks.length} content block(s) • {selectedPage.isActive ? 'Published' : 'Draft'}
                        </Typography>
                        <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
                          💡 Click on any content block below to edit it, or add new blocks
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          startIcon={<SettingsIcon />}
                          onClick={() => handleEditPage(selectedPage)}
                          disabled={selectedPage?.isSystem}
                        >
                          Edit Page
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setAddBlockDialogOpen(true)}
                          color="success"
                        >
                          Add Block
                        </Button>
                      </Box>
                    </Box>
                    <Divider />
                  </Paper>

                  {/* Content Blocks List */}
                  <Box>
                    {selectedPage.blocks.length === 0 ? (
                      <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No content blocks yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Add your first content block to start building this page
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setAddBlockDialogOpen(true)}
                        >
                          Add Your First Block
                        </Button>
                      </Paper>
                    ) : (
                      selectedPage.blocks
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((block) => (
                          <ContentBlockEditor
                            key={block.id}
                            block={block}
                            onSave={handleSaveBlock}
                            onDelete={() => handleDeleteBlock(block.id)}
                            onPostCreateImageUpload={handlePostCreateImageUpload}
                            isEditing={editingBlockId === block.id}
                            setIsEditing={(editing) => {
                              if (editing) {
                                setEditingBlockId(block.id);
                              } else {
                                setEditingBlockId(null);
                              }
                            }}
                          />
                        ))
                    )}
                  </Box>

                  {/* Add Block FAB (Floating Action Button) */}
                  {selectedPage.blocks.length > 0 && (
                    <Fab
                      color="primary"
                      sx={{ 
                        position: 'fixed', 
                        bottom: 16, 
                        right: 16,
                        zIndex: 1000
                      }}
                      onClick={() => setAddBlockDialogOpen(true)}
                    >
                      <AddIcon />
                    </Fab>
                  )}
                </Box>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <PagesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Select a page to start editing
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose a page from the sidebar to edit its content blocks
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Branding Tab - Website Branding, Theme Colors, Typography */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Website Branding</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website Name"
                value={websiteData.settings.websiteName || ''}
                onChange={(e) => handleSettingsChange('websiteName', e.target.value)}
                helperText="The name displayed in the header and browser tab"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tagline"
                value={websiteData.settings.tagline || ''}
                onChange={(e) => handleSettingsChange('tagline', e.target.value)}
                helperText="Short description of your website"
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
                  {websiteData.settings.logoUrl && (
                    <Box
                      component="img"
                      src={websiteData.settings.logoUrl}
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
                value={websiteData.settings.primaryColor || '#1976d2'}
                onChange={(e) => handleSettingsChange('primaryColor', e.target.value)}
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
                value={websiteData.settings.secondaryColor || '#dc004e'}
                onChange={(e) => handleSettingsChange('secondaryColor', e.target.value)}
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
                value={websiteData.settings.accentColor || '#333333'}
                onChange={(e) => handleSettingsChange('accentColor', e.target.value)}
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
                  value={websiteData.settings.fontPrimary || 'Roboto, sans-serif'}
                  onChange={(e) => handleSettingsChange('fontPrimary', e.target.value)}
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
                  value={websiteData.settings.fontSecondary || 'Playfair Display, serif'}
                  onChange={(e) => handleSettingsChange('fontSecondary', e.target.value)}
                  label="Secondary Font"
                >
                  <MenuItem value="Playfair Display, serif">Playfair Display</MenuItem>
                  <MenuItem value="Georgia, serif">Georgia</MenuItem>
                  <MenuItem value="Merriweather, serif">Merriweather</MenuItem>
                  <MenuItem value="Roboto, sans-serif">Roboto</MenuItem>
                  <MenuItem value="Open Sans, sans-serif">Open Sans</MenuItem>
                  <MenuItem value="Lato, sans-serif">Lato</MenuItem>
                  <MenuItem value="Montserrat, sans-serif">Montserrat</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: websiteData.settings.fontPrimary || 'Roboto, sans-serif',
                      color: websiteData.settings.primaryColor || '#1976d2',
                      mb: 1
                    }}
                  >
                    {websiteData.settings.websiteName || 'Website Name'}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: websiteData.settings.fontSecondary || 'Playfair Display, serif',
                      color: websiteData.settings.accentColor || '#333333',
                      mb: 2
                    }}
                  >
                    {websiteData.settings.tagline || 'Your tagline here'}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: websiteData.settings.primaryColor || '#1976d2',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: websiteData.settings.secondaryColor || '#dc004e'
                      }
                    }}
                  >
                    Sample Button
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* SEO Tab - Social Media, Footer, SEO Settings */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Social Media</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Facebook URL"
                value={websiteData.settings.facebookUrl || ''}
                onChange={(e) => handleSettingsChange('facebookUrl', e.target.value)}
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
                value={websiteData.settings.instagramUrl || ''}
                onChange={(e) => handleSettingsChange('instagramUrl', e.target.value)}
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
                value={websiteData.settings.twitterUrl || ''}
                onChange={(e) => handleSettingsChange('twitterUrl', e.target.value)}
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
                value={websiteData.settings.footerText || ''}
                onChange={(e) => handleSettingsChange('footerText', e.target.value)}
                helperText="Use {year} to automatically insert the current year"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>SEO Settings</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Title"
                value={websiteData.settings.metaTitle || ''}
                onChange={(e) => handleSettingsChange('metaTitle', e.target.value)}
                helperText="Title that appears in search results"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Meta Description"
                value={websiteData.settings.metaDescription || ''}
                onChange={(e) => handleSettingsChange('metaDescription', e.target.value)}
                helperText="Description that appears in search results (150-160 characters recommended)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Keywords"
                value={websiteData.settings.metaKeywords || ''}
                onChange={(e) => handleSettingsChange('metaKeywords', e.target.value)}
                helperText="Comma-separated keywords for search engines"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Save Button */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSaveSettings}
          disabled={saving || !hasChanges}
          startIcon={<Save />}
        >
          {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
        </Button>
      </Box>

      {/* Page Creation Dialog */}
      <Dialog open={pageDialogOpen} onClose={() => setPageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Page</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Page Name"
                value={newPageData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  setNewPageData(prev => ({ ...prev, name, slug }));
                }}
                placeholder="e.g., Services, Events, Catering"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL Slug"
                value={newPageData.slug}
                onChange={(e) => setNewPageData(prev => ({ ...prev, slug: e.target.value }))}
                helperText="URL path for this page (auto-generated from name)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={newPageData.template || 'default'}
                  onChange={(e) => setNewPageData(prev => ({ ...prev, template: e.target.value }))}
                  label="Template"
                >
                  <MenuItem value="default">Default Page</MenuItem>
                  <MenuItem value="services">Services Page</MenuItem>
                  <MenuItem value="events">Events Page</MenuItem>
                  <MenuItem value="gallery">Photo Gallery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPageDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreatePage} 
            variant="contained"
            disabled={!newPageData.name.trim() || !newPageData.slug.trim()}
          >
            Create Page
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={editPageDialogOpen} onClose={() => setEditPageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Page Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Page Name"
                value={editPageData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  setEditPageData(prev => ({ ...prev, name, slug }));
                }}
                placeholder="e.g., Services, Events, Catering"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL Slug"
                value={editPageData.slug}
                onChange={(e) => setEditPageData(prev => ({ ...prev, slug: e.target.value }))}
                helperText="URL path for this page (auto-generated from name)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Title"
                value={editPageData.metaTitle || ''}
                onChange={(e) => setEditPageData(prev => ({ ...prev, metaTitle: e.target.value }))}
                helperText="Title for search engines (optional)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Meta Description"
                value={editPageData.metaDescription || ''}
                onChange={(e) => setEditPageData(prev => ({ ...prev, metaDescription: e.target.value }))}
                helperText="Description for search engines (optional)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={editPageData.template || 'default'}
                  onChange={(e) => setEditPageData(prev => ({ ...prev, template: e.target.value }))}
                  label="Template"
                >
                  <MenuItem value="default">Default Page</MenuItem>
                  <MenuItem value="services">Services Page</MenuItem>
                  <MenuItem value="events">Events Page</MenuItem>
                  <MenuItem value="gallery">Photo Gallery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPageDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdatePage} 
            variant="contained"
            disabled={!editPageData.name.trim() || !editPageData.slug.trim()}
          >
            Update Page
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Block Dialog */}
      <Dialog open={addBlockDialogOpen} onClose={() => setAddBlockDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Content Block</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Block Type</InputLabel>
                <Select
                  value={newBlockData.blockType}
                  onChange={(e) => setNewBlockData(prev => ({ ...prev, blockType: e.target.value }))}
                  label="Block Type"
                >
                  <MenuItem value="text">Text Block</MenuItem>
                  <MenuItem value="hero">Hero Section</MenuItem>
                  <MenuItem value="image">Image Block</MenuItem>
                  <MenuItem value="button">Button/CTA</MenuItem>
                  <MenuItem value="gallery">Image Gallery</MenuItem>
                  <MenuItem value="contact">Contact Info</MenuItem>
                  <MenuItem value="features">Features Grid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Block Title"
                value={newBlockData.title}
                onChange={(e) => setNewBlockData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Welcome Message, Our Services, Contact Us"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Initial Content"
                value={newBlockData.content}
                onChange={(e) => setNewBlockData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Add some initial content for this block..."
                helperText="You can edit this content further after creating the block"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBlockDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddBlock} 
            variant="contained"
            disabled={!newBlockData.blockType || !newBlockData.title?.trim()}
          >
            Add Block
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Selector */}
      <TemplateSelector
        open={templateSelectorOpen}
        onClose={() => setTemplateSelectorOpen(false)}
        onTemplateApplied={() => {
          fetchWebsiteData();
          setTemplateSelectorOpen(false);
        }}
      />
    </Container>
  );
};

export default WebsiteBuilderPage; 