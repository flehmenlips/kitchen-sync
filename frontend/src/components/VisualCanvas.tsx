import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fab,
  Tooltip,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Visibility as PreviewIcon,
  Save as SaveIcon,
  ContentCopy as DuplicateIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  Computer as DesktopIcon,
  Tablet as TabletIcon,
  PhoneIphone as MobileIcon,
  Refresh as RefreshIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  VisibilityOff as HidePreviewIcon,
  FormatColorFill as BackgroundIcon,
  BorderOuter as BorderIcon,
  Style as StyleIcon,
  Gradient as GradientIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { WBBlock } from '../services/websiteBuilderService';


// Simplified toolbar for inline rich text editing
const inlineQuillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ]
};

const inlineQuillFormats = [
  'bold', 'italic', 'underline', 'list', 'bullet', 'link'
];

// Drop zone component for empty canvas areas
interface DropZoneProps {
  onDrop: (blockType: string, position: number) => void;
  position: number;
  isActive: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onDrop, position, isActive }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const blockType = e.dataTransfer.getData('text/plain');
    if (blockType) {
      onDrop(blockType, position);
    }
  };

  return (
    <Box
      sx={{
        minHeight: isDragOver ? 120 : 60,
        border: '2px dashed',
        borderColor: isDragOver ? 'primary.main' : isActive ? 'grey.400' : 'transparent',
        bgcolor: isDragOver ? 'primary.lighter' : isActive ? 'grey.100' : 'transparent',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        mx: 1,
        my: 0.5,
        opacity: isActive ? 1 : 0.3,
        '&:hover': {
          opacity: 1,
          borderColor: 'primary.light',
          bgcolor: 'primary.lighter'
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Box textAlign="center">
        <AddIcon sx={{ fontSize: 32, color: isDragOver ? 'primary.main' : 'grey.400', mb: 1 }} />
        <Typography variant="caption" color={isDragOver ? 'primary.main' : 'text.secondary'}>
          {isDragOver ? 'Drop block here' : 'Drop zone'}
        </Typography>
      </Box>
    </Box>
  );
};

// Visual representation of a content block in the canvas
interface VisualBlockProps {
  block: WBBlock;
  onEdit: (block: WBBlock) => void;
  onDelete: (blockId: number) => void;
  onDuplicate: (block: WBBlock) => void;
  onMove: (blockId: number, direction: 'up' | 'down') => void;
  onInlineEdit?: (blockId: number, field: string, value: string) => void;
  onImageUpload?: (blockId: number, file: File) => Promise<{ imageUrl: string; publicId: string }>;
  onAutoSave: (block: WBBlock) => void;
}

const VisualBlock: React.FC<VisualBlockProps> = ({ 
  block, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onMove,
  onInlineEdit,
  onImageUpload,
  onAutoSave
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isHovering, setIsHovering] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleInlineEditStart = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
    setIsExpanded(true); // Auto-expand when editing
  };

  const handleInlineEditSave = () => {
    if (editingField && onInlineEdit && editValue.trim() !== '') {
      onInlineEdit(block.id, editingField, editValue);
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleInlineEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleInlineEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInlineEditSave();
    } else if (e.key === 'Escape') {
      handleInlineEditCancel();
    }
  };

  const handleRichTextChange = (value: string) => {
    setEditValue(value);
  };

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) return;
    
    try {
      setIsUploadingImage(true);
      const result = await onImageUpload(block.id, file);
      
      if (onInlineEdit) {
        onInlineEdit(block.id, 'imageUrl', result.imageUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile);
    }
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleImageDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const getBlockPreview = () => {
    switch (block.blockType) {
      case 'hero':
        return { title: 'Hero Section', color: '#1976d2', icon: '🎯' };
      case 'text':
        return { title: 'Text Content', color: '#388e3c', icon: '📝' };
      case 'contact':
        return { title: 'Contact Info', color: '#f57c00', icon: '📞' };
      case 'hours':
        return { title: 'Opening Hours', color: '#5d4037', icon: '🕒' };
      case 'image':
        return { title: 'Image Block', color: '#0097a7', icon: '🖼️' };
      case 'gallery':
        return { title: 'Photo Gallery', color: '#00695c', icon: '🖼️' };
      case 'button':
        return { title: 'Button', color: '#d32f2f', icon: '🔘' };
      case 'features':
        return { title: 'Features', color: '#7b1fa2', icon: '⭐' };
      default:
        return { title: 'Content Block', color: '#757575', icon: '📄' };
    }
  };

  const preview = getBlockPreview();

  return (
    <Card 
      sx={{ 
        mb: 1, 
        mx: 1,
        border: '1px solid',
        borderColor: isHovering ? 'primary.light' : 'grey.300',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1
        }
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Compact Header - Always Visible */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 1.5,
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box display="flex" alignItems="center" gap={1} flex={1}>
          <DragIcon sx={{ color: 'grey.400', fontSize: '1.2rem' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {preview.icon} {block.title || preview.title}
          </Typography>
          <Chip 
            label={block.blockType} 
            size="small" 
            sx={{ 
              bgcolor: preview.color, 
              color: 'white', 
              fontSize: '0.65rem',
              height: 20,
              '& .MuiChip-label': { px: 1 }
            }}
          />
          {block.imageUrl && (
            <Chip label="📷" size="small" color="success" variant="outlined" sx={{ height: 20 }} />
          )}
        </Box>
        
        <Box display="flex" alignItems="center" gap={0.5}>
          {/* Quick Actions - Only show on hover */}
          {isHovering && (
            <>
              <Tooltip title="Edit">
                <IconButton 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); onEdit(block); }}
                  sx={{ p: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="More actions">
                <IconButton 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); handleMenuClick(e); }}
                  sx={{ p: 0.5 }}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          {/* Expand/Collapse Icon */}
          <IconButton size="small" sx={{ p: 0.5 }}>
            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* Expandable Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ px: 1.5, pb: 1.5, borderTop: '1px solid', borderColor: 'grey.200' }}>
          {/* Inline Editing Area */}
          <Box sx={{ mt: 1 }}>
            {/* Editable Title */}
            {editingField === 'title' ? (
              <TextField
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleInlineEditKeyPress}
                onBlur={handleInlineEditSave}
                autoFocus
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Enter title..."
                sx={{ mb: 1 }}
              />
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 500,
                  cursor: onInlineEdit ? 'text' : 'default',
                  p: 0.5,
                  borderRadius: 1,
                  '&:hover': onInlineEdit ? { 
                    bgcolor: 'action.hover'
                  } : {},
                  minHeight: '1.5em'
                }}
                onClick={() => onInlineEdit && handleInlineEditStart('title', block.title || '')}
              >
                {block.title || (onInlineEdit ? 'Click to add title...' : preview.title)}
              </Typography>
            )}
            
            {/* Editable Content */}
            {editingField === 'content' ? (
              <Box>
                <ReactQuill
                  value={editValue}
                  onChange={handleRichTextChange}
                  modules={inlineQuillModules}
                  formats={inlineQuillFormats}
                  placeholder="Enter content..."
                  theme="snow"
                />
              </Box>
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  cursor: onInlineEdit ? 'text' : 'default',
                  p: 0.5,
                  borderRadius: 1,
                  '&:hover': onInlineEdit ? { 
                    bgcolor: 'action.hover'
                  } : {},
                  minHeight: '1.5em',
                  fontSize: '0.875rem'
                }}
                onClick={() => onInlineEdit && handleInlineEditStart('content', block.content || '')}
                dangerouslySetInnerHTML={{ 
                  __html: block.content || (onInlineEdit ? 'Click to add content...' : 'No content')
                }}
              />
            )}
            
            {/* Compact Image Upload/Preview */}
            {(['image', 'hero', 'gallery'].includes(block.blockType)) && (
              <Box sx={{ mt: 1 }}>
                {block.imageUrl ? (
                  <Box
                    sx={{
                      position: 'relative',
                      border: '1px solid',
                      borderColor: dragOver ? 'primary.main' : 'grey.300',
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: dragOver ? 'primary.lighter' : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onDrop={handleImageDrop}
                    onDragOver={handleImageDragOver}
                    onDragLeave={handleImageDragLeave}
                  >
                    <Box
                      component="img"
                      src={block.imageUrl}
                      alt={block.title || 'Block image'}
                      sx={{
                        width: '100%',
                        height: 100, // Much smaller preview
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    {isUploadingImage && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem'
                        }}
                      >
                        Uploading...
                      </Box>
                    )}
                    {dragOver && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        Drop to replace
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      border: '1px dashed',
                      borderColor: dragOver ? 'primary.main' : 'grey.400',
                      borderRadius: 1,
                      p: 2,
                      textAlign: 'center',
                      bgcolor: dragOver ? 'primary.lighter' : 'grey.50',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.light',
                        bgcolor: 'primary.lighter'
                      }
                    }}
                    onDrop={handleImageDrop}
                    onDragOver={handleImageDragOver}
                    onDragLeave={handleImageDragLeave}
                    onClick={() => document.getElementById(`image-upload-${block.id}`)?.click()}
                  >
                    {isUploadingImage ? (
                      <Typography variant="caption" color="primary">
                        Uploading...
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        📷 {dragOver ? 'Drop image' : 'Click to upload'}
                      </Typography>
                    )}
                    <input
                      id={`image-upload-${block.id}`}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileInputChange}
                    />
                  </Box>
                )}
              </Box>
            )}
            
            {/* Inline Edit Actions */}
            {editingField && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={handleInlineEditSave}>
                  Save
                </Button>
                <Button size="small" variant="outlined" onClick={handleInlineEditCancel}>
                  Cancel
                </Button>
              </Box>
            )}
          </Box>

          {/* NEW: Visual Design Controls */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <StyleIcon sx={{ mr: 1, fontSize: 18 }} />
              Visual Design
            </Typography>
            
            <Grid container spacing={2}>
              {/* Background Color */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    Background Color
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      size="small"
                      type="color"
                      value={block.styles?.backgroundColor || '#ffffff'}
                      onChange={(e) => {
                        const updatedBlock = {
                          ...block,
                          styles: {
                            ...block.styles,
                            backgroundColor: e.target.value
                          }
                        };
                        onAutoSave(updatedBlock);
                      }}
                      sx={{ width: 60 }}
                    />
                    <TextField
                      size="small"
                      value={block.styles?.backgroundColor || '#ffffff'}
                      onChange={(e) => {
                        const updatedBlock = {
                          ...block,
                          styles: {
                            ...block.styles,
                            backgroundColor: e.target.value
                          }
                        };
                        onAutoSave(updatedBlock);
                      }}
                      placeholder="#ffffff"
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Border Controls */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" display="block" gutterBottom>
                  Border
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    label="Width"
                    type="number"
                    value={parseInt(block.styles?.borderWidth || '0')}
                    onChange={(e) => {
                      const updatedBlock = {
                        ...block,
                        styles: {
                          ...block.styles,
                          borderWidth: `${e.target.value}px`
                        }
                      };
                      onAutoSave(updatedBlock);
                    }}
                    inputProps={{ min: 0, max: 10 }}
                    sx={{ width: 80 }}
                  />
                  <FormControl size="small" sx={{ width: 100 }}>
                    <InputLabel>Style</InputLabel>
                    <Select
                      value={block.styles?.borderStyle || 'solid'}
                      onChange={(e) => {
                        const updatedBlock = {
                          ...block,
                          styles: {
                            ...block.styles,
                            borderStyle: e.target.value
                          }
                        };
                        onAutoSave(updatedBlock);
                      }}
                      label="Style"
                    >
                      <MenuItem value="solid">Solid</MenuItem>
                      <MenuItem value="dashed">Dashed</MenuItem>
                      <MenuItem value="dotted">Dotted</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  size="small"
                  type="color"
                  value={block.styles?.borderColor || '#000000'}
                  onChange={(e) => {
                    const updatedBlock = {
                      ...block,
                      styles: {
                        ...block.styles,
                        borderColor: e.target.value
                      }
                    };
                    onAutoSave(updatedBlock);
                  }}
                  sx={{ width: 60 }}
                />
              </Grid>

              {/* Shadow Controls */}
              <Grid item xs={12}>
                <Typography variant="caption" display="block" gutterBottom>
                  Shadow
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Preset</InputLabel>
                    <Select
                      value={block.styles?.boxShadow || 'none'}
                      onChange={(e) => {
                        const updatedBlock = {
                          ...block,
                          styles: {
                            ...block.styles,
                            boxShadow: e.target.value
                          }
                        };
                        onAutoSave(updatedBlock);
                      }}
                      label="Preset"
                    >
                      <MenuItem value="none">None</MenuItem>
                      <MenuItem value="0 1px 3px rgba(0,0,0,0.1)">Light</MenuItem>
                      <MenuItem value="0 4px 6px rgba(0,0,0,0.1)">Medium</MenuItem>
                      <MenuItem value="0 10px 15px rgba(0,0,0,0.1)">Heavy</MenuItem>
                      <MenuItem value="0 20px 25px rgba(0,0,0,0.1)">Dramatic</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Spacing Controls */}
              <Grid item xs={12}>
                <Typography variant="caption" display="block" gutterBottom>
                  Spacing
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Padding"
                    type="number"
                    value={parseInt(block.styles?.padding || '16')}
                    onChange={(e) => {
                      const updatedBlock = {
                        ...block,
                        styles: {
                          ...block.styles,
                          padding: `${e.target.value}px`
                        }
                      };
                      onAutoSave(updatedBlock);
                    }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ width: 100 }}
                  />
                  <TextField
                    size="small"
                    label="Margin"
                    type="number"
                    value={parseInt(block.styles?.margin || '0')}
                    onChange={(e) => {
                      const updatedBlock = {
                        ...block,
                        styles: {
                          ...block.styles,
                          margin: `${e.target.value}px`
                        }
                      };
                      onAutoSave(updatedBlock);
                    }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ width: 100 }}
                  />
                  <TextField
                    size="small"
                    label="Border Radius"
                    type="number"
                    value={parseInt(block.styles?.borderRadius || '0')}
                    onChange={(e) => {
                      const updatedBlock = {
                        ...block,
                        styles: {
                          ...block.styles,
                          borderRadius: `${e.target.value}px`
                        }
                      };
                      onAutoSave(updatedBlock);
                    }}
                    inputProps={{ min: 0, max: 50 }}
                    sx={{ width: 120 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Collapse>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 180 } }}
      >
        <MenuItem onClick={() => { onEdit(block); handleMenuClose(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Content</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDuplicate(block); handleMenuClose(); }}>
          <ListItemIcon><DuplicateIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onMove(block.id, 'up'); handleMenuClose(); }}>
          <ListItemIcon><MoveUpIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Move Up</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onMove(block.id, 'down'); handleMenuClose(); }}>
          <ListItemIcon><MoveDownIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Move Down</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDelete(block.id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

// Props for the main VisualCanvas component
interface VisualCanvasProps {
  pageBlocks: WBBlock[];
  onBlockAdd: (blockType: string, position: number) => void;
  onBlockEdit: (block: WBBlock) => void;
  onBlockDelete: (blockId: number) => void;
  onBlockDuplicate: (block: WBBlock) => void;
  onBlockMove: (blockId: number, direction: 'up' | 'down') => void;
  selectedPageId?: number;
  onSave: () => void;
  isLoading?: boolean;
  availablePages: Array<{ id: string; name: string; slug: string }>;
  selectedPageSlug?: string;
  onPageSelect: (pageSlug: string) => void;
  onImageUpload?: (blockId: number, file: File) => Promise<{ imageUrl: string; publicId: string }>;
  restaurantSlug?: string;
  onAutoSave: (block: WBBlock) => void;
}

const VisualCanvas: React.FC<VisualCanvasProps> = ({
  pageBlocks,
  onBlockAdd,
  onBlockEdit,
  onBlockDelete,
  onBlockDuplicate,
  onBlockMove,
  selectedPageId,
  onSave,
  isLoading = false,
  availablePages,
  selectedPageSlug,
  onPageSelect,
  onImageUpload,
  restaurantSlug,
  onAutoSave
}) => {
  const [showDropZones, setShowDropZones] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

  // Sort blocks by display order
  const sortedBlocks = [...pageBlocks].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Handle inline editing of block fields
  const handleInlineEdit = (blockId: number, field: string, value: string) => {
    const block = pageBlocks.find(b => b.id === blockId);
    if (block) {
      const updatedBlock = {
        ...block,
        [field]: value
      };
      onBlockEdit(updatedBlock);
      
      // Refresh preview after edit
      if (showPreview) {
        setTimeout(() => setPreviewKey(prev => prev + 1), 500);
      }
    }
  };

  // Generate preview URL
  const getPreviewUrl = () => {
    if (!restaurantSlug || !selectedPageSlug) return '';
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${restaurantSlug}.kitchensync.restaurant`
      : `http://localhost:3001/customer`;
    
    return selectedPageSlug === 'home' 
      ? baseUrl 
      : `${baseUrl}/${selectedPageSlug}`;
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      setPreviewKey(prev => prev + 1);
    }
  };

  // Get device dimensions for responsive preview
  const getDeviceDimensions = () => {
    switch (previewDevice) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewDevice(device);
    setPreviewKey(prev => prev + 1);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Compact Canvas Header */}
      <Paper sx={{ p: 1.5, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              📱 {selectedPageSlug ? `${selectedPageSlug} (${sortedBlocks.length})` : 'Page Canvas'}
            </Typography>
          </Box>
          
          {/* Compact Page Selector */}
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Page</InputLabel>
            <Select
              value={selectedPageSlug || ''}
              onChange={(e) => onPageSelect(e.target.value)}
              label="Page"
            >
              {availablePages.map((page) => (
                <MenuItem key={page.slug} value={page.slug}>
                  {page.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title="Toggle drop zones">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowDropZones(!showDropZones)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              {showDropZones ? 'Hide Zones' : 'Show Zones'}
            </Button>
          </Tooltip>
          <Tooltip title={showPreview ? "Hide preview" : "Show live preview"}>
            <Button
              variant={showPreview ? "contained" : "outlined"}
              size="small"
              onClick={handlePreviewToggle}
              startIcon={showPreview ? <HidePreviewIcon /> : <PreviewIcon />}
              disabled={!selectedPageSlug || !restaurantSlug}
              sx={{ minWidth: 'auto' }}
            >
              {showPreview ? 'Hide' : 'Preview'}
            </Button>
          </Tooltip>
          <Tooltip title="Save changes">
            <Fab 
              size="small" 
              color="primary" 
              onClick={onSave}
              disabled={isLoading}
            >
              <SaveIcon />
            </Fab>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Optimized Canvas Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 1 }}>
        {/* Editor Panel */}
        <Box sx={{ 
          flex: showPreview ? (previewCollapsed ? 3 : 1) : 1, 
          overflow: 'auto',
          minWidth: showPreview ? 300 : 'auto'
        }}>
          {!selectedPageSlug ? (
            // No page selected state
            <Paper 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'grey.50',
                m: 1
              }}
            >
              <Box textAlign="center">
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Page Selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a page from the dropdown above to start building content
                </Typography>
              </Box>
            </Paper>
          ) : sortedBlocks.length === 0 ? (
            // Empty canvas state
            <Paper 
              sx={{ 
                height: '90%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'grey.300',
                bgcolor: 'grey.50',
                m: 1
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const blockType = e.dataTransfer.getData('text/plain');
                if (blockType) {
                  onBlockAdd(blockType, 0);
                }
              }}
            >
              <Box textAlign="center">
                <AddIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Empty Canvas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag content blocks from the sidebar to start building your page
                </Typography>
              </Box>
            </Paper>
          ) : (
            // Canvas with blocks
            <Box sx={{ p: 1 }}>
              {/* Top drop zone */}
              {showDropZones && (
                <DropZone 
                  onDrop={onBlockAdd} 
                  position={0} 
                  isActive={true}
                />
              )}

              {/* Render blocks with drop zones between them */}
              {sortedBlocks.map((block, index) => (
                <React.Fragment key={block.id}>
                  <VisualBlock
                    block={block}
                    onEdit={onBlockEdit}
                    onDelete={onBlockDelete}
                    onDuplicate={onBlockDuplicate}
                    onMove={onBlockMove}
                    onInlineEdit={handleInlineEdit}
                    onImageUpload={onImageUpload}
                    onAutoSave={onAutoSave}
                  />
                  
                  {/* Drop zone after each block */}
                  {showDropZones && (
                    <DropZone 
                      onDrop={onBlockAdd} 
                      position={index + 1} 
                      isActive={true}
                    />
                  )}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Box>

        {/* Enhanced Preview Panel */}
        {showPreview && (
          <Box sx={{ 
            flex: previewCollapsed ? 1 : 2, 
            display: 'flex', 
            flexDirection: 'column',
            minWidth: previewCollapsed ? 200 : 400,
            maxWidth: previewCollapsed ? 300 : 'none'
          }}>
            {/* Collapsible Preview Header */}
            <Paper sx={{ p: 1.5, mb: 1, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🌐 {previewCollapsed ? 'Preview' : 'Live Preview'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Refresh preview">
                    <IconButton 
                      size="small" 
                      onClick={() => setPreviewKey(prev => prev + 1)}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={previewCollapsed ? "Expand preview" : "Collapse preview"}>
                    <IconButton 
                      size="small" 
                      onClick={() => setPreviewCollapsed(!previewCollapsed)}
                    >
                      {previewCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  {!previewCollapsed && (
                    <Chip 
                      label={selectedPageSlug === 'home' ? 'Home' : selectedPageSlug} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </Box>
              
              {/* Device Size Controls - Only show when expanded */}
              {!previewCollapsed && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Customer portal view • Updates automatically
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'white', borderRadius: 1, p: 0.5 }}>
                    {[
                      { device: 'desktop' as const, icon: DesktopIcon, label: 'Desktop' },
                      { device: 'tablet' as const, icon: TabletIcon, label: 'Tablet' },
                      { device: 'mobile' as const, icon: MobileIcon, label: 'Mobile' }
                    ].map(({ device, icon: Icon, label }) => (
                      <Tooltip key={device} title={label}>
                        <IconButton
                          size="small"
                          onClick={() => handleDeviceChange(device)}
                          sx={{
                            bgcolor: previewDevice === device ? 'primary.main' : 'transparent',
                            color: previewDevice === device ? 'white' : 'text.secondary',
                            p: 0.5,
                            '&:hover': {
                              bgcolor: previewDevice === device ? 'primary.dark' : 'action.hover'
                            }
                          }}
                        >
                          <Icon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Collapsible Preview Frame */}
            <Collapse in={!previewCollapsed}>
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: previewDevice === 'desktop' ? 'stretch' : 'flex-start',
                p: previewDevice === 'desktop' ? 0 : 1,
                bgcolor: previewDevice === 'desktop' ? 'transparent' : 'grey.100',
                overflow: 'auto',
                borderRadius: 1
              }}>
                <Box 
                  sx={{ 
                    ...getDeviceDimensions(),
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: previewDevice === 'desktop' ? 1 : 2,
                    overflow: 'hidden',
                    boxShadow: previewDevice === 'desktop' ? 'none' : 2,
                    bgcolor: 'white',
                    minHeight: previewDevice === 'desktop' ? '100%' : 'auto'
                  }}
                >
                  <iframe
                    key={previewKey}
                    src={getPreviewUrl()}
                    title="Live Preview"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      border: 'none',
                      backgroundColor: 'white',
                      minHeight: previewDevice === 'desktop' ? '100%' : '400px'
                    }}
                  />
                </Box>
              </Box>
            </Collapse>
          </Box>
        )}
      </Box>

      {/* Compact Canvas Footer */}
      {selectedPageSlug && (
        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            💡 <strong>Tips:</strong> Drag blocks from sidebar • Click blocks to expand • Use menus for more options
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VisualCanvas; 