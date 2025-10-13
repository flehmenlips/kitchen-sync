import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  MoreVert as MoreIcon,
  Preview as PreviewIcon,
  Pages as PagesIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useSnackbar } from '../context/SnackbarContext';
import { useRestaurant } from '../context/RestaurantContext';
import { buildRestaurantUrl } from '../utils/subdomain';
import { 
  contentBlockService, 
  ContentBlock, 
  BLOCK_TYPES, 
  BLOCK_TYPE_LABELS 
} from '../services/contentBlockService';
import { 
  pageService,
  Page,
  PAGE_TEMPLATE_LABELS
} from '../services/pageService';
import PageManagementDialog from '../components/PageManagementDialog';
import { 
  DndContext, 
  DragEndEvent, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Pages available for content blocks
const PAGES = ['home', 'about', 'menu', 'contact'];

interface BlockFormData {
  pageId: number;
  blockType: string;
  title: string;
  subtitle: string;
  content: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle: string;
  videoUrl: string;
  isActive: boolean;
}

const SortableBlockCard: React.FC<{ block: ContentBlock; onEdit: () => void; onDelete: () => void; onDuplicate: () => void; onToggleActive: () => void }> = ({ 
  block, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onToggleActive 
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      sx={{ 
        mb: 2, 
        opacity: block.isActive ? 1 : 0.6,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          background: 'rgba(255,255,255,0.8)'
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start">
          <IconButton 
            {...attributes} 
            {...listeners} 
            sx={{ 
              cursor: 'grab', 
              mr: 1,
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              '&:hover': {
                background: 'rgba(59, 130, 246, 0.2)'
              }
            }}
          >
            <DragIcon sx={{ color: '#3b82f6' }} />
          </IconButton>
          
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" mb={2}>
              <Chip 
                label={BLOCK_TYPE_LABELS[block.blockType as keyof typeof BLOCK_TYPE_LABELS] || block.blockType} 
                size="small" 
                sx={{ 
                  mr: 1,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Chip 
                label={block.page?.name || `Page ${block.pageId}`} 
                size="small" 
                variant="outlined"
                sx={{ 
                  mr: 1,
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#3b82f6',
                  background: 'rgba(59, 130, 246, 0.05)'
                }}
              />
              {!block.isActive && (
                <Chip 
                  label="Inactive" 
                  size="small" 
                  sx={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                />
              )}
            </Box>
            
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700
              }}
            >
              {block.title || 'Untitled Block'}
            </Typography>
            
            {block.subtitle && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {block.subtitle}
              </Typography>
            )}
            
            {block.imageUrl && (
              <Box mt={1} mb={1}>
                <img 
                  src={block.imageUrl} 
                  alt={block.title || 'Block image'} 
                  style={{ 
                    maxHeight: 100, 
                    maxWidth: '100%', 
                    objectFit: 'cover',
                    borderRadius: 4
                  }} 
                />
              </Box>
            )}
          </Box>
          
          <Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { onEdit(); handleMenuClose(); }}>
                <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onDuplicate(); handleMenuClose(); }}>
                <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Duplicate</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onToggleActive(); handleMenuClose(); }}>
                <ListItemIcon>
                  {block.isActive ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText>{block.isActive ? 'Deactivate' : 'Activate'}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onDelete(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ContentBlocksPage: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { currentRestaurant } = useRestaurant();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState<number | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BlockFormData>({
    pageId: 1,
    blockType: BLOCK_TYPES.TEXT,
    title: '',
    subtitle: '',
    content: '',
    buttonText: '',
    buttonLink: '',
    buttonStyle: 'primary',
    videoUrl: '',
    isActive: true
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blocksData, pagesData] = await Promise.all([
        contentBlockService.getAllBlocks(),
        pageService.getPages()
      ]);
      setBlocks(blocksData);
      setPages(pagesData.pages);
      
      // Set default page if we don't have one selected
      if (selectedPageId === 'all' && pagesData.pages.length > 0) {
        setSelectedPageId(pagesData.pages[0].id);
        setFormData(prev => ({ ...prev, pageId: pagesData.pages[0].id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (editingBlock) {
        await contentBlockService.updateBlock(editingBlock.id, formData);
        showSnackbar('Block updated successfully', 'success');
      } else {
        await contentBlockService.createBlock(formData);
        showSnackbar('Block created successfully', 'success');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving block:', error);
      showSnackbar('Failed to save block', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this block?')) return;
    
    try {
      await contentBlockService.deleteBlock(id);
      showSnackbar('Block deleted successfully', 'success');
      fetchData();
    } catch (error) {
      console.error('Error deleting block:', error);
      showSnackbar('Failed to delete block', 'error');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await contentBlockService.duplicateBlock(id);
      showSnackbar('Block duplicated successfully', 'success');
      fetchData();
    } catch (error) {
      console.error('Error duplicating block:', error);
      showSnackbar('Failed to duplicate block', 'error');
    }
  };

  const handleToggleActive = async (block: ContentBlock) => {
    try {
      await contentBlockService.updateBlock(block.id, { isActive: !block.isActive });
      showSnackbar(`Block ${block.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
      fetchData();
    } catch (error) {
      console.error('Error toggling block status:', error);
      showSnackbar('Failed to update block status', 'error');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = [...blocks];
        const [movedBlock] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, movedBlock);

        // Update display orders
        const updates = newBlocks.map((block, index) => ({
          id: block.id,
          displayOrder: index * 10
        }));

        try {
          await contentBlockService.reorderBlocks(updates);
          setBlocks(newBlocks);
          showSnackbar('Blocks reordered successfully', 'success');
        } catch (error) {
          console.error('Error reordering blocks:', error);
          showSnackbar('Failed to reorder blocks', 'error');
          fetchData(); // Refresh to get correct order
        }
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!uploadingBlockId) return;

    try {
      const result = await contentBlockService.uploadImage(uploadingBlockId, file);
      showSnackbar('Image uploaded successfully', 'success');
      setUploadDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error uploading image:', error);
      showSnackbar('Failed to upload image', 'error');
    }
  };

  const openEditDialog = (block: ContentBlock) => {
    setEditingBlock(block);
    setFormData({
      pageId: block.pageId,
      blockType: block.blockType,
      title: block.title || '',
      subtitle: block.subtitle || '',
      content: block.content || '',
      buttonText: block.buttonText || '',
      buttonLink: block.buttonLink || '',
      buttonStyle: block.buttonStyle || 'primary',
      videoUrl: block.videoUrl || '',
      isActive: block.isActive
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingBlock(null);
    const currentPageId = selectedPageId === 'all' ? (pages[0]?.id || 1) : selectedPageId as number;
    setFormData({
      pageId: currentPageId,
      blockType: BLOCK_TYPES.TEXT,
      title: '',
      subtitle: '',
      content: '',
      buttonText: '',
      buttonLink: '',
      buttonStyle: 'primary',
      videoUrl: '',
      isActive: true
    });
    setDialogOpen(true);
  };

  const openCreatePageDialog = () => {
    setEditingPage(null);
    setPageDialogOpen(true);
  };

  const openEditPageDialog = (page: Page) => {
    setEditingPage(page);
    setPageDialogOpen(true);
  };

  const handlePageSave = (savedPage: Page) => {
    fetchData(); // Refresh all data
  };

  const handleDeletePage = async (page: Page) => {
    if (page.isSystem) {
      showSnackbar('Cannot delete system pages', 'error');
      return;
    }

    if (page._count?.contentBlocks && page._count.contentBlocks > 0) {
      showSnackbar(`Cannot delete page with ${page._count.contentBlocks} content blocks`, 'error');
      return;
    }

    try {
      await pageService.deletePage(page.id);
      showSnackbar('Page deleted successfully', 'success');
      fetchData();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error || 'Failed to delete page', 'error');
    }
  };

  const filteredBlocks = blocks.filter(block => 
    selectedPageId === 'all' || block.pageId === selectedPageId
  );

  const getPageName = (pageId: number) => {
    const page = pages.find(p => p.id === pageId);
    return page?.name || 'Unknown Page';
  };

  if (loading) {
    return (
      <Box sx={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Paper sx={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '20px',
          p: 4,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Loading content blocks...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Hero Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              mr: 3
            }}>
              <SettingsIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                fontWeight="800"
                sx={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 0.5
                }}
              >
                Content & Page Management
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                Manage your website content blocks and pages
              </Typography>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }} sx={{ ml: 15 }}>
            <Button
              startIcon={<PreviewIcon />}
              href={buildRestaurantUrl(currentRestaurant?.slug || 'restaurant')}
              target="_blank"
              variant="outlined"
              sx={{
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#3b82f6',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(20px)',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '2px solid rgba(59, 130, 246, 0.5)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Preview Site
            </Button>
            <Button
              variant="outlined"
              startIcon={<PagesIcon />}
              onClick={openCreatePageDialog}
              sx={{
                border: '2px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '16px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#8b5cf6',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(20px)',
                '&:hover': {
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '2px solid rgba(139, 92, 246, 0.5)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add Page
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '16px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add Block
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 15, fontSize: '1rem' }}>
          Manage pages and their content blocks for your customer-facing website
        </Typography>

        {/* Main Content Container */}
        <Paper sx={{ 
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          mb: 3
        }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.1)'
          }}>
            <Tabs 
              value={selectedPageId} 
              onChange={(e, v) => setSelectedPageId(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: '12px 12px 0 0',
                  mx: 0.5,
                  minHeight: 56,
                  '&.Mui-selected': {
                    background: 'rgba(255,255,255,0.8)',
                    color: '#1e40af'
                  },
                  '&:hover': {
                    background: 'rgba(255,255,255,0.5)'
                  }
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  height: '3px',
                  borderRadius: '2px'
                }
              }}
            >
          <Tab label="All Pages" value="all" />
          {pages.map(page => (
            <Tab 
              key={page.id} 
              label={
                <Box display="flex" alignItems="center">
                  {page.name}
                  {page._count?.contentBlocks && page._count.contentBlocks > 0 && (
                    <Badge 
                      badgeContent={page._count.contentBlocks} 
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                  {page.isSystem && (
                    <Chip 
                      label="System" 
                      size="small" 
                      variant="outlined" 
                      sx={{ ml: 1, fontSize: '0.7rem', height: 20 }} 
                    />
                  )}
                  {!page.isActive && (
                    <Chip 
                      label="Inactive" 
                      size="small" 
                      color="warning" 
                      sx={{ ml: 1, fontSize: '0.7rem', height: 20 }} 
                    />
                  )}
                </Box>
              } 
              value={page.id}
            />
          ))}
        </Tabs>
          </Box>
        </Paper>

      {/* Page Management Section */}
      {selectedPageId !== 'all' && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                {pages.find(p => p.id === selectedPageId)?.name} Page
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Template: {PAGE_TEMPLATE_LABELS[pages.find(p => p.id === selectedPageId)?.template as keyof typeof PAGE_TEMPLATE_LABELS] || 'Unknown'}
                {' • '}
                URL: /{pages.find(p => p.id === selectedPageId)?.slug}
              </Typography>
            </Box>
            <Box>
              <IconButton 
                onClick={() => {
                  const page = pages.find(p => p.id === selectedPageId);
                  if (page) openEditPageDialog(page);
                }}
                title="Edit Page Settings"
              >
                <SettingsIcon />
              </IconButton>
              {!pages.find(p => p.id === selectedPageId)?.isSystem && (
                <IconButton 
                  color="error"
                  onClick={() => {
                    const page = pages.find(p => p.id === selectedPageId);
                    if (page) handleDeletePage(page);
                  }}
                  title="Delete Page"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {filteredBlocks.length === 0 ? (
        <Alert severity="info">
          No content blocks found{selectedPageId !== 'all' && ` for selected page`}. 
          Click "Add Block" to create one.
        </Alert>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {filteredBlocks.map(block => (
              <SortableBlockCard
                key={block.id}
                block={block}
                onEdit={() => openEditDialog(block)}
                onDelete={() => handleDelete(block.id)}
                onDuplicate={() => handleDuplicate(block.id)}
                onToggleActive={() => handleToggleActive(block)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBlock ? 'Edit Content Block' : 'Create Content Block'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Page</InputLabel>
                <Select
                  value={formData.pageId}
                  onChange={(e) => setFormData({ ...formData, pageId: Number(e.target.value) })}
                  label="Page"
                >
                  {pages.map(page => (
                    <MenuItem key={page.id} value={page.id}>
                      {page.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Block Type</InputLabel>
                <Select
                  value={formData.blockType}
                  onChange={(e) => setFormData({ ...formData, blockType: e.target.value })}
                  label="Block Type"
                >
                  {Object.entries(BLOCK_TYPE_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </Grid>
            {(formData.blockType === BLOCK_TYPES.TEXT || formData.blockType === BLOCK_TYPES.HTML) && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={formData.blockType === BLOCK_TYPES.HTML ? "HTML Content" : "Content"}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </Grid>
            )}
            {formData.blockType === BLOCK_TYPES.VIDEO && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Video URL"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  helperText="YouTube or Vimeo URL"
                />
              </Grid>
            )}
            {(formData.blockType === BLOCK_TYPES.CTA || formData.blockType === BLOCK_TYPES.HERO) && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Button Text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Button Link"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            {editingBlock && (formData.blockType === BLOCK_TYPES.IMAGE || formData.blockType === BLOCK_TYPES.HERO) && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => {
                    setUploadingBlockId(editingBlock.id);
                    setUploadDialogOpen(true);
                    setDialogOpen(false);
                  }}
                >
                  Upload Image
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateOrUpdate} variant="contained">
            {editingBlock ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Page Management Dialog */}
      <PageManagementDialog
        open={pageDialogOpen}
        onClose={() => setPageDialogOpen(false)}
        page={editingPage}
        onSave={handlePageSave}
      />
      </Container>
    </Box>
  );
};

export default ContentBlocksPage; 