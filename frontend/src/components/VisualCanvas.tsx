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
  Grid,
  Slider
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

// Drop zone component for empty canvas areas and reordering
interface DropZoneProps {
  onDrop: (blockType: string, position: number) => void;
  onBlockReorder?: (draggedBlockId: number, targetPosition: number) => void;
  position: number;
  isActive: boolean;
  isReorderZone?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onDrop, onBlockReorder, position, isActive, isReorderZone = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragType, setDragType] = useState<'block' | 'reorder' | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    
    // Determine if this is a new block or reordering
    const blockType = e.dataTransfer.getData('text/plain');
    const blockId = e.dataTransfer.getData('application/block-id');
    
    if (blockId) {
      setDragType('reorder');
    } else if (blockType) {
      setDragType('block');
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDragType(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling up to parent elements
    setIsDragOver(false);
    
    const blockType = e.dataTransfer.getData('text/plain');
    const blockId = e.dataTransfer.getData('application/block-id');
    
    if (blockId && onBlockReorder) {
      // Handle block reordering
      onBlockReorder(parseInt(blockId), position);
    } else if (blockType) {
      // Handle new block addition
      onDrop(blockType, position);
    }
    
    setDragType(null);
  };

  const getDropZoneText = () => {
    if (!isDragOver) return isReorderZone ? 'Reorder zone' : 'Drop zone';
    
    if (dragType === 'reorder') {
      return 'Move block here';
    } else if (dragType === 'block') {
      return 'Drop block here';
    }
    
    return 'Drop here';
  };

  const getDropZoneColor = () => {
    if (!isDragOver) return 'grey.400';
    
    if (dragType === 'reorder') {
      return 'secondary.main';
    } else if (dragType === 'block') {
      return 'primary.main';
    }
    
    return 'primary.main';
  };

  return (
    <Box
      sx={{
        minHeight: isDragOver ? 120 : isReorderZone ? 40 : 60,
        border: '2px dashed',
        borderColor: isDragOver ? getDropZoneColor() : isActive ? 'grey.400' : 'transparent',
        bgcolor: isDragOver ? (dragType === 'reorder' ? 'secondary.lighter' : 'primary.lighter') : isActive ? 'grey.100' : 'transparent',
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
          borderColor: isReorderZone ? 'secondary.light' : 'primary.light',
          bgcolor: isReorderZone ? 'secondary.lighter' : 'primary.lighter'
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Box textAlign="center">
        <AddIcon sx={{ 
          fontSize: isReorderZone ? 24 : 32, 
          color: isDragOver ? getDropZoneColor() : 'grey.400', 
          mb: isReorderZone ? 0 : 1 
        }} />
        <Typography variant="caption" color={isDragOver ? getDropZoneColor() : 'text.secondary'}>
          {getDropZoneText()}
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
  onReorder?: (draggedBlockId: number, targetPosition: number) => void;
  index: number;
  total: number;
  globalDragState: boolean;
  onGlobalDragStart: () => void;
  onGlobalDragEnd: () => void;
  editingBlockId?: number | null; // Add this to prevent inline editing conflicts
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const VisualBlock: React.FC<VisualBlockProps> = ({ 
  block, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onMove,
  onInlineEdit,
  onImageUpload,
  onAutoSave,
  onReorder,
  index,
  total,
  globalDragState,
  onGlobalDragStart,
  onGlobalDragEnd,
  editingBlockId,
  expanded,
  onExpandedChange
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [inlineEditing, setInlineEditing] = useState<{ field: string; value: string } | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isDragPreview, setIsDragPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle card clicks - but only if not during any drag operation
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent expansion during any drag operation
    if (globalDragState || isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Prevent expansion when another block is being edited in a modal
    if (editingBlockId && editingBlockId !== block.id) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Direct expansion without setTimeout to avoid delayed issues
    onExpandedChange(!expanded);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleInlineEditStart = (field: string, currentValue: string) => {
    setInlineEditing({ field, value: currentValue });
    onExpandedChange(true); // Auto-expand when editing
  };

  const handleInlineEditSave = () => {
    if (inlineEditing && onInlineEdit && inlineEditing.value.trim() !== '') {
      onInlineEdit(block.id, inlineEditing.field, inlineEditing.value);
    }
    setInlineEditing(null);
  };

  const handleInlineEditCancel = () => {
    setInlineEditing(null);
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
    if (inlineEditing) {
      setInlineEditing({ ...inlineEditing, value });
    }
  };

  // Drag and drop handlers for block reordering
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation(); // Prevent bubbling
    setIsDragging(true);
    onGlobalDragStart(); // Set global drag state
    e.dataTransfer.setData('application/block-id', block.id.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Add some visual feedback to the card, not the drag element
    const card = (e.target as HTMLElement).closest('[data-block-id]') as HTMLElement;
    if (card) {
      card.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation(); // Prevent bubbling
    setIsDragging(false);
    onGlobalDragEnd(); // Clear global drag state
    
    // Restore opacity to the card
    const card = (e.target as HTMLElement).closest('[data-block-id]') as HTMLElement;
    if (card) {
      card.style.opacity = '1';
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) return;
    
    try {
      const result = await onImageUpload(block.id, file);
      
      if (onInlineEdit) {
        onInlineEdit(block.id, 'imageUrl', result.imageUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setShowImageUpload(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile);
    }
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setShowImageUpload(true);
  };

  const handleImageDragLeave = () => {
    setShowImageUpload(false);
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
      case 'about':
        return { title: 'About Section', color: '#2e7d32', icon: 'ℹ️' };
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
      case 'video':
        return { title: 'Video Block', color: '#d32f2f', icon: '🎥' };
      case 'menu_display':
        return { title: 'Menu Display', color: '#689f38', icon: '🍽️' };
      case 'testimonials':
        return { title: 'Testimonials', color: '#ff6f00', icon: '💬' };
      case 'newsletter':
        return { title: 'Newsletter', color: '#1565c0', icon: '📧' };
      case 'map_location':
        return { title: 'Location Map', color: '#303f9f', icon: '🗺️' };
      case 'social_feed':
        return { title: 'Social Feed', color: '#e91e63', icon: '📱' };
      case 'reservation_widget':
        return { title: 'Reservations', color: '#8d6e63', icon: '🪑' };
      case 'pricing_menu':
        return { title: 'Pricing Menu', color: '#5e35b1', icon: '💰' };
      case 'spacer':
        return { title: 'Spacer', color: '#757575', icon: '〰️' };
      default:
        return { title: 'Content Block', color: '#757575', icon: '📄' };
    }
  };

  const preview = getBlockPreview();

  return (
    <Card 
      data-block-id={block.id}
      sx={{ 
        mb: 1, 
        mx: 1,
        border: '1px solid',
        borderColor: isDragging ? 'secondary.main' : 'grey.300',
        transition: 'all 0.2s ease',
        opacity: isDragging ? 0.8 : 1,
        transform: isDragging ? 'rotate(2deg)' : 'none',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1
        }
      }}
      onClick={handleCardClick}
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
      >
        <Box display="flex" alignItems="center" gap={1} flex={1}>
          <Box
            draggable={!inlineEditing} // Only draggable when not editing
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()} // Prevent expand/collapse when clicking drag handle
            sx={{
              cursor: !inlineEditing ? 'grab' : 'default',
              '&:active': { cursor: !inlineEditing ? 'grabbing' : 'default' },
              '&:hover .drag-icon': { color: 'primary.main' },
              display: 'flex',
              alignItems: 'center',
              padding: '4px', // Add some padding for better grab area
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              },
              userSelect: 'none', // Prevent text selection
              webkitUserSelect: 'none',
              mozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          >
            <DragIcon 
              className="drag-icon"
              sx={{ 
                color: isDragging ? 'secondary.main' : 'grey.400', 
                fontSize: '1.2rem',
                pointerEvents: 'none' // Prevent the icon itself from interfering with drag
              }} 
            />
          </Box>
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
          {/* Quick Actions - Only show when NOT dragging */}
          {!isDragging && !globalDragState && (
            <>
              <Tooltip title="Move up">
                <IconButton 
                  size="small" 
                  disabled={index === 0}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onMove(block.id, 'up'); 
                  }}
                  sx={{ p: 0.5 }}
                >
                  <MoveUpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Move down">
                <IconButton 
                  size="small" 
                  disabled={index === total - 1}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onMove(block.id, 'down'); 
                  }}
                  sx={{ p: 0.5 }}
                >
                  <MoveDownIcon fontSize="small" />
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
          <IconButton 
            size="small" 
            sx={{ p: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              onExpandedChange(!expanded);
            }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* Expandable Content */}
      <Collapse in={expanded}>
        <Box sx={{ px: 1.5, pb: 1.5, borderTop: '1px solid', borderColor: 'grey.200' }}>
          {/* Inline Editing Area */}
          <Box sx={{ mt: 1 }}>
            {/* Editable Title */}
            {inlineEditing?.field === 'title' ? (
              <TextField
                value={inlineEditing.value}
                onChange={(e) => {
                  if (inlineEditing) {
                    setInlineEditing({ ...inlineEditing, value: e.target.value });
                  }
                }}
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
            {inlineEditing?.field === 'content' ? (
              <Box>
                <ReactQuill
                  value={inlineEditing.value}
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
                      borderColor: showImageUpload ? 'primary.main' : 'grey.300',
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: showImageUpload ? 'primary.lighter' : 'transparent',
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
                    {showImageUpload && (
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
                  </Box>
                ) : (
                  <Box
                    sx={{
                      border: '1px dashed',
                      borderColor: showImageUpload ? 'primary.main' : 'grey.400',
                      borderRadius: 1,
                      p: 2,
                      textAlign: 'center',
                      bgcolor: showImageUpload ? 'primary.lighter' : 'grey.50',
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
                    {showImageUpload ? (
                      <Typography variant="caption" color="primary">
                        Uploading...
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        📷 {showImageUpload ? 'Drop image' : 'Click to upload'}
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
            {inlineEditing && (
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
                        e.stopPropagation(); // Prevent event bubbling
                        console.log('[DEBUG] Background color change triggered:', e.target.value);
                        console.log('[DEBUG] Current block:', block);
                        
                        const updatedBlock = {
                          ...block,
                          settings: {
                            ...block.settings,
                            styles: {
                              ...block.styles,
                              backgroundColor: e.target.value
                            }
                          }
                        };
                        
                        console.log('[DEBUG] Updated block:', updatedBlock);
                        console.log('[DEBUG] Calling onAutoSave with updated block');
                        
                        onAutoSave(updatedBlock);
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
                      sx={{ width: 60 }}
                    />
                    <TextField
                      size="small"
                      value={block.styles?.backgroundColor || '#ffffff'}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        const updatedBlock = {
                          ...block,
                          settings: {
                            ...block.settings,
                            styles: {
                              ...block.styles,
                              backgroundColor: e.target.value
                            }
                          }
                        };
                        onAutoSave(updatedBlock);
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
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
                      e.stopPropagation(); // Prevent event bubbling
                      const updatedBlock = {
                        ...block,
                        settings: {
                          ...block.settings,
                          styles: {
                            ...block.styles,
                            borderWidth: `${e.target.value}px`
                          }
                        }
                      };
                      onAutoSave(updatedBlock);
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
                    inputProps={{ min: 0, max: 10 }}
                    sx={{ width: 80 }}
                  />
                  <FormControl size="small" sx={{ width: 100 }}>
                    <InputLabel>Style</InputLabel>
                    <Select
                      value={block.styles?.borderStyle || 'solid'}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        const updatedBlock = {
                          ...block,
                          settings: {
                            ...block.settings,
                            styles: {
                              ...block.styles,
                              borderStyle: e.target.value
                            }
                          }
                        };
                        onAutoSave(updatedBlock);
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
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
                    e.stopPropagation(); // Prevent event bubbling
                    const updatedBlock = {
                      ...block,
                      settings: {
                        ...block.settings,
                        styles: {
                          ...block.styles,
                          borderColor: e.target.value
                        }
                      }
                    };
                    onAutoSave(updatedBlock);
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
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
                        e.stopPropagation(); // Prevent event bubbling
                        const updatedBlock = {
                          ...block,
                          settings: {
                            ...block.settings,
                            styles: {
                              ...block.styles,
                              boxShadow: e.target.value
                            }
                          }
                        };
                        onAutoSave(updatedBlock);
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
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
                      e.stopPropagation(); // Prevent event bubbling
                      const updatedBlock = {
                        ...block,
                        settings: {
                          ...block.settings,
                          styles: {
                            ...block.styles,
                            padding: `${e.target.value}px`
                          }
                        }
                      };
                      onAutoSave(updatedBlock);
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ width: 100 }}
                  />
                  <TextField
                    size="small"
                    label="Margin"
                    type="number"
                    value={parseInt(block.styles?.margin || '0')}
                    onChange={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      const updatedBlock = {
                        ...block,
                        settings: {
                          ...block.settings,
                          styles: {
                            ...block.styles,
                            margin: `${e.target.value}px`
                          }
                        }
                      };
                      onAutoSave(updatedBlock);
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ width: 100 }}
                  />
                </Box>
              </Grid>

              {/* Hero-Specific Controls */}
              {block.blockType === 'hero' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    🎯 Hero Settings
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Height Mode */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Height Mode</InputLabel>
                        <Select
                          value={block.settings?.heightMode || 'default'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                heightMode: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Height Mode"
                        >
                          <MenuItem value="default">Default (500px)</MenuItem>
                          <MenuItem value="fullscreen">Full Screen (100vh)</MenuItem>
                          <MenuItem value="custom">Custom Height</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Custom Height (if selected) */}
                    {block.settings?.heightMode === 'custom' && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          label="Custom Height"
                          value={block.settings?.customHeight || '500px'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                customHeight: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="e.g., 600px, 80vh"
                          fullWidth
                        />
                      </Grid>
                    )}

                    {/* Overlay Controls */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Overlay Color
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="color"
                          value={block.settings?.overlayColor || '#000000'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                overlayColor: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ width: 60 }}
                        />
                        <TextField
                          size="small"
                          label="Opacity"
                          type="number"
                          value={parseFloat(block.settings?.overlayOpacity || '0.4')}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                overlayOpacity: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          inputProps={{ min: 0, max: 1, step: 0.1 }}
                          sx={{ width: 100 }}
                        />
                      </Box>
                    </Grid>

                    {/* Text Alignment */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Text Alignment</InputLabel>
                        <Select
                          value={block.settings?.textAlign || 'center'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                textAlign: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Text Alignment"
                        >
                          <MenuItem value="left">Left</MenuItem>
                          <MenuItem value="center">Center</MenuItem>
                          <MenuItem value="right">Right</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Vertical Position */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Vertical Position</InputLabel>
                        <Select
                          value={block.settings?.alignItems || 'center'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                alignItems: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Vertical Position"
                        >
                          <MenuItem value="flex-start">Top</MenuItem>
                          <MenuItem value="center">Center</MenuItem>
                          <MenuItem value="flex-end">Bottom</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Horizontal Position */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Horizontal Position</InputLabel>
                        <Select
                          value={block.settings?.justifyContent || 'center'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                justifyContent: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Horizontal Position"
                        >
                          <MenuItem value="flex-start">Left</MenuItem>
                          <MenuItem value="center">Center</MenuItem>
                          <MenuItem value="flex-end">Right</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Hero Typography Controls */}
              {block.blockType === 'hero' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    🔤 Typography
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Title Typography */}
                    <Grid item xs={12}>
                      <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: 600 }}>
                        Title Styling
                      </Typography>
                    </Grid>
                    
                    {/* Title Font Family */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Title Font</InputLabel>
                        <Select
                          value={block.settings?.titleFontFamily || 'default'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                titleFontFamily: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Title Font"
                        >
                          <MenuItem value="default">Default</MenuItem>
                          <MenuItem value="'Playfair Display', serif">Playfair Display (Elegant)</MenuItem>
                          <MenuItem value="'Montserrat', sans-serif">Montserrat (Modern)</MenuItem>
                          <MenuItem value="'Dancing Script', cursive">Dancing Script (Script)</MenuItem>
                          <MenuItem value="'Roboto Slab', serif">Roboto Slab (Strong)</MenuItem>
                          <MenuItem value="'Oswald', sans-serif">Oswald (Bold)</MenuItem>
                          <MenuItem value="'Lora', serif">Lora (Classic)</MenuItem>
                          <MenuItem value="'Poppins', sans-serif">Poppins (Clean)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Title Font Size */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        size="small"
                        label="Title Size"
                        value={block.settings?.titleFontSize || '3.75rem'}
                        onChange={(e) => {
                          e.stopPropagation();
                          const updatedBlock = {
                            ...block,
                            settings: {
                              ...block.settings,
                              titleFontSize: e.target.value
                            }
                          };
                          onAutoSave(updatedBlock);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="e.g., 3.75rem, 48px"
                        fullWidth
                      />
                    </Grid>

                    {/* Title Font Weight */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Title Weight</InputLabel>
                        <Select
                          value={block.settings?.titleFontWeight || 'bold'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                titleFontWeight: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Title Weight"
                        >
                          <MenuItem value="300">Light (300)</MenuItem>
                          <MenuItem value="400">Normal (400)</MenuItem>
                          <MenuItem value="500">Medium (500)</MenuItem>
                          <MenuItem value="600">Semi-Bold (600)</MenuItem>
                          <MenuItem value="700">Bold (700)</MenuItem>
                          <MenuItem value="800">Extra Bold (800)</MenuItem>
                          <MenuItem value="900">Black (900)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Title Color */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Title Color
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="color"
                          value={block.settings?.titleColor || '#ffffff'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                titleColor: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ width: 60 }}
                        />
                        <TextField
                          size="small"
                          value={block.settings?.titleColor || '#ffffff'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                titleColor: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="#ffffff"
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    </Grid>

                    {/* Subtitle Typography */}
                    <Grid item xs={12}>
                      <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                        Subtitle Styling
                      </Typography>
                    </Grid>

                    {/* Subtitle Font Family */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Subtitle Font</InputLabel>
                        <Select
                          value={block.settings?.subtitleFontFamily || 'default'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                subtitleFontFamily: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Subtitle Font"
                        >
                          <MenuItem value="default">Default</MenuItem>
                          <MenuItem value="'Open Sans', sans-serif">Open Sans (Clean)</MenuItem>
                          <MenuItem value="'Lato', sans-serif">Lato (Friendly)</MenuItem>
                          <MenuItem value="'Source Sans Pro', sans-serif">Source Sans Pro</MenuItem>
                          <MenuItem value="'Nunito', sans-serif">Nunito (Rounded)</MenuItem>
                          <MenuItem value="'Roboto', sans-serif">Roboto (Modern)</MenuItem>
                          <MenuItem value="'Inter', sans-serif">Inter (Tech)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Subtitle Font Size */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        size="small"
                        label="Subtitle Size"
                        value={block.settings?.subtitleFontSize || '1.5rem'}
                        onChange={(e) => {
                          e.stopPropagation();
                          const updatedBlock = {
                            ...block,
                            settings: {
                              ...block.settings,
                              subtitleFontSize: e.target.value
                            }
                          };
                          onAutoSave(updatedBlock);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="e.g., 1.5rem, 24px"
                        fullWidth
                      />
                    </Grid>

                    {/* Subtitle Font Weight */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Subtitle Weight</InputLabel>
                        <Select
                          value={block.settings?.subtitleFontWeight || '400'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                subtitleFontWeight: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Subtitle Weight"
                        >
                          <MenuItem value="300">Light (300)</MenuItem>
                          <MenuItem value="400">Normal (400)</MenuItem>
                          <MenuItem value="500">Medium (500)</MenuItem>
                          <MenuItem value="600">Semi-Bold (600)</MenuItem>
                          <MenuItem value="700">Bold (700)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Subtitle Color */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Subtitle Color
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="color"
                          value={block.settings?.subtitleColor || '#ffffff'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                subtitleColor: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ width: 60 }}
                        />
                        <TextField
                          size="small"
                          value={block.settings?.subtitleColor || '#ffffff'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                subtitleColor: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="#ffffff"
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    </Grid>

                    {/* Text Shadow Controls */}
                    <Grid item xs={12}>
                      <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                        Text Effects
                      </Typography>
                    </Grid>

                    {/* Text Shadow Toggle */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Text Shadow</InputLabel>
                        <Select
                          value={block.settings?.textShadowMode || 'default'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                textShadowMode: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Text Shadow"
                        >
                          <MenuItem value="none">None</MenuItem>
                          <MenuItem value="default">Default</MenuItem>
                          <MenuItem value="light">Light Shadow</MenuItem>
                          <MenuItem value="medium">Medium Shadow</MenuItem>
                          <MenuItem value="heavy">Heavy Shadow</MenuItem>
                          <MenuItem value="custom">Custom</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Custom Text Shadow (if selected) */}
                    {block.settings?.textShadowMode === 'custom' && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          label="Custom Shadow"
                          value={block.settings?.customTextShadow || '2px 2px 4px rgba(0,0,0,0.5)'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                customTextShadow: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="2px 2px 4px rgba(0,0,0,0.5)"
                          fullWidth
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Hero Parallax Effects */}
              {block.blockType === 'hero' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    🌟 Parallax Effects
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Parallax Enable/Disable */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Parallax Mode</InputLabel>
                        <Select
                          value={block.settings?.parallaxMode || 'disabled'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                parallaxMode: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Parallax Mode"
                        >
                          <MenuItem value="disabled">Disabled</MenuItem>
                          <MenuItem value="standard">Standard Parallax</MenuItem>
                          <MenuItem value="smooth">Smooth Parallax</MenuItem>
                          <MenuItem value="subtle">Subtle Motion</MenuItem>
                          <MenuItem value="dramatic">Dramatic Effect</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Parallax Intensity (if enabled) */}
                    {block.settings?.parallaxMode && block.settings.parallaxMode !== 'disabled' && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" display="block" gutterBottom>
                          Parallax Intensity
                        </Typography>
                        <Box sx={{ px: 1 }}>
                          <Slider
                            value={parseFloat(block.settings?.parallaxIntensity) || 0.5}
                            onChange={(e, value) => {
                              e.stopPropagation();
                              const updatedBlock = {
                                ...block,
                                settings: {
                                  ...block.settings,
                                  parallaxIntensity: value.toString()
                                }
                              };
                              onAutoSave(updatedBlock);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            min={0.1}
                            max={1.0}
                            step={0.1}
                            marks={[
                              { value: 0.1, label: 'Subtle' },
                              { value: 0.5, label: 'Medium' },
                              { value: 1.0, label: 'Strong' }
                            ]}
                            valueLabelDisplay="auto"
                            size="small"
                          />
                        </Box>
                      </Grid>
                    )}

                    {/* Parallax Performance Mode */}
                    {block.settings?.parallaxMode && block.settings.parallaxMode !== 'disabled' && (
                      <Grid item xs={12} sm={6}>
                        <FormControl size="small" fullWidth>
                          <InputLabel>Performance</InputLabel>
                          <Select
                            value={block.settings?.parallaxPerformance || 'auto'}
                            onChange={(e) => {
                              e.stopPropagation();
                              const updatedBlock = {
                                ...block,
                                settings: {
                                  ...block.settings,
                                  parallaxPerformance: e.target.value
                                }
                              };
                              onAutoSave(updatedBlock);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            label="Performance"
                          >
                            <MenuItem value="auto">Auto (Recommended)</MenuItem>
                            <MenuItem value="smooth">Smooth (High CPU)</MenuItem>
                            <MenuItem value="performance">Performance (Low CPU)</MenuItem>
                            <MenuItem value="mobile-off">Mobile Disabled</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    {/* Background Attachment Override */}
                    {block.settings?.parallaxMode && block.settings.parallaxMode !== 'disabled' && (
                      <Grid item xs={12} sm={6}>
                        <FormControl size="small" fullWidth>
                          <InputLabel>Background Style</InputLabel>
                          <Select
                            value={block.settings?.backgroundAttachment || 'scroll'}
                            onChange={(e) => {
                              e.stopPropagation();
                              const updatedBlock = {
                                ...block,
                                settings: {
                                  ...block.settings,
                                  backgroundAttachment: e.target.value
                                }
                              };
                              onAutoSave(updatedBlock);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            label="Background Style"
                          >
                            <MenuItem value="scroll">Normal Scroll</MenuItem>
                            <MenuItem value="fixed">Fixed Background</MenuItem>
                            <MenuItem value="local">Local Attachment</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    {/* Parallax Help Text */}
                    {block.settings?.parallaxMode && block.settings.parallaxMode !== 'disabled' && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 1 }}>
                          💡 Parallax creates a depth effect by moving the background slower than the page scroll. 
                          Use "Subtle Motion" for elegant effects, "Dramatic Effect" for bold impact.
                        </Typography>
                        <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: 1, border: '1px solid rgba(25, 118, 210, 0.2)' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            🌟 Parallax Status: Active
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Mode: {block.settings.parallaxMode} | Performance: {block.settings?.parallaxPerformance || 'auto'}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Hero Video Background */}
              {block.blockType === 'hero' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    🎬 Video Background
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Video Background Enable/Disable */}
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Background Type</InputLabel>
                        <Select
                          value={block.settings?.backgroundType || 'image'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updatedBlock = {
                              ...block,
                              settings: {
                                ...block.settings,
                                backgroundType: e.target.value
                              }
                            };
                            onAutoSave(updatedBlock);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          label="Background Type"
                        >
                          <MenuItem value="image">Image Background</MenuItem>
                          <MenuItem value="video">Video Background</MenuItem>
                          <MenuItem value="gradient">Gradient Only</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Video Upload Field */}
                    {block.settings?.backgroundType === 'video' && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            size="small"
                            label="Video URL (MP4)"
                            value={block.settings?.videoUrl || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              const updatedBlock = {
                                ...block,
                                settings: {
                                  ...block.settings,
                                  videoUrl: e.target.value
                                }
                              };
                              onAutoSave(updatedBlock);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="https://example.com/video.mp4"
                            fullWidth
                          />
                        </Grid>

                        {/* WebM Alternative */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            size="small"
                            label="WebM URL (Optional)"
                            value={block.settings?.videoUrlWebm || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              const updatedBlock = {
                                ...block,
                                settings: {
                                  ...block.settings,
                                  videoUrlWebm: e.target.value
                                }
                              };
                              onAutoSave(updatedBlock);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="https://example.com/video.webm"
                            fullWidth
                          />
                        </Grid>

                        {/* Fallback Image */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            size="small"
                            label="Fallback Image URL"
                            value={block.settings?.videoFallbackImage || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              const updatedBlock = {
                                ...block,
                                settings: {
                                  ...block.settings,
                                  videoFallbackImage: e.target.value
                                }
                              };
                              onAutoSave(updatedBlock);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="https://example.com/fallback.jpg"
                            fullWidth
                          />
                        </Grid>

                        {/* Video Playback Controls */}
                        <Grid item xs={12}>
                          <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                            Playback Settings
                          </Typography>
                        </Grid>

                        {/* Autoplay */}
                        <Grid item xs={12} sm={6}>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Autoplay</InputLabel>
                            <Select
                              value={block.settings?.videoAutoplay || 'true'}
                              onChange={(e) => {
                                e.stopPropagation();
                                const updatedBlock = {
                                  ...block,
                                  settings: {
                                    ...block.settings,
                                    videoAutoplay: e.target.value
                                  }
                                };
                                onAutoSave(updatedBlock);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              label="Autoplay"
                            >
                              <MenuItem value="true">Auto-play (Recommended)</MenuItem>
                              <MenuItem value="false">Manual Start</MenuItem>
                              <MenuItem value="mobile-off">Desktop Only</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Loop */}
                        <Grid item xs={12} sm={6}>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Loop Video</InputLabel>
                            <Select
                              value={block.settings?.videoLoop || 'true'}
                              onChange={(e) => {
                                e.stopPropagation();
                                const updatedBlock = {
                                  ...block,
                                  settings: {
                                    ...block.settings,
                                    videoLoop: e.target.value
                                  }
                                };
                                onAutoSave(updatedBlock);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              label="Loop Video"
                            >
                              <MenuItem value="true">Continuous Loop</MenuItem>
                              <MenuItem value="false">Play Once</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Muted */}
                        <Grid item xs={12} sm={6}>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Audio</InputLabel>
                            <Select
                              value={block.settings?.videoMuted || 'true'}
                              onChange={(e) => {
                                e.stopPropagation();
                                const updatedBlock = {
                                  ...block,
                                  settings: {
                                    ...block.settings,
                                    videoMuted: e.target.value
                                  }
                                };
                                onAutoSave(updatedBlock);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              label="Audio"
                            >
                              <MenuItem value="true">Muted (Recommended)</MenuItem>
                              <MenuItem value="false">Audio Enabled</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Playback Speed */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" display="block" gutterBottom>
                            Playback Speed
                          </Typography>
                          <Box sx={{ px: 1 }}>
                            <Slider
                              value={parseFloat(block.settings?.videoPlaybackRate) || 1.0}
                              onChange={(e, value) => {
                                e.stopPropagation();
                                const updatedBlock = {
                                  ...block,
                                  settings: {
                                    ...block.settings,
                                    videoPlaybackRate: value.toString()
                                  }
                                };
                                onAutoSave(updatedBlock);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              min={0.25}
                              max={2.0}
                              step={0.25}
                              marks={[
                                { value: 0.5, label: '0.5x' },
                                { value: 1.0, label: '1x' },
                                { value: 1.5, label: '1.5x' },
                                { value: 2.0, label: '2x' }
                              ]}
                              valueLabelDisplay="auto"
                              size="small"
                            />
                          </Box>
                        </Grid>

                        {/* Video Quality/Performance */}
                        <Grid item xs={12} sm={6}>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Video Quality</InputLabel>
                            <Select
                              value={block.settings?.videoQuality || 'auto'}
                              onChange={(e) => {
                                e.stopPropagation();
                                const updatedBlock = {
                                  ...block,
                                  settings: {
                                    ...block.settings,
                                    videoQuality: e.target.value
                                  }
                                };
                                onAutoSave(updatedBlock);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              label="Video Quality"
                            >
                              <MenuItem value="auto">Auto (Recommended)</MenuItem>
                              <MenuItem value="high">High Quality</MenuItem>
                              <MenuItem value="medium">Medium Quality</MenuItem>
                              <MenuItem value="low">Low Quality (Fast)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Mobile Behavior */}
                        <Grid item xs={12} sm={6}>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Mobile Behavior</InputLabel>
                            <Select
                              value={block.settings?.videoMobileBehavior || 'fallback'}
                              onChange={(e) => {
                                e.stopPropagation();
                                const updatedBlock = {
                                  ...block,
                                  settings: {
                                    ...block.settings,
                                    videoMobileBehavior: e.target.value
                                  }
                                };
                                onAutoSave(updatedBlock);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              label="Mobile Behavior"
                            >
                              <MenuItem value="video">Show Video</MenuItem>
                              <MenuItem value="fallback">Use Fallback Image</MenuItem>
                              <MenuItem value="poster">Show Video Poster</MenuItem>
                              <MenuItem value="gradient">Gradient Only</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Video Help Text */}
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 1 }}>
                            🎬 Video backgrounds create stunning, cinematic experiences. Use MP4 for best compatibility, WebM for optimization.
                            Always provide a fallback image for mobile devices and slower connections.
                          </Typography>
                          
                          {/* Video Status Indicator */}
                          {block.settings?.videoUrl && (
                            <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(156, 39, 176, 0.1)', borderRadius: 1, border: '1px solid rgba(156, 39, 176, 0.2)' }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                                🎬 Video Background: Active
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Autoplay: {block.settings.videoAutoplay || 'true'} | Loop: {block.settings.videoLoop || 'true'} | Speed: {block.settings.videoPlaybackRate || '1.0'}x
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              )}
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
  onBlockReorder?: (draggedBlockId: number, targetPosition: number) => void;
  selectedPageId?: number;
  onSave: () => void;
  isLoading?: boolean;
  availablePages: Array<{ id: string; name: string; slug: string }>;
  selectedPageSlug?: string;
  onPageSelect: (pageSlug: string) => void;
  onImageUpload?: (blockId: number, file: File) => Promise<{ imageUrl: string; publicId: string }>;
  restaurantSlug?: string;
  onAutoSave: (block: WBBlock) => void;
  editingBlockId?: number | null; // Add this to prevent inline editing conflicts
}

const VisualCanvas: React.FC<VisualCanvasProps> = ({
  pageBlocks,
  onBlockAdd,
  onBlockEdit,
  onBlockDelete,
  onBlockDuplicate,
  onBlockMove,
  onBlockReorder,
  selectedPageId,
  onSave,
  isLoading = false,
  availablePages,
  selectedPageSlug,
  onPageSelect,
  onImageUpload,
  restaurantSlug,
  onAutoSave,
  editingBlockId // Add this parameter
}) => {
  const [showDropZones, setShowDropZones] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [globalDragState, setGlobalDragState] = useState(false); // Global drag state for all blocks
  const [expandedBlocks, setExpandedBlocks] = useState(new Set<number>());

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

  // Handle block reordering via drag and drop
  const handleBlockReorder = (draggedBlockId: number, targetPosition: number) => {
    // Use the parent's reorder function which handles the sequential logic properly
    if (onBlockReorder) {
      onBlockReorder(draggedBlockId, targetPosition);
    }
  };

  // Handle block expansion state
  const handleBlockExpansion = (blockId: number, expanded: boolean) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(blockId);
      } else {
        newSet.delete(blockId);
      }
      return newSet;
    });
  };

  // Generate preview URL
  const getPreviewUrl = () => {
    if (!restaurantSlug || !selectedPageSlug) return '';
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${restaurantSlug}.kitchensync.restaurant`
      : `http://localhost:3001/customer`;
    
    return selectedPageSlug === 'home' ? baseUrl : `${baseUrl}/${selectedPageSlug}`;
  };

  // Handle preview toggle
  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
    setPreviewKey(prev => prev + 1); // Force refresh
  };

  // Get device dimensions for preview
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

  // Handle device change
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewDevice(device);
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
                    onReorder={handleBlockReorder}
                    index={index}
                    total={sortedBlocks.length}
                    globalDragState={globalDragState}
                    onGlobalDragStart={() => {
                      setGlobalDragState(true);
                    }}
                    onGlobalDragEnd={() => {
                      setGlobalDragState(false);
                    }}
                    editingBlockId={editingBlockId}
                    expanded={expandedBlocks.has(block.id)}
                    onExpandedChange={(expanded) => handleBlockExpansion(block.id, expanded)}
                  />
                  
                  {/* Drop zone after each block */}
                  {showDropZones && (
                    <DropZone 
                      onDrop={onBlockAdd}
                      onBlockReorder={handleBlockReorder}
                      position={index + 1} 
                      isActive={true}
                      isReorderZone={true}
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
                    minHeight: previewDevice === 'desktop' ? '100%' : '400px'
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