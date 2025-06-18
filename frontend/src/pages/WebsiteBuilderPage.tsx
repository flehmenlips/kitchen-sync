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
  Switch,
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
  Fab,
  FormHelperText,
  Tooltip
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
  DragIndicator as DragIcon,
  Menu as MenuIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DragHandle as DragHandleIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
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
import VisualBlockPalette from '../components/VisualBlockPalette';
import VisualCanvas from '../components/VisualCanvas';
import { useSnackbar } from '../context/SnackbarContext';
import { useRestaurant } from '../context/RestaurantContext';
import { buildRestaurantUrl } from '../utils/subdomain';
import { SubdomainInfo } from '../components/SubdomainInfo';
import TemplateSelector from '../components/TemplateSelector';
import AdvancedColorPalette from '../components/AdvancedColorPalette';

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
  const [tabValue, setTabValue] = useState(0); // 0: Settings, 1: Pages, 2: Visual Editor, 3: Branding, 4: SEO, 5: Navigation
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
  const [addNavItemDialogOpen, setAddNavItemDialogOpen] = useState(false);
  const [editNavItemDialogOpen, setEditNavItemDialogOpen] = useState(false);
  const [newNavItemData, setNewNavItemData] = useState({
    label: '',
    path: '',
    icon: '',
    isActive: true
  });
  const [editNavItemData, setEditNavItemData] = useState({
    id: '',
    label: '',
    path: '',
    icon: '',
    isActive: true
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
      
      // Synchronize pages and navigation items
      const currentNavItems = data.settings.navigationItems || [];
      const pagesBySlug = new Set(data.pages.map(page => page.slug));
      
      // Remove navigation items for pages that no longer exist
      const validNavItems = currentNavItems.filter(item => {
        if (item.isSystem) return true; // Keep system navigation items
        const slug = item.path.replace(/^\/+/, ''); // Remove leading slashes
        return pagesBySlug.has(slug) || !item.path.startsWith('/'); // Keep external links
      });
      
      // Check if any navigation items were removed
      if (validNavItems.length !== currentNavItems.length) {
        console.log('Cleaning up orphaned navigation items');
        await websiteBuilderService.updateSettings({
          navigationItems: validNavItems
        });
        data.settings.navigationItems = validNavItems;
      }
      
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

  // Helper functions to get hero/about data from ContentBlocks
  const getHeroBlockData = () => {
    const homePage = websiteData?.pages.find(page => page.slug === 'home');
    const heroBlock = homePage?.blocks.find(block => block.blockType === 'hero');
    return heroBlock ? {
      heroTitle: heroBlock.title || '',
      heroSubtitle: heroBlock.subtitle || '',
      heroImageUrl: heroBlock.imageUrl || '',
      heroImagePublicId: heroBlock.imagePublicId || '',
      heroCTAText: heroBlock.buttonText || '',
      heroCTALink: heroBlock.buttonLink || ''
    } : {};
  };

  const getAboutBlockData = () => {
    const homePage = websiteData?.pages.find(page => page.slug === 'home');
    const aboutBlock = homePage?.blocks.find(block => block.blockType === 'about');
    return aboutBlock ? {
      aboutTitle: aboutBlock.title || '',
      aboutDescription: aboutBlock.content || '',
      aboutImageUrl: aboutBlock.imageUrl || '',
      aboutImagePublicId: aboutBlock.imagePublicId || ''
    } : {};
  };

  const updateContentBlock = async (blockType: 'hero' | 'about', field: string, value: any) => {
    try {
      const homePage = websiteData?.pages.find(page => page.slug === 'home');
      const block = homePage?.blocks.find(block => block.blockType === blockType);
      
      if (!block) {
        console.error(`${blockType} block not found`);
        return;
      }

      // Map settings field names to ContentBlock field names
      const fieldMap: { [key: string]: string } = {
        heroTitle: 'title',
        heroSubtitle: 'subtitle', 
        heroImageUrl: 'imageUrl',
        heroImagePublicId: 'imagePublicId',
        heroCTAText: 'buttonText',
        heroCTALink: 'buttonLink',
        aboutTitle: 'title',
        aboutDescription: 'content',
        aboutImageUrl: 'imageUrl',
        aboutImagePublicId: 'imagePublicId'
      };

      const blockField = fieldMap[field] || field;
      
      // Update the content block
      const updatedBlockData = {
        ...block,
        [blockField]: value
      };

      await handleSaveBlock(updatedBlockData);
      
      // Refresh data to reflect changes
      await fetchWebsiteData();
      
    } catch (error) {
      console.error(`Error updating ${blockType} block:`, error);
      showSnackbar(`Failed to update ${blockType} content`, 'error');
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
      
      // Create a navigation item for the new page (if not a system page)
      const currentNavItems = websiteData?.settings.navigationItems || [];
      const newNavItem = {
        id: `nav-page-${newPage.id}`,
        label: newPage.name,
        path: `/${newPage.slug}`,
        icon: '',
        isActive: true,
        displayOrder: currentNavItems.length + 1,
        isSystem: false
      };
      
      const updatedNavItems = [...currentNavItems, newNavItem];
      
      // Auto-save the navigation items to database immediately
      await websiteBuilderService.updateSettings({
        navigationItems: updatedNavItems
      });
      
      // Update the local state
      setWebsiteData(prev => {
        if (!prev) return null;
        
        // Add the new page
        const updatedPages = [...prev.pages, newPage].sort((a, b) => a.displayOrder - b.displayOrder);
        
        return {
          ...prev,
          pages: updatedPages,
          settings: {
            ...prev.settings,
            navigationItems: updatedNavItems
          }
        };
      });
      
      setSelectedPage(newPage);
      setPageDialogOpen(false);
      setNewPageData({ name: '', slug: '', template: 'default' });
      showSnackbar('Page and navigation item created successfully', 'success');
    } catch (error) {
      console.error('Error creating page:', error);
      showSnackbar('Failed to create page', 'error');
    }
  };

  const handleDeletePage = async (pageSlug: string) => {
    try {
      await websiteBuilderService.deletePage(pageSlug);
      
      // Find and remove the corresponding navigation item
      const currentNavItems = websiteData?.settings.navigationItems || [];
      const updatedNavItems = currentNavItems.filter(item => 
        item.path !== `/${pageSlug}` && !item.path.endsWith(`/${pageSlug}`)
      );
      
      // Auto-save the updated navigation items if any were removed
      if (updatedNavItems.length !== currentNavItems.length) {
        await websiteBuilderService.updateSettings({
          navigationItems: updatedNavItems
        });
      }
      
      setWebsiteData(prev => {
        if (!prev) return null;
        const updatedPages = prev.pages.filter(p => p.slug !== pageSlug);
        return { 
          ...prev, 
          pages: updatedPages,
          settings: {
            ...prev.settings,
            navigationItems: updatedNavItems
          }
        };
      });
      
      // If deleted page was selected, select first remaining page
      if (selectedPage?.slug === pageSlug && websiteData) {
        const remainingPages = websiteData.pages.filter(p => p.slug !== pageSlug);
        setSelectedPage(remainingPages.length > 0 ? remainingPages[0] : null);
      }
      
      showSnackbar('Page and navigation item deleted successfully', 'success');
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
      
      // Only reset editingBlockId if we were in explicit edit mode (manual save)
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

  // Separate handler for auto-save that never closes the editor
  const handleAutoSaveBlock = async (blockData: Partial<WBBlock>) => {
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

      // Auto-save: Never close the editor, no notifications
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Silently fail auto-save to not interrupt user experience
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
      // For hero and about images, use ContentBlocks; for cover and logo, use settings
      if (field === 'hero' || field === 'about') {
        const homePage = websiteData?.pages.find(page => page.slug === 'home');
        const block = homePage?.blocks.find(block => block.blockType === field);
        
        if (!block) {
          showSnackbar(`${field} block not found`, 'error');
          return;
        }

        // Upload image to the content block
        const uploadResult = await handlePostCreateImageUpload(block.id, file);
        
        showSnackbar('Image uploaded successfully', 'success');
      } else {
        // Handle cover and logo uploads for settings
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
      }
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

  const handleNavigationItemToggle = async (itemId: string) => {
    try {
      if (!websiteData || !websiteData.settings.navigationItems) return;
      
      const updatedItems = websiteData.settings.navigationItems.map(item => 
        item.id === itemId ? { ...item, isActive: !item.isActive } : item
      );
      
      handleSettingsChange('navigationItems', updatedItems);
      showSnackbar('Navigation item visibility toggled successfully', 'success');
    } catch (error) {
      console.error('Error toggling navigation item visibility:', error);
      showSnackbar('Failed to toggle navigation item visibility', 'error');
    }
  };

  const handleEditNavigationItem = (item: any) => {
    setEditNavItemData({
      id: item.id,
      label: item.label,
      path: item.path,
      icon: item.icon || '',
      isActive: item.isActive
    });
    setEditNavItemDialogOpen(true);
  };

  const handleAddNavItemDialogOpen = () => {
    setNewNavItemData({
      label: '',
      path: '',
      icon: '',
      isActive: true
    });
    setAddNavItemDialogOpen(true);
  };

  const handleCreateNavigationItem = async () => {
    try {
      if (!websiteData || !newNavItemData.label.trim() || !newNavItemData.path.trim()) return;
      
      const currentItems = websiteData.settings.navigationItems || [];
      const newItem = {
        id: `nav-${Date.now()}`,
        label: newNavItemData.label,
        path: newNavItemData.path,
        icon: newNavItemData.icon,
        isActive: newNavItemData.isActive,
        displayOrder: currentItems.length + 1,
        isSystem: false
      };
      
      const updatedItems = [...currentItems, newItem];
      handleSettingsChange('navigationItems', updatedItems);
      setAddNavItemDialogOpen(false);
      showSnackbar('Navigation item created successfully', 'success');
    } catch (error) {
      console.error('Error creating navigation item:', error);
      showSnackbar('Failed to create navigation item', 'error');
    }
  };

  const handleUpdateNavigationItem = async () => {
    try {
      if (!websiteData || !editNavItemData.id || !editNavItemData.label.trim() || !editNavItemData.path.trim()) return;
      
      const updatedItems = websiteData.settings.navigationItems?.map(item => 
        item.id === editNavItemData.id ? {
          ...item,
          label: editNavItemData.label,
          path: editNavItemData.path,
          icon: editNavItemData.icon,
          isActive: editNavItemData.isActive
        } : item
      ) || [];
      
      handleSettingsChange('navigationItems', updatedItems);
      setEditNavItemDialogOpen(false);
      showSnackbar('Navigation item updated successfully', 'success');
    } catch (error) {
      console.error('Error updating navigation item:', error);
      showSnackbar('Failed to update navigation item', 'error');
    }
  };

  const handleDeleteNavigationItem = async (itemId: string) => {
    try {
      if (!websiteData || !websiteData.settings.navigationItems) return;
      
      const updatedItems = websiteData.settings.navigationItems.filter(item => item.id !== itemId);
      handleSettingsChange('navigationItems', updatedItems);
      showSnackbar('Navigation item deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting navigation item:', error);
      showSnackbar('Failed to delete navigation item', 'error');
    }
  };

  const handleNavigationReorder = (result: DropResult) => {
    const { destination, source } = result;

    // Check if item was dropped outside the list
    if (!destination) {
      return;
    }

    // Check if item was dropped in the same position
    if (destination.index === source.index) {
      return;
    }

    if (!websiteData?.settings.navigationItems) return;

    // Get current navigation items sorted by display order
    const currentItems = [...websiteData.settings.navigationItems]
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // Remove the item from source position
    const [reorderedItem] = currentItems.splice(source.index, 1);
    
    // Insert the item at destination position
    currentItems.splice(destination.index, 0, reorderedItem);

    // Update display orders
    const updatedItems = currentItems.map((item, index) => ({
      ...item,
      displayOrder: index + 1
    }));

    // Update the state
    handleSettingsChange('navigationItems', updatedItems);
    showSnackbar('Navigation items reordered', 'success');
  };

  // Helper function to recreate missing navigation items for existing pages
  const handleSyncNavigationItems = async () => {
    if (!websiteData) return;
    
    try {
      const currentNavItems = websiteData.settings.navigationItems || [];
      const existingPaths = new Set(currentNavItems.map(item => item.path));
      
      // Find pages without navigation items
      const pagesWithoutNavItems = websiteData.pages.filter(page => 
        !existingPaths.has(`/${page.slug}`)
      );
      
      if (pagesWithoutNavItems.length === 0) {
        showSnackbar('All pages already have navigation items', 'info');
        return;
      }
      
      // Create navigation items for missing pages
      const newNavItems = pagesWithoutNavItems.map((page, index) => ({
        id: `nav-page-${page.id}`,
        label: page.name,
        path: `/${page.slug}`,
        icon: '',
        isActive: true,
        displayOrder: currentNavItems.length + index + 1,
        isSystem: false
      }));
      
      const updatedNavItems = [...currentNavItems, ...newNavItems];
      
      // Save to database
      await websiteBuilderService.updateSettings({
        navigationItems: updatedNavItems
      });
      
      // Update local state
      setWebsiteData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          settings: {
            ...prev.settings,
            navigationItems: updatedNavItems
          }
        };
      });
      
      showSnackbar(`Added ${newNavItems.length} missing navigation items`, 'success');
    } catch (error) {
      console.error('Error syncing navigation items:', error);
      showSnackbar('Failed to sync navigation items', 'error');
    }
  };

  // Visual Canvas Handlers
  const handleVisualBlockAdd = async (blockType: string, position: number) => {
    if (!selectedPage) {
      showSnackbar('Please select a page first', 'error');
      return;
    }

    try {
      setSaving(true);
      
      // Create new block data
      const newBlockData: BlockCreationData = {
        blockType: blockType,
        title: getDefaultBlockTitle(blockType),
        content: getDefaultBlockContent(blockType)
      };

      // Calculate display order based on position
      const pageBlocks = selectedPage.blocks || [];
      const sortedBlocks = [...pageBlocks].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      let displayOrder = 0;
      if (position === 0) {
        // Insert at beginning
        displayOrder = sortedBlocks.length > 0 ? (sortedBlocks[0].displayOrder || 0) - 1 : 0;
      } else if (position >= sortedBlocks.length) {
        // Insert at end
        displayOrder = sortedBlocks.length > 0 ? (sortedBlocks[sortedBlocks.length - 1].displayOrder || 0) + 1 : 0;
      } else {
        // Insert between blocks
        const prevOrder = sortedBlocks[position - 1]?.displayOrder || 0;
        const nextOrder = sortedBlocks[position]?.displayOrder || 0;
        displayOrder = (prevOrder + nextOrder) / 2;
      }

      await websiteBuilderService.createContentBlock(selectedPage.slug, newBlockData);

      await fetchWebsiteData();
      showSnackbar(`Added ${blockType} block successfully`, 'success');
    } catch (error) {
      console.error('Failed to add block:', error);
      showSnackbar('Failed to add block', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVisualBlockDuplicate = async (block: WBBlock) => {
    if (!selectedPage) return;

    try {
      setSaving(true);
      
      const duplicateData: BlockCreationData = {
        blockType: block.blockType,
        title: block.title ? `${block.title} (Copy)` : '',
        content: block.content || '',
        imageUrl: block.imageUrl,
        buttonText: block.buttonText,
        buttonLink: block.buttonLink
      };

      await websiteBuilderService.createContentBlock(selectedPage.slug, duplicateData);
      await fetchWebsiteData();
      showSnackbar('Block duplicated successfully', 'success');
    } catch (error) {
      console.error('Failed to duplicate block:', error);
      showSnackbar('Failed to duplicate block', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVisualBlockMove = async (blockId: number, direction: 'up' | 'down') => {
    if (!selectedPage) return;

    try {
      setSaving(true);
      
      const pageBlocks = selectedPage.blocks || [];
      const sortedBlocks = [...pageBlocks].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      const blockIndex = sortedBlocks.findIndex(b => b.id === blockId);
      
      if (blockIndex === -1) return;
      
      let newDisplayOrder: number;
      
      if (direction === 'up' && blockIndex > 0) {
        // Move up (swap with previous block)
        const prevBlock = sortedBlocks[blockIndex - 1];
        newDisplayOrder = prevBlock.displayOrder || 0;
        
        // Update the previous block to take current block's position
        await websiteBuilderService.updateContentBlock(selectedPage.slug, prevBlock.id, {
          displayOrder: sortedBlocks[blockIndex].displayOrder || 0
        });
      } else if (direction === 'down' && blockIndex < sortedBlocks.length - 1) {
        // Move down (swap with next block)
        const nextBlock = sortedBlocks[blockIndex + 1];
        newDisplayOrder = nextBlock.displayOrder || 0;
        
        // Update the next block to take current block's position
        await websiteBuilderService.updateContentBlock(selectedPage.slug, nextBlock.id, {
          displayOrder: sortedBlocks[blockIndex].displayOrder || 0
        });
      } else {
        return; // Can't move further
      }
      
      // Update current block's position
      await websiteBuilderService.updateContentBlock(selectedPage.slug, blockId, {
        displayOrder: newDisplayOrder
      });
      
      await fetchWebsiteData();
      showSnackbar(`Block moved ${direction} successfully`, 'success');
    } catch (error) {
      console.error('Failed to move block:', error);
      showSnackbar('Failed to move block', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for default block content
  const getDefaultBlockTitle = (blockType: string): string => {
    switch (blockType) {
      case 'hero': return 'Welcome to Our Restaurant';
      case 'features': return 'Our Features';
      case 'text': return 'Text Content';
      case 'contact': return 'Contact Information';
      case 'hours': return 'Opening Hours';
      case 'image': return 'Image';
      case 'gallery': return 'Photo Gallery';
      case 'button': return 'Click Here';
      case 'cta': return 'Special Offer';
      case 'map': return 'Find Us';
      case 'menu_preview': return 'Our Menu';
      default: return 'New Block';
    }
  };

  const getDefaultBlockContent = (blockType: string): string => {
    switch (blockType) {
      case 'hero': return 'Experience amazing food and great atmosphere at our restaurant.';
      case 'features': return 'Discover what makes us special.';
      case 'text': return 'Add your content here...';
      case 'contact': return 'Get in touch with us for reservations and inquiries.';
      case 'hours': return 'Visit us during our opening hours.';
      case 'image': return 'Upload an image to showcase your content.';
      case 'gallery': return 'A collection of beautiful photos.';
      case 'button': return 'Learn More';
      case 'cta': return 'Don\'t miss our special offers and events!';
      case 'map': return 'Visit our restaurant location.';
      case 'menu_preview': return 'Check out our delicious menu items.';
      default: return 'New content block';
    }
  };

  // Page selection handler for Visual Canvas
  const handleVisualPageSelect = (pageSlug: string) => {
    if (!websiteData) return;
    const page = websiteData.pages.find(p => p.slug === pageSlug);
    if (page) {
      setSelectedPage(page);
    }
  };

  // Visual Canvas edit handler
  const handleVisualBlockEdit = (block: WBBlock) => {
    setEditingBlockId(block.id);
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
      <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">Failed to load website data</Alert>
      </Box>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
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
          <Tab icon={<DragHandleIcon />} label="Visual Editor" />
          <Tab icon={<PaletteIcon />} label="Branding" />
          <Tab icon={<SeoIcon />} label="SEO" />
          <Tab icon={<MenuIcon />} label="Navigation" />
        </Tabs>
      </Paper>

      <Paper>
        {/* Settings Tab - Site Configuration Only */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Content Editing Guide */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <InfoIcon color="info" />
                  <Box>
                    <Typography variant="subtitle1" color="info.main" fontWeight="bold">
                      Looking to edit your homepage content? 📝
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hero sections, about content, and page text are now managed in the{' '}
                      <strong>Pages Tab</strong>. Click the "Pages" tab above to edit your homepage content blocks.
                      This Settings tab focuses on site-wide configuration like branding, SEO, and navigation.
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => setTabValue(1)}
                      startIcon={<PagesIcon />}
                    >
                      Go to Pages Tab
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} sx={{ mt: 3 }}>
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
                            onAutoSave={handleAutoSaveBlock}
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

        {/* Visual Editor Tab - Visual Content Block Editor */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 200px)' }}>
            {/* Block Palette Sidebar */}
            <VisualBlockPalette 
              onBlockDrop={(blockType, category) => {
                console.log(`Dropped ${blockType} from ${category} category`);
                // This will be handled by the VisualCanvas drop zones
              }}
            />
            
            {/* Visual Canvas */}
            <Box sx={{ flex: 1, position: 'relative' }}>
              <VisualCanvas
                pageBlocks={selectedPage?.blocks || []}
                onBlockAdd={handleVisualBlockAdd}
                onBlockEdit={handleVisualBlockEdit}
                onBlockDelete={handleDeleteBlock}
                onBlockDuplicate={handleVisualBlockDuplicate}
                onBlockMove={handleVisualBlockMove}
                selectedPageId={selectedPage?.id ? parseInt(selectedPage.id) : undefined}
                availablePages={websiteData?.pages || []}
                selectedPageSlug={selectedPage?.slug}
                onSave={async () => {
                  // Trigger a data refresh to save any pending changes
                  await fetchWebsiteData();
                  showSnackbar('Changes saved successfully', 'success');
                }}
                isLoading={saving}
                onPageSelect={handleVisualPageSelect}
                onImageUpload={handlePostCreateImageUpload}
                restaurantSlug={currentRestaurant?.slug}
                onAutoSave={handleAutoSaveBlock}
              />
              
              {/* Block Editor Overlay - appears when editing a block */}
              {editingBlockId && selectedPage && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                  }}
                >
                  <Paper
                    sx={{
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      overflow: 'auto',
                      p: 2,
                      minWidth: 600
                    }}
                  >
                    {(() => {
                      const editingBlock = selectedPage.blocks.find(b => b.id === editingBlockId);
                      return editingBlock ? (
                        <ContentBlockEditor
                          block={editingBlock}
                          onSave={handleSaveBlock}
                          onAutoSave={handleAutoSaveBlock}
                          onDelete={() => handleDeleteBlock(editingBlock.id)}
                          onPostCreateImageUpload={handlePostCreateImageUpload}
                          isEditing={true}
                          setIsEditing={(editing) => {
                            if (!editing) {
                              setEditingBlockId(null);
                            }
                          }}
                        />
                      ) : null;
                    })()}
                  </Paper>
                </Box>
              )}
            </Box>
          </Box>
        </TabPanel>

        {/* Branding Tab - Website Branding, Theme Colors, Typography */}
        <TabPanel value={tabValue} index={3}>
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

            {/* Advanced Color Palette System */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <AdvancedColorPalette
                restaurantId={currentRestaurant?.id || 0}
                currentColors={{
                  primaryColor: websiteData.settings.primaryColor,
                  secondaryColor: websiteData.settings.secondaryColor,
                  accentColor: websiteData.settings.accentColor
                }}
                onPaletteChange={(palette) => {
                  if (palette) {
                    // Update website settings with selected palette colors
                    handleSettingsChange('primaryColor', palette.primaryColor);
                    handleSettingsChange('secondaryColor', palette.secondaryColor);
                    handleSettingsChange('accentColor', palette.accentColor);
                  }
                }}
              />
            </Grid>

            {/* Basic Color Controls (kept for manual adjustments) */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Manual Color Adjustments</Typography>
              <Divider sx={{ mb: 2 }} />
              <Alert severity="info" sx={{ mb: 2 }}>
                These controls allow fine-tuning of individual colors. For comprehensive color schemes, use the Advanced Color Palettes above.
              </Alert>
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

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Info Cards Customization</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Hours Card Title"
                value={websiteData.settings.hoursCardTitle || 'Opening Hours'}
                onChange={(e) => handleSettingsChange('hoursCardTitle', e.target.value)}
                helperText="Title for the hours information card"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Location Card Title"
                value={websiteData.settings.locationCardTitle || 'Our Location'}
                onChange={(e) => handleSettingsChange('locationCardTitle', e.target.value)}
                helperText="Title for the location information card"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Card Title"
                value={websiteData.settings.contactCardTitle || 'Contact Us'}
                onChange={(e) => handleSettingsChange('contactCardTitle', e.target.value)}
                helperText="Title for the contact information card"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={websiteData.settings.infoPanesEnabled ?? true}
                    onChange={(e) => handleSettingsChange('infoPanesEnabled', e.target.checked)}
                  />
                }
                label="Show Info Cards on Homepage"
                sx={{ mt: 1 }}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Navigation Menu</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Current Navigation Items:</strong>
                  <br />• Home - Links to homepage
                  <br />• Menu - Links to restaurant menu
                  <br />• Make Reservation - Links to reservation form
                  <br />• Custom pages created in Website Builder will automatically appear in navigation
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Navigation customization features coming soon! For now, the navigation automatically includes:
                <br />• Standard restaurant pages (Home, Menu, Reservations)
                <br />• Any custom pages you create in the Pages tab
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Navigation Tab - Menu Customization */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Navigation Layout</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Navigation Layout</InputLabel>
                <Select
                  value={websiteData.settings.navigationLayout || 'topbar'}
                  onChange={(e) => handleSettingsChange('navigationLayout', e.target.value)}
                  label="Navigation Layout"
                >
                  <MenuItem value="topbar">Top Navigation Bar</MenuItem>
                  <MenuItem value="sidebar">Side Navigation (Left)</MenuItem>
                  <MenuItem value="hybrid">Hybrid (Top + Side)</MenuItem>
                </Select>
                <FormHelperText>Choose how navigation is displayed on your website</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Navigation Alignment</InputLabel>
                <Select
                  value={websiteData.settings.navigationAlignment || 'left'}
                  onChange={(e) => handleSettingsChange('navigationAlignment', e.target.value)}
                  label="Navigation Alignment"
                >
                  <MenuItem value="left">Left Aligned</MenuItem>
                  <MenuItem value="center">Center Aligned</MenuItem>
                  <MenuItem value="right">Right Aligned</MenuItem>
                  <MenuItem value="justified">Justified/Spread</MenuItem>
                </Select>
                <FormHelperText>How navigation items are positioned</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Navigation Style</InputLabel>
                <Select
                  value={websiteData.settings.navigationStyle || 'modern'}
                  onChange={(e) => handleSettingsChange('navigationStyle', e.target.value)}
                  label="Navigation Style"
                >
                  <MenuItem value="minimal">Minimal</MenuItem>
                  <MenuItem value="modern">Modern</MenuItem>
                  <MenuItem value="classic">Classic</MenuItem>
                  <MenuItem value="rounded">Rounded Buttons</MenuItem>
                </Select>
                <FormHelperText>Visual style of navigation elements</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Mobile Menu Style</InputLabel>
                <Select
                  value={websiteData.settings.mobileMenuStyle || 'hamburger'}
                  onChange={(e) => handleSettingsChange('mobileMenuStyle', e.target.value)}
                  label="Mobile Menu Style"
                >
                  <MenuItem value="hamburger">Hamburger Menu</MenuItem>
                  <MenuItem value="dots">Three Dots</MenuItem>
                  <MenuItem value="slide">Slide-in Menu</MenuItem>
                </Select>
                <FormHelperText>How navigation appears on mobile devices</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={websiteData.settings.navigationEnabled ?? true}
                    onChange={(e) => handleSettingsChange('navigationEnabled', e.target.checked)}
                  />
                }
                label="Enable Navigation Menu"
                sx={{ mt: 1 }}
              />
              <FormHelperText>Turn navigation on/off for your website</FormHelperText>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={websiteData.settings.showMobileMenu ?? true}
                    onChange={(e) => handleSettingsChange('showMobileMenu', e.target.checked)}
                  />
                }
                label="Show Mobile Menu"
                sx={{ mt: 1 }}
              />
              <FormHelperText>Display navigation menu on mobile devices</FormHelperText>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Navigation Items</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Manage Your Navigation:</strong>
                  <br />• Drag items to reorder them
                  <br />• Toggle visibility with the eye icon
                  <br />• Edit labels and paths by clicking the edit icon
                  <br />• System pages (Home, Menu, Reservations) are required and always visible
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>Navigation Items</Typography>
                
                {websiteData.settings.navigationItems && websiteData.settings.navigationItems.length > 0 ? (
                  <DragDropContext onDragEnd={handleNavigationReorder}>
                    <Droppable droppableId="navigation-items">
                      {(provided) => (
                        <Box
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {(websiteData.settings.navigationItems || [])
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'space-between',
                                      py: 2,
                                      px: 1,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      borderRadius: 1,
                                      mb: 1,
                                      bgcolor: snapshot.isDragging ? 'action.hover' : (item.isActive ? 'background.paper' : 'grey.50'),
                                      transform: snapshot.isDragging ? 'rotate(3deg)' : 'none',
                                      boxShadow: snapshot.isDragging ? 3 : 0
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      {/* Drag Handle */}
                                      <Box 
                                        {...provided.dragHandleProps}
                                        sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
                                      >
                                        <IconButton size="small">
                                          <DragHandleIcon />
                                        </IconButton>
                                      </Box>
                                      
                                      {/* Page Type Indicator */}
                                      <Chip 
                                        label={item.isSystem ? "System" : "Custom"} 
                                        size="small" 
                                        color={item.isSystem ? "primary" : "secondary"} 
                                        variant="outlined"
                                      />
                                      
                                      {/* Navigation Item Info */}
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                          {item.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {item.path}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    
                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {/* Visibility Toggle */}
                                      {!item.isSystem && (
                                        <Tooltip title={item.isActive ? "Hide from navigation" : "Show in navigation"}>
                                          <IconButton 
                                            size="small"
                                            onClick={() => handleNavigationItemToggle(item.id)}
                                            color={item.isActive ? "default" : "error"}
                                          >
                                            {item.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      
                                      {/* Edit Button */}
                                      <Tooltip title="Edit navigation item">
                                        <IconButton 
                                          size="small"
                                          onClick={() => handleEditNavigationItem(item)}
                                        >
                                          <EditIcon />
                                        </IconButton>
                                      </Tooltip>
                                      
                                      {/* Delete Button - Only for custom items */}
                                      {!item.isSystem && (
                                        <Tooltip title="Delete navigation item">
                                          <IconButton 
                                            size="small"
                                            onClick={() => handleDeleteNavigationItem(item.id)}
                                            color="error"
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      
                                      {/* Status Chip */}
                                      <Chip 
                                        label={item.isActive ? "Visible" : "Hidden"} 
                                        size="small" 
                                        color={item.isActive ? "success" : "default"}
                                        variant={item.isActive ? "filled" : "outlined"}
                                      />
                                    </Box>
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <Alert severity="warning">
                    No navigation items found. Default navigation will be used.
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* Add Custom Navigation Item Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setAddNavItemDialogOpen(true)}
                >
                  Add Custom Navigation Item
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<SyncIcon />}
                  onClick={handleSyncNavigationItems}
                >
                  Sync Missing Pages
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>Navigation Features:</strong>
                <br />• System pages (Home, Menu, Reservations) cannot be hidden or deleted
                <br />• Custom pages created in the Pages tab automatically appear here
                <br />• External links can be added as custom navigation items
                <br />• Drag items to reorder - changes save automatically
              </Typography>
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

      {/* Add Navigation Item Dialog */}
      <Dialog open={addNavItemDialogOpen} onClose={() => setAddNavItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Navigation Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Navigation Label"
                value={newNavItemData.label}
                onChange={(e) => setNewNavItemData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., About Us, Services, Contact"
                helperText="Text that will appear in the navigation menu"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link Path"
                value={newNavItemData.path}
                onChange={(e) => setNewNavItemData(prev => ({ ...prev, path: e.target.value }))}
                placeholder="e.g., /about, /services, https://external-site.com"
                helperText="URL path or full URL for external links"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Icon (Optional)</InputLabel>
                <Select
                  value={newNavItemData.icon}
                  onChange={(e) => setNewNavItemData(prev => ({ ...prev, icon: e.target.value }))}
                  label="Icon (Optional)"
                >
                  <MenuItem value="">No Icon</MenuItem>
                  <MenuItem value="home">Home</MenuItem>
                  <MenuItem value="menu_book">Menu</MenuItem>
                  <MenuItem value="event_seat">Reservations</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="contact_page">Contact</MenuItem>
                  <MenuItem value="location_on">Location</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="event">Events</MenuItem>
                </Select>
                <FormHelperText>Choose an icon to display with the navigation item</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newNavItemData.isActive}
                    onChange={(e) => setNewNavItemData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Show in Navigation"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNavItemDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateNavigationItem} 
            variant="contained"
            disabled={!newNavItemData.label.trim() || !newNavItemData.path.trim()}
          >
            Add Navigation Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Navigation Item Dialog */}
      <Dialog open={editNavItemDialogOpen} onClose={() => setEditNavItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Navigation Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Navigation Label"
                value={editNavItemData.label}
                onChange={(e) => setEditNavItemData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., About Us, Services, Contact"
                helperText="Text that will appear in the navigation menu"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link Path"
                value={editNavItemData.path}
                onChange={(e) => setEditNavItemData(prev => ({ ...prev, path: e.target.value }))}
                placeholder="e.g., /about, /services, https://external-site.com"
                helperText="URL path or full URL for external links"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Icon (Optional)</InputLabel>
                <Select
                  value={editNavItemData.icon}
                  onChange={(e) => setEditNavItemData(prev => ({ ...prev, icon: e.target.value }))}
                  label="Icon (Optional)"
                >
                  <MenuItem value="">No Icon</MenuItem>
                  <MenuItem value="home">Home</MenuItem>
                  <MenuItem value="menu_book">Menu</MenuItem>
                  <MenuItem value="event_seat">Reservations</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="contact_page">Contact</MenuItem>
                  <MenuItem value="location_on">Location</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="event">Events</MenuItem>
                </Select>
                <FormHelperText>Choose an icon to display with the navigation item</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editNavItemData.isActive}
                    onChange={(e) => setEditNavItemData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Show in Navigation"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditNavItemDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateNavigationItem} 
            variant="contained"
            disabled={!editNavItemData.label.trim() || !editNavItemData.path.trim()}
          >
            Update Navigation Item
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
    </Box>
  );
};

export default WebsiteBuilderPage; 