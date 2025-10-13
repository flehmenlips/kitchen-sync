import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, TextField, Button, CircularProgress,
  Divider, Grid, IconButton, Tabs, Tab, FormControlLabel, Switch,
  Select, MenuItem as MuiMenuItem, InputLabel, FormControl, SelectChangeEvent
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { createMenu, getMenuById, updateMenu, uploadMenuLogo, MenuFormData } from '../services/apiService';
import MenuSectionsEditor from '../components/menu/MenuSectionsEditor';
import { menuFonts } from '../theme';

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
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Use the menuFonts object from theme.ts
function getFontFamily(font?: string | null): string {
  return menuFonts[font as keyof typeof menuFonts] || menuFonts['Playfair Display'];
}

const MenuFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [menu, setMenu] = useState<MenuFormData>({
    name: '',
    title: '',
    subtitle: '',
    font: 'Playfair Display',
    fontSize: 'normal',
    layout: 'single',
    showDollarSign: true,
    showDecimals: true,
    showSectionDividers: true,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#333333',
    logoPath: null,
    sections: []
  });

  // Load menu data if editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchMenu = async () => {
        try {
          setLoading(true);
          const menuData = await getMenuById(parseInt(id));
          
          // Set logo preview if menu has a logo
          if (menuData.logoPath) {
            setLogoPreview(menuData.logoPath);
          }
          
          // Convert Menu to MenuFormData format
          setMenu({
            name: menuData.name,
            title: menuData.title || '',
            subtitle: menuData.subtitle || '',
            font: menuData.font || 'Playfair Display',
            fontSize: menuData.fontSize || 'normal',
            layout: menuData.layout || 'single',
            showDollarSign: menuData.showDollarSign,
            showDecimals: menuData.showDecimals,
            showSectionDividers: menuData.showSectionDividers,
            backgroundColor: menuData.backgroundColor || '#ffffff',
            textColor: menuData.textColor || '#000000',
            accentColor: menuData.accentColor || '#333333',
            logoPath: menuData.logoPath || null,
            sections: menuData.sections || []
          });
          
          setError(null);
        } catch (err) {
          console.error(`Error fetching menu #${id}:`, err);
          setError("Failed to load menu data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchMenu();
    }
  }, [id, isEditing]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs differently
    const inputValue = type === 'checkbox' ? checked : value;
    
    setMenu(prev => ({
      ...prev,
      [name]: inputValue
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    setMenu(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        setLogoPreview(e.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
    
    // If we're editing, upload the logo immediately
    if (isEditing && id) {
      try {
        setUploadingLogo(true);
        setError(null);
        
        const response = await uploadMenuLogo(parseInt(id), file);
        
        // Update the menu with the new logo path
        setMenu(prev => ({
          ...prev,
          logoPath: response.logoUrl
        }));
        
      } catch (err) {
        console.error("Error uploading logo:", err);
        setError("Failed to upload logo. Please try again.");
      } finally {
        setUploadingLogo(false);
      }
    } else {
      // For new menus, we'll submit the logo after the menu is created
      // Just keep the preview for now
    }
  };
  
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setMenu(prev => ({
      ...prev,
      logoPath: null
    }));
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Basic validation
      if (!menu.name) {
        setError("Menu name is required");
        setSaving(false);
        return;
      }
      
      if (isEditing && id) {
        await updateMenu(parseInt(id), menu);
      } else {
        await createMenu(menu);
      }
      
      // Navigate back to menu list after success
      navigate('/menus');
      
    } catch (err) {
      console.error("Error saving menu:", err);
      setError("Failed to save menu. Please try again.");
    } finally {
      setSaving(false);
    }
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
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <CircularProgress size={24} />
          <Typography variant="body1" color="text.secondary" fontWeight="500">
            Loading menu...
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
        {/* Hero Header Section */}
        <Paper sx={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '24px',
          p: 4,
          mb: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => navigate('/menus')}
              sx={{
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                borderRadius: '12px',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.2)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
              aria-label="back to menus"
            >
              <ArrowBackIcon />
            </IconButton>
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
                {isEditing ? 'Edit Menu' : 'Create New Menu'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isEditing ? 'Update your menu settings and content' : 'Design and customize your restaurant menu'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Paper sx={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px',
            p: 3,
            mb: 3,
            backdropFilter: 'blur(20px)'
          }}>
            <Typography color="error" fontWeight="600">{error}</Typography>
          </Paper>
        )}

        <Paper sx={{ 
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.1)'
          }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="menu form tabs"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: '12px 12px 0 0',
                  mx: 0.5,
                  '&.Mui-selected': {
                    background: 'rgba(255,255,255,0.8)',
                    color: '#1e40af'
                  }
                }
              }}
            >
              <Tab label="Basic Information" />
              <Tab label="Layout & Style" />
              <Tab label="Content" />
            </Tabs>
          </Box>

        <form onSubmit={handleSubmit}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Menu Name"
                  name="name"
                  value={menu.name}
                  onChange={handleInputChange}
                  helperText="Internal name for this menu"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Menu Title"
                  name="title"
                  value={menu.title || ''}
                  onChange={handleInputChange}
                  helperText="Main title displayed on the menu"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Menu Subtitle"
                  name="subtitle"
                  value={menu.subtitle || ''}
                  onChange={handleInputChange}
                  helperText="Subtitle or tagline"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Typography & Layout
                </Typography>
                
                {/* Logo Upload Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Menu Logo
                  </Typography>
                  
                  <input
                    ref={fileInputRef}
                    accept="image/*"
                    id="logo-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 2,
                    border: '1px dashed #ccc',
                    borderRadius: 1,
                    mb: 2,
                    minHeight: 150,
                    position: 'relative'
                  }}>
                    {uploadingLogo && (
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        zIndex: 10
                      }}>
                        <CircularProgress />
                      </Box>
                    )}
                    
                    {logoPreview ? (
                      <>
                        <img 
                          src={logoPreview} 
                          alt="Menu Logo Preview" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: 120, 
                            objectFit: 'contain'
                          }} 
                        />
                        <IconButton 
                          color="error" 
                          onClick={handleRemoveLogo}
                          sx={{ mt: 1 }}
                          disabled={uploadingLogo}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Upload your restaurant logo
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      htmlFor="logo-upload"
                      startIcon={<CloudUploadIcon />}
                      disabled={uploadingLogo}
                    >
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                  </Box>
                </Box>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="font-select-label">Font</InputLabel>
                  <Select
                    labelId="font-select-label"
                    name="font"
                    value={menu.font || 'Playfair Display'}
                    onChange={handleSelectChange}
                    label="Font"
                  >
                    <MuiMenuItem value="Playfair Display">Playfair Display (Elegant)</MuiMenuItem>
                    <MuiMenuItem value="Roboto">Roboto (Modern)</MuiMenuItem>
                    <MuiMenuItem value="Lora">Lora (Classic)</MuiMenuItem>
                    <MuiMenuItem value="Montserrat">Montserrat (Contemporary)</MuiMenuItem>
                    <MuiMenuItem value="Oswald">Oswald (Bold)</MuiMenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="font-size-select-label">Font Size</InputLabel>
                  <Select
                    labelId="font-size-select-label"
                    name="fontSize"
                    value={menu.fontSize || 'normal'}
                    onChange={handleSelectChange}
                    label="Font Size"
                  >
                    <MuiMenuItem value="small">Small (Compact)</MuiMenuItem>
                    <MuiMenuItem value="normal">Normal</MuiMenuItem>
                    <MuiMenuItem value="large">Large</MuiMenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="layout-select-label">Layout</InputLabel>
                  <Select
                    labelId="layout-select-label"
                    name="layout"
                    value={menu.layout || 'single'}
                    onChange={handleSelectChange}
                    label="Layout"
                  >
                    <MuiMenuItem value="single">Single Column</MuiMenuItem>
                    <MuiMenuItem value="double">Two Columns</MuiMenuItem>
                    <MuiMenuItem value="grid">Grid Layout</MuiMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Color Scheme
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <InputLabel htmlFor="background-color">Background Color</InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        backgroundColor: menu.backgroundColor || '#ffffff',
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        mr: 2
                      }} 
                    />
                    <TextField
                      id="background-color"
                      name="backgroundColor"
                      value={menu.backgroundColor || '#ffffff'}
                      onChange={handleInputChange}
                      size="small"
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <InputLabel htmlFor="text-color">Text Color</InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        backgroundColor: menu.textColor || '#000000',
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        mr: 2
                      }} 
                    />
                    <TextField
                      id="text-color"
                      name="textColor"
                      value={menu.textColor || '#000000'}
                      onChange={handleInputChange}
                      size="small"
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <InputLabel htmlFor="accent-color">Accent Color</InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        backgroundColor: menu.accentColor || '#333333',
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        mr: 2
                      }} 
                    />
                    <TextField
                      id="accent-color"
                      name="accentColor"
                      value={menu.accentColor || '#333333'}
                      onChange={handleInputChange}
                      size="small"
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Display Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={menu.showDollarSign !== false}
                          onChange={handleInputChange}
                          name="showDollarSign"
                        />
                      }
                      label="Show Dollar Sign ($)"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={menu.showDecimals !== false}
                          onChange={handleInputChange}
                          name="showDecimals"
                        />
                      }
                      label="Show Decimal Places"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={menu.showSectionDividers !== false}
                          onChange={handleInputChange}
                          name="showSectionDividers"
                        />
                      }
                      label="Show Section Dividers"
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Preview
                  </Typography>
                  <Box 
                    sx={{ 
                      p: 3, 
                      backgroundColor: menu.backgroundColor || '#ffffff',
                      color: menu.textColor || '#000000',
                      borderRadius: 1,
                      fontFamily: getFontFamily(menu.font),
                      position: 'relative',
                      fontSize: menu.fontSize === 'small' ? '0.85em' : menu.fontSize === 'large' ? '1.15em' : '1em'
                    }}
                  >
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        textAlign: 'center',
                        mb: 1,
                        fontSize: menu.fontSize === 'small' ? '1.8rem' : menu.fontSize === 'large' ? '2.5rem' : '2.2rem'
                      }}
                    >
                      {menu.title || 'Sample Menu'}
                    </Typography>
                    {menu.subtitle && (
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          textAlign: 'center',
                          mb: 2,
                          fontStyle: 'italic',
                          fontSize: menu.fontSize === 'small' ? '0.9rem' : menu.fontSize === 'large' ? '1.2rem' : '1rem'
                        }}
                      >
                        {menu.subtitle}
                      </Typography>
                    )}
                    {menu.showSectionDividers && <Divider sx={{ mb: 2, borderColor: menu.accentColor || '#333333' }} />}
                    <Typography variant="h6" sx={{ 
                      color: menu.accentColor || '#333333',
                      fontSize: menu.fontSize === 'small' ? '1.1rem' : menu.fontSize === 'large' ? '1.5rem' : '1.25rem'
                    }}>
                      Sample Section
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                      <Box>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 'bold',
                          fontSize: menu.fontSize === 'small' ? '0.9rem' : menu.fontSize === 'large' ? '1.2rem' : '1rem'
                        }}>
                          Sample Item
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontSize: menu.fontSize === 'small' ? '0.8rem' : menu.fontSize === 'large' ? '1.1rem' : '0.9rem'
                        }}>
                          Description of the item goes here
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{
                        fontWeight: 'bold',
                        fontSize: menu.fontSize === 'small' ? '0.9rem' : menu.fontSize === 'large' ? '1.2rem' : '1rem'
                      }}>
                        {menu.showDollarSign ? '$' : ''}{menu.showDecimals ? '12.95' : '13'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <MenuSectionsEditor 
              sections={menu.sections || []}
              onChange={(newSections) => setMenu(prev => ({ ...prev, sections: newSections }))}
            />
          </TabPanel>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={() => navigate('/menus')}
              sx={{ 
                mr: 2,
                color: '#6b7280',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                borderRadius: '12px',
                px: 3,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.5)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '12px',
                px: 4,
                py: 1,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  background: 'rgba(107, 114, 128, 0.3)',
                  boxShadow: 'none',
                  transform: 'none'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {saving ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Saving...
                </>
              ) : isEditing ? 'Update Menu' : 'Create Menu'}
            </Button>
          </Box>
        </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default MenuFormPage; 