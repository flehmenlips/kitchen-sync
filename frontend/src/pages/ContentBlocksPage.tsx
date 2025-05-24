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
  ListItemText
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
  Preview as PreviewIcon
} from '@mui/icons-material';
import { useSnackbar } from '../context/SnackbarContext';
import { 
  contentBlockService, 
  ContentBlock, 
  BLOCK_TYPES, 
  BLOCK_TYPE_LABELS 
} from '../services/contentBlockService';
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
  page: string;
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
    <Card ref={setNodeRef} style={style} sx={{ mb: 2, opacity: block.isActive ? 1 : 0.6 }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start">
          <IconButton {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 1 }}>
            <DragIcon />
          </IconButton>
          
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" mb={1}>
              <Chip 
                label={BLOCK_TYPE_LABELS[block.blockType as keyof typeof BLOCK_TYPE_LABELS] || block.blockType} 
                size="small" 
                color="primary" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={block.page} 
                size="small" 
                variant="outlined"
                sx={{ mr: 1 }}
              />
              {!block.isActive && (
                <Chip label="Inactive" size="small" color="warning" />
              )}
            </Box>
            
            <Typography variant="h6" gutterBottom>
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
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState('home');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BlockFormData>({
    page: 'home',
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
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const data = await contentBlockService.getAllBlocks();
      setBlocks(data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      showSnackbar('Failed to load content blocks', 'error');
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
      fetchBlocks();
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
      fetchBlocks();
    } catch (error) {
      console.error('Error deleting block:', error);
      showSnackbar('Failed to delete block', 'error');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await contentBlockService.duplicateBlock(id);
      showSnackbar('Block duplicated successfully', 'success');
      fetchBlocks();
    } catch (error) {
      console.error('Error duplicating block:', error);
      showSnackbar('Failed to duplicate block', 'error');
    }
  };

  const handleToggleActive = async (block: ContentBlock) => {
    try {
      await contentBlockService.updateBlock(block.id, { isActive: !block.isActive });
      showSnackbar(`Block ${block.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
      fetchBlocks();
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
          fetchBlocks(); // Refresh to get correct order
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
      fetchBlocks();
    } catch (error) {
      console.error('Error uploading image:', error);
      showSnackbar('Failed to upload image', 'error');
    }
  };

  const openEditDialog = (block: ContentBlock) => {
    setEditingBlock(block);
    setFormData({
      page: block.page,
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
    setFormData({
      page: selectedPage,
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

  const filteredBlocks = blocks.filter(block => 
    selectedPage === 'all' || block.page === selectedPage
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Content Blocks</Typography>
          <Box>
            <Button
              startIcon={<PreviewIcon />}
              href="/customer"
              target="_blank"
              sx={{ mr: 2 }}
            >
              Preview Site
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Add Block
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage dynamic content blocks for your customer-facing website
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedPage} onChange={(e, v) => setSelectedPage(v)}>
          <Tab label="All Pages" value="all" />
          {PAGES.map(page => (
            <Tab key={page} label={page.charAt(0).toUpperCase() + page.slice(1)} value={page} />
          ))}
        </Tabs>
      </Paper>

      {filteredBlocks.length === 0 ? (
        <Alert severity="info">
          No content blocks found{selectedPage !== 'all' && ` for ${selectedPage} page`}. 
          Click "Add Block" to create one.
        </Alert>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredBlocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
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
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  label="Page"
                >
                  {PAGES.map(page => (
                    <MenuItem key={page} value={page}>
                      {page.charAt(0).toUpperCase() + page.slice(1)}
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
    </Container>
  );
};

export default ContentBlocksPage; 