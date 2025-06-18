import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  CloudUpload as UploadIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { WBBlock } from '../services/websiteBuilderService';

interface ContentBlockEditorProps {
  block: WBBlock;
  onSave: (blockData: Partial<WBBlock>) => Promise<void>;
  onAutoSave?: (blockData: Partial<WBBlock>) => Promise<void>;
  onDelete: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
  setIsEditing?: (editing: boolean) => void;
  dragHandleProps?: any;
  onPostCreateImageUpload?: (blockId: number, file: File) => Promise<{ imageUrl: string; publicId: string }>;
}

// Rich text editor modules configuration - Enhanced for professional content editing
const quillModules = {
  toolbar: [
    // Text formatting
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    
    // Text styles
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    
    // Text alignment and direction
    [{ 'align': [] }],
    [{ 'direction': 'rtl' }],
    
    // Lists and indentation
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    
    // Links and media
    ['link', 'image', 'video'],
    
    // Advanced formatting
    ['blockquote', 'code-block'],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    
    // Cleanup
    ['clean']
  ],
  // Enhanced clipboard handling
  clipboard: {
    matchVisual: false,
  },
  // History module for undo/redo
  history: {
    delay: 1000,
    maxStack: 50,
    userOnly: true
  }
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 
  'color', 'background',
  'align', 'direction',
  'list', 'bullet', 'indent',
  'link', 'image', 'video',
  'blockquote', 'code-block',
  'script',
  'clean'
];

const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({
  block,
  onSave,
  onAutoSave,
  onDelete,
  onCancel,
  isEditing = false,
  setIsEditing,
  dragHandleProps,
  onPostCreateImageUpload
}) => {
  const [editMode, setEditMode] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<WBBlock>>({
    title: block.title || '',
    subtitle: block.subtitle || '',
    content: block.content || '',
    imageUrl: block.imageUrl || '',
    buttonText: block.buttonText || '',
    buttonLink: block.buttonLink || '',
    buttonStyle: block.buttonStyle || 'primary',
    isActive: block.isActive ?? true,
    settings: block.settings || {}
  });

  useEffect(() => {
    setEditMode(isEditing);
  }, [isEditing]);

  // Auto-save functionality with debouncing
  const triggerAutoSave = useCallback(async (data: Partial<WBBlock>) => {
    if (!editMode || saving) return; // Don't auto-save if not in edit mode or already saving

    try {
      setAutoSaving(true);
      // Ensure the block ID is included in the data for auto-save
      const dataWithId = { ...data, id: block.id };
      
      // Use dedicated auto-save handler if available, otherwise use regular save
      if (onAutoSave) {
        await onAutoSave(dataWithId);
      } else {
        await onSave(dataWithId);
      }
      
      setLastSaved(new Date());
      // NOTE: Auto-save should never close the editor
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error for auto-save failures to avoid interrupting user
    } finally {
      setAutoSaving(false);
    }
  }, [editMode, saving, onSave, onAutoSave, block.id]);

  // Debounced auto-save
  const scheduleAutoSave = useCallback((data: Partial<WBBlock>) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Schedule new auto-save after 3 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      triggerAutoSave(data);
    }, 3000);
  }, [triggerAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      // Ensure the block ID is included in the data for manual save
      const dataWithId = { ...formData, id: block.id };
      await onSave(dataWithId);
      
      // If this is a new block and we have a pending image file, upload it
      if (pendingImageFile && onPostCreateImageUpload && block.id) {
        try {
          setUploadingImage(true);
          const result = await onPostCreateImageUpload(block.id, pendingImageFile);
          
          // Update form data with the real image URL
          setFormData(prev => ({
            ...prev,
            imageUrl: result.imageUrl,
            imagePublicId: result.publicId
          }));
          
          // Clear pending file
          setPendingImageFile(null);
          
          console.log('Post-creation image upload successful:', result.imageUrl);
        } catch (error) {
          console.error('Error uploading image after block creation:', error);
          // Show error but don't fail the whole save operation
          alert('Block created successfully, but image upload failed. Please try uploading the image again.');
        } finally {
          setUploadingImage(false);
        }
      }
      
      setEditMode(false);
      setIsEditing?.(false);
    } catch (error) {
      console.error('Error saving block:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: block.title || '',
      subtitle: block.subtitle || '',
      content: block.content || '',
      imageUrl: block.imageUrl || '',
      buttonText: block.buttonText || '',
      buttonLink: block.buttonLink || '',
      buttonStyle: block.buttonStyle || 'primary',
      isActive: block.isActive ?? true,
      settings: block.settings || {}
    });
    setEditMode(false);
    setIsEditing?.(false);
    onCancel?.();
  };

  const handleFieldChange = (field: keyof WBBlock, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Trigger auto-save for content changes (but not for settings like isActive)
    if (editMode && ['title', 'subtitle', 'content', 'buttonText', 'buttonLink', 'imageUrl', 'imagePublicId'].includes(field)) {
      scheduleAutoSave(newFormData);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setUploadingImage(true);
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file');
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image must be smaller than 5MB');
        }
        
        // Check if we have a block ID (for existing blocks)
        if (block.id) {
          // Use the content block upload endpoint for existing blocks
          const uploadFormData = new FormData();
          uploadFormData.append('image', file);
          
          // Import the API service to use the correct base URL
          const { api } = await import('../services/api');
          
          const result = await api.post(`/content-blocks/${block.id}/upload`, uploadFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          const data = result.data;
          
          // Update the form data with the uploaded image URL
          console.log('Before update - formData.imageUrl:', formData.imageUrl);
          
          // Force a state update with the new image data
          setFormData(prev => {
            const newData = {
              ...prev,
              imageUrl: data.imageUrl,
              imagePublicId: data.publicId
            };
            console.log('Setting new formData:', newData);
            
            // Trigger auto-save logic for the new data
            if (editMode) {
              scheduleAutoSave(newData);
            }
            
            return newData;
          });
          
          // Ensure we're in edit mode after image upload
          if (!editMode) {
            setEditMode(true);
            setIsEditing?.(true);
            
            // If we just entered edit mode, schedule auto-save for the new data
            const newData = {
              ...formData,
              imageUrl: data.imageUrl,
              imagePublicId: data.publicId
            };
            scheduleAutoSave(newData);
          }
          
          console.log('Image uploaded successfully:', data.imageUrl);
          console.log('After update - should show image now');
        } else {
          // For new blocks, we'll store the file temporarily and upload after block creation
          // Create a temporary URL for preview
          const tempUrl = URL.createObjectURL(file);
          handleFieldChange('imageUrl', tempUrl);
          
          // Store the file for later upload
          setPendingImageFile(file);
          
          console.log('Image prepared for upload after block creation');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        // In a real app, you would show this error to the user
        alert(error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setUploadingImage(false);
        // Clear the input value so the same file can be selected again
        event.target.value = '';
      }
    }
  };

  const getBlockTypeDisplay = (blockType: string) => {
    const types: Record<string, { label: string; color: string }> = {
      hero: { label: 'Hero Section', color: 'primary' },
      text: { label: 'Text Block', color: 'secondary' },
      image: { label: 'Image Block', color: 'success' },
      button: { label: 'Button', color: 'warning' },
      gallery: { label: 'Gallery', color: 'info' },
      contact: { label: 'Contact', color: 'error' },
      map: { label: 'Map', color: 'default' },
      features: { label: 'Features', color: 'primary' },
      cta: { label: 'Call to Action', color: 'secondary' }
    };
    return types[blockType] || { label: blockType, color: 'default' };
  };

  const renderBlockFields = () => {
    switch (block.blockType) {
      case 'hero':
        return (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hero Title"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hero Subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>Hero Content</Typography>
              <Box sx={{ 
                '& .ql-editor': { 
                  minHeight: '150px', 
                  backgroundColor: 'white',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  '@media (max-width: 768px)': {
                    fontSize: '16px', // Prevents zoom on iOS
                    minHeight: '120px'
                  }
                },
                '& .ql-toolbar': {
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: '#fafafa',
                  '@media (max-width: 768px)': {
                    fontSize: '12px',
                    padding: '8px'
                  }
                },
                '& .ql-container': {
                  border: '1px solid #e0e0e0',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px'
                },
                '& .ql-toolbar .ql-stroke': {
                  fill: 'none',
                  stroke: '#444'
                },
                '& .ql-toolbar .ql-fill': {
                  fill: '#444',
                  stroke: 'none'
                },
                '& .ql-toolbar button': {
                  '@media (max-width: 768px)': {
                    width: '28px',
                    height: '28px',
                    padding: '4px'
                  }
                },
                '& .ql-toolbar button:hover': {
                  backgroundColor: '#e3f2fd'
                },
                '& .ql-toolbar button.ql-active': {
                  backgroundColor: '#1976d2',
                  color: 'white'
                }
              }}>
                <ReactQuill
                  value={formData.content || ''}
                  onChange={(value) => handleFieldChange('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  placeholder="Enter your hero section content..."
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" gutterBottom>Hero Image</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={uploadingImage ? <CircularProgress size={16} /> : <UploadIcon />}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {formData.imageUrl && (
                    <Box
                      component="img"
                      src={formData.imageUrl}
                      alt="Hero"
                      sx={{ height: 60, objectFit: 'cover', borderRadius: 1 }}
                    />
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Button Text"
                value={formData.buttonText || ''}
                onChange={(e) => handleFieldChange('buttonText', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Button Link"
                value={formData.buttonLink || ''}
                onChange={(e) => handleFieldChange('buttonLink', e.target.value)}
              />
            </Grid>
          </>
        );

      case 'text':
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Section Title"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>Content</Typography>
              <Box sx={{ 
                '& .ql-editor': { 
                  minHeight: '200px', 
                  backgroundColor: 'white',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  '@media (max-width: 768px)': {
                    fontSize: '16px', // Prevents zoom on iOS
                    minHeight: '120px'
                  }
                },
                '& .ql-toolbar': {
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: '#fafafa',
                  '@media (max-width: 768px)': {
                    fontSize: '12px',
                    padding: '8px'
                  }
                },
                '& .ql-container': {
                  border: '1px solid #e0e0e0',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px'
                },
                '& .ql-toolbar .ql-stroke': {
                  fill: 'none',
                  stroke: '#444'
                },
                '& .ql-toolbar .ql-fill': {
                  fill: '#444',
                  stroke: 'none'
                },
                '& .ql-toolbar button': {
                  '@media (max-width: 768px)': {
                    width: '28px',
                    height: '28px',
                    padding: '4px'
                  }
                },
                '& .ql-toolbar button:hover': {
                  backgroundColor: '#e3f2fd'
                },
                '& .ql-toolbar button.ql-active': {
                  backgroundColor: '#1976d2',
                  color: 'white'
                }
              }}>
                <ReactQuill
                  value={formData.content || ''}
                  onChange={(value) => handleFieldChange('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  placeholder="Enter your content here..."
                />
              </Box>
            </Grid>
          </>
        );

      case 'image':
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image Caption"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" gutterBottom>Image</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={uploadingImage ? <CircularProgress size={16} /> : <UploadIcon />}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {formData.imageUrl && (
                    <Box
                      component="img"
                      src={formData.imageUrl}
                      alt="Content"
                      sx={{ height: 100, objectFit: 'cover', borderRadius: 1 }}
                    />
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Image Description"
                value={formData.content || ''}
                onChange={(e) => handleFieldChange('content', e.target.value)}
              />
            </Grid>
          </>
        );

      case 'button':
      case 'cta':
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Section Title"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={formData.content || ''}
                onChange={(e) => handleFieldChange('content', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Button Text"
                value={formData.buttonText || ''}
                onChange={(e) => handleFieldChange('buttonText', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Button Link"
                value={formData.buttonLink || ''}
                onChange={(e) => handleFieldChange('buttonLink', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Button Style</InputLabel>
                <Select
                  value={formData.buttonStyle || 'primary'}
                  onChange={(e) => handleFieldChange('buttonStyle', e.target.value)}
                  label="Button Style"
                >
                  <MenuItem value="primary">Primary</MenuItem>
                  <MenuItem value="secondary">Secondary</MenuItem>
                  <MenuItem value="outlined">Outlined</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        );

      default:
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>Content</Typography>
              <Box sx={{ 
                '& .ql-editor': { 
                  minHeight: '200px', 
                  backgroundColor: 'white',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  '@media (max-width: 768px)': {
                    fontSize: '16px', // Prevents zoom on iOS
                    minHeight: '120px'
                  }
                },
                '& .ql-toolbar': {
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: '#fafafa',
                  '@media (max-width: 768px)': {
                    fontSize: '12px',
                    padding: '8px'
                  }
                },
                '& .ql-container': {
                  border: '1px solid #e0e0e0',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px'
                },
                '& .ql-toolbar .ql-stroke': {
                  fill: 'none',
                  stroke: '#444'
                },
                '& .ql-toolbar .ql-fill': {
                  fill: '#444',
                  stroke: 'none'
                },
                '& .ql-toolbar button': {
                  '@media (max-width: 768px)': {
                    width: '28px',
                    height: '28px',
                    padding: '4px'
                  }
                },
                '& .ql-toolbar button:hover': {
                  backgroundColor: '#e3f2fd'
                },
                '& .ql-toolbar button.ql-active': {
                  backgroundColor: '#1976d2',
                  color: 'white'
                }
              }}>
                <ReactQuill
                  value={formData.content || ''}
                  onChange={(value) => handleFieldChange('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  placeholder="Enter your block content..."
                />
              </Box>
            </Grid>
          </>
        );
    }
  };

  const renderPreview = () => {
    const blockTypeInfo = getBlockTypeDisplay(block.blockType);
    
    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            {dragHandleProps && (
              <IconButton size="small" {...dragHandleProps}>
                <DragIcon />
              </IconButton>
            )}
            <Chip 
              label={blockTypeInfo.label} 
              color={blockTypeInfo.color as any}
              size="small" 
            />
            <Typography variant="h6">
              {block.title || 'Untitled Block'}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                  size="small"
                />
              }
              label="Active"
            />
            <IconButton size="small" onClick={() => setEditMode(true)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={onDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        {block.subtitle && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {block.subtitle}
          </Typography>
        )}

        {block.content && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            {block.content.replace(/<[^>]*>/g, '').substring(0, 100)}
            {block.content.length > 100 ? '...' : ''}
          </Typography>
        )}

        {block.imageUrl && (
          <Box sx={{ mb: 2 }}>
            <img
              src={block.imageUrl}
              alt={block.title || 'Content'}
              style={{ maxWidth: '200px', height: 'auto', borderRadius: 4 }}
            />
          </Box>
        )}

        {block.buttonText && (
          <Chip
            label={`Button: ${block.buttonText}`}
            variant="outlined"
            size="small"
          />
        )}
      </Box>
    );
  };

  // Live preview rendering - shows how content will look on customer portal
  const renderLivePreview = useMemo(() => {
    const currentData = { ...block, ...formData };
    
    return (
      <Box sx={{ 
        p: 3, 
        border: '2px solid #e3f2fd', 
        borderRadius: 2, 
        backgroundColor: '#fafafa',
        '& .preview-content': {
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            margin: '0.5em 0',
            color: '#1976d2'
          },
          '& p': {
            margin: '0.5em 0',
            lineHeight: 1.6
          },
          '& ul, & ol': {
            margin: '0.5em 0',
            paddingLeft: '1.5em'
          },
          '& blockquote': {
            borderLeft: '4px solid #1976d2',
            paddingLeft: '1em',
            margin: '1em 0',
            fontStyle: 'italic',
            backgroundColor: '#f5f5f5'
          }
        }
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          🔍 Live Preview - How this will look on your website
        </Typography>
        
        {/* Render based on block type */}
        {block.blockType === 'hero' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {currentData.imageUrl && (
              <Box sx={{ mb: 3 }}>
                <img
                  src={currentData.imageUrl}
                  alt={currentData.title || 'Hero image'}
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    borderRadius: 8,
                    maxHeight: '300px',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}
            <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#1976d2' }}>
              {currentData.title || 'Hero Title'}
            </Typography>
            {currentData.subtitle && (
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {currentData.subtitle}
              </Typography>
            )}
            {currentData.content && (
              <Box 
                className="preview-content"
                sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}
                dangerouslySetInnerHTML={{ __html: currentData.content }}
              />
            )}
            {currentData.buttonText && (
              <Button 
                variant="contained" 
                size="large" 
                sx={{ mt: 3 }}
                href={currentData.buttonLink || '#'}
              >
                {currentData.buttonText}
              </Button>
            )}
          </Box>
        )}

        {block.blockType === 'text' && (
          <Box>
            {currentData.title && (
              <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#1976d2' }}>
                {currentData.title}
              </Typography>
            )}
            {currentData.content && (
              <Box 
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: currentData.content }}
              />
            )}
          </Box>
        )}

        {block.blockType === 'image' && (
          <Box sx={{ textAlign: 'center' }}>
            {currentData.imageUrl && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={currentData.imageUrl}
                  alt={currentData.title || 'Content image'}
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    borderRadius: 8 
                  }}
                />
              </Box>
            )}
            {currentData.title && (
              <Typography variant="h6" gutterBottom>
                {currentData.title}
              </Typography>
            )}
            {currentData.content && (
              <Typography variant="body1" color="text.secondary">
                {currentData.content}
              </Typography>
            )}
          </Box>
        )}

        {(block.blockType === 'button' || block.blockType === 'cta') && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            {currentData.title && (
              <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#1976d2' }}>
                {currentData.title}
              </Typography>
            )}
            {currentData.content && (
              <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                {currentData.content}
              </Typography>
            )}
            {currentData.buttonText && (
              <Button 
                variant={currentData.buttonStyle === 'outlined' ? 'outlined' : 'contained'}
                color={currentData.buttonStyle === 'secondary' ? 'secondary' : 'primary'}
                size="large"
                href={currentData.buttonLink || '#'}
              >
                {currentData.buttonText}
              </Button>
            )}
          </Box>
        )}

        {/* Generic fallback for other block types */}
        {!['hero', 'text', 'image', 'button', 'cta'].includes(block.blockType) && (
          <Box>
            {currentData.title && (
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#1976d2' }}>
                {currentData.title}
              </Typography>
            )}
            {currentData.content && (
              <Box 
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: currentData.content }}
              />
            )}
            {currentData.imageUrl && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={currentData.imageUrl}
                  alt={currentData.title || 'Content'}
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: 4 }}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }, [block, formData]);

  if (!editMode) {
    return (
      <Paper sx={{ p: 3, mb: 2, opacity: formData.isActive ? 1 : 0.6 }}>
        {renderPreview()}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 2, border: '2px solid', borderColor: 'primary.main' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          {dragHandleProps && (
            <IconButton size="small" {...dragHandleProps}>
              <DragIcon />
            </IconButton>
          )}
          <Chip 
            label={getBlockTypeDisplay(block.blockType).label} 
            color="primary"
            size="small" 
          />
          <Typography variant="h6">Edit Block</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            size="small"
            onClick={handleCancel}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setShowPreview(!showPreview)}
            startIcon={<PreviewIcon />}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            disabled={saving || autoSaving}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? 'Saving...' : autoSaving ? 'Auto-saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

      {/* Auto-save status indicator */}
      {editMode && (
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          {autoSaving && (
            <>
              <CircularProgress size={12} />
              <Typography variant="caption" color="text.secondary">
                Auto-saving...
              </Typography>
            </>
          )}
          {lastSaved && !autoSaving && (
            <Typography variant="caption" color="text.secondary">
              Last saved: {lastSaved.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleFieldChange('isActive', e.target.checked)}
              />
            }
            label="Block Active"
          />
        </Grid>
        
        {showPreview ? (
          <Grid item xs={12}>
            {renderLivePreview}
          </Grid>
        ) : (
          renderBlockFields()
        )}
      </Grid>
    </Paper>
  );
};

export default ContentBlockEditor; 