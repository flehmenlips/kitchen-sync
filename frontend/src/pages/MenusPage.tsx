import React, { useEffect, useState } from 'react';
import { getMenus, Menu, deleteMenu, archiveMenu, duplicateMenu } from '../services/apiService';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Button, Card, CardContent, CardActions, 
  Grid, IconButton, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Chip, CircularProgress, CardMedia,
  Paper, CardHeader, Tooltip, Divider, Avatar
} from '@mui/material';
import { 
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  ContentCopy as CopyIcon, Archive as ArchiveIcon, Print as PrintIcon,
  Restaurant as RestaurantIcon, MenuBook as MenuBookIcon
} from '@mui/icons-material';

const MenusPage: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  // Load the menus when component mounts
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const data = await getMenus();
        console.log('Fetched menus:', data);
        setMenus(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching menus:", err);
        setError("Failed to load menus. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  // Handle create new menu
  const handleCreateMenu = () => {
    navigate('/menus/new');
  };

  // Handle edit menu
  const handleEditMenu = (id: number) => {
    navigate(`/menus/${id}/edit`);
  };

  // Handle view/print menu
  const handleViewMenu = (id: number) => {
    navigate(`/menus/${id}`);
  };

  // Handle duplicate menu
  const handleDuplicateMenu = async (menu: Menu) => {
    try {
      setLoading(true);
      const newMenu = await duplicateMenu(menu.id);
      setMenus(prevMenus => [...prevMenus, newMenu]);
      setError(null);
    } catch (err) {
      console.error(`Error duplicating menu #${menu.id}:`, err);
      setError("Failed to duplicate menu. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle archive menu
  const handleArchiveMenu = async (menu: Menu) => {
    try {
      setLoading(true);
      await archiveMenu(menu.id);
      setMenus(prevMenus => prevMenus.filter(m => m.id !== menu.id));
      setError(null);
    } catch (err) {
      console.error(`Error archiving menu #${menu.id}:`, err);
      setError("Failed to archive menu. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete menu (confirmation dialog)
  const handleDeleteClick = (menu: Menu) => {
    setSelectedMenu(menu);
    setOpenDeleteDialog(true);
  };

  // Confirm delete menu
  const handleConfirmDelete = async () => {
    if (!selectedMenu) return;
    
    try {
      setLoading(true);
      await deleteMenu(selectedMenu.id);
      setMenus(prevMenus => prevMenus.filter(menu => menu.id !== selectedMenu.id));
      setError(null);
      setOpenDeleteDialog(false);
      setSelectedMenu(null);
    } catch (err) {
      console.error(`Error deleting menu #${selectedMenu.id}:`, err);
      setError("Failed to delete menu. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Close delete dialog
  const handleCloseDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedMenu(null);
  };

  // Function to render a preview of menu items
  const renderMenuPreview = (menu: Menu) => {
    // Count active sections to fix the section count bug
    const activeSections = menu.sections?.filter(section => !section.deleted && section.active) || [];
    const totalItems = activeSections.reduce((count, section) => {
      return count + (section.items?.filter(item => !item.deleted && item.active).length || 0);
    }, 0);

    // Return only first section and up to 3 items for preview
    const previewSection = activeSections[0];
    if (!previewSection) return null;

    const previewItems = previewSection.items?.filter(item => !item.deleted && item.active).slice(0, 3) || [];
    
    if (previewItems.length === 0) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: menu.accentColor || '#333333',
            borderBottom: menu.showSectionDividers ? `1px solid ${menu.accentColor || '#333333'}` : 'none',
            pb: 0.5,
            mb: 1,
            fontFamily: menu.font || 'inherit',
          }}
        >
          {previewSection.name}
        </Typography>
        
        {previewItems.map((item, index) => (
          <Box key={item.id || index} sx={{ mb: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: menu.font || 'inherit',
                  fontWeight: 'medium',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '70%'
                }}
              >
                {item.name}
              </Typography>
              {item.price && (
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {menu.showDollarSign ? '$' : ''}{item.price}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
        
        {/* Show ellipsis if there are more items */}
        {totalItems > 3 && (
          <Typography 
            variant="body2" 
            sx={{ 
              fontStyle: 'italic', 
              textAlign: 'center', 
              mt: 1 
            }}
          >
            + {totalItems - 3} more {totalItems - 3 === 1 ? 'item' : 'items'}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          pb: 2,
          borderBottom: '1px solid #eaeaea'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MenuBookIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Menu Builder
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateMenu}
          sx={{ borderRadius: 2 }}
        >
          Create New Menu
        </Button>
      </Box>

      {/* Error message */}
      {error && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Menu list */}
      {!loading && menus.length === 0 ? (
        <Paper 
          sx={{ 
            mt: 4, 
            p: 6, 
            textAlign: 'center',
            bgcolor: 'rgba(0,0,0,0.02)',
            borderRadius: 2
          }}
        >
          <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>No menus found</Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Create your first menu to get started with Menu Builder
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateMenu}
          >
            Create New Menu
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {menus.map((menu) => {
            // Count active, non-deleted sections
            const activeItemCount = (menu.sections || [])
              .filter(section => !section.deleted && section.active)
              .reduce((count, section) => {
                return count + (section.items?.filter(item => !item.deleted && item.active).length || 0);
              }, 0);
              
            const sectionCount = (menu.sections || [])
              .filter(section => !section.deleted && section.active).length;

            return (
              <Grid item xs={12} sm={6} md={4} key={menu.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    borderRadius: 2,
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardHeader
                    title={
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                        {menu.name}
                      </Typography>
                    }
                    subheader={menu.title}
                    action={
                      <IconButton 
                        onClick={() => handleViewMenu(menu.id)} 
                        color="primary"
                        aria-label="view menu"
                      >
                        <PrintIcon />
                      </IconButton>
                    }
                    sx={{ 
                      pb: 0,
                      '& .MuiCardHeader-action': {
                        margin: 0
                      }
                    }}
                  />
                  <Divider sx={{ mx: 2, my: 1 }} />
                  <CardContent sx={{ pt: 1, pb: 1, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        size="small" 
                        label={`${sectionCount} ${sectionCount === 1 ? 'Section' : 'Sections'}`} 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        size="small" 
                        label={`${activeItemCount} ${activeItemCount === 1 ? 'Item' : 'Items'}`}
                        variant="outlined"
                      />
                      {menu.font && (
                        <Chip 
                          size="small" 
                          label={menu.font}
                          variant="outlined"
                          sx={{ maxWidth: '100%', overflow: 'hidden' }}
                        />
                      )}
                    </Box>
                    
                    {/* Preview of menu content */}
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 1,
                        backgroundColor: menu.backgroundColor || '#ffffff',
                        color: menu.textColor || '#000000',
                        border: '1px solid #eaeaea',
                        minHeight: 100,
                        position: 'relative'
                      }}
                    >
                      {/* Logo preview if present */}
                      {menu.logoPath && (
                        <Box sx={{ textAlign: 'center', mb: 1 }}>
                          <img 
                            src={menu.logoPath} 
                            alt="Menu logo" 
                            style={{ 
                              maxWidth: '80px', 
                              maxHeight: '40px', 
                              objectFit: 'contain' 
                            }} 
                          />
                        </Box>
                      )}
                      
                      {renderMenuPreview(menu) || (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary', 
                            fontStyle: 'italic',
                            textAlign: 'center',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          No menu items to preview
                        </Typography>
                      )}
                    </Box>
                    
                    <Typography 
                      variant="caption" 
                      display="block" 
                      sx={{ mt: 1, color: 'text.secondary', textAlign: 'right' }}
                    >
                      Last updated: {new Date(menu.updatedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions 
                    sx={{ 
                      justifyContent: 'center', 
                      p: 1.5,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      gap: 0.5
                    }}
                  >
                    <Tooltip title="Edit">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditMenu(menu.id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Tooltip title="Duplicate">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDuplicateMenu(menu)}
                        color="default"
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Archive">
                      <IconButton 
                        size="small" 
                        onClick={() => handleArchiveMenu(menu)}
                        color="default"
                      >
                        <ArchiveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(menu)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Delete Menu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the menu "{selectedMenu?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MenusPage; 