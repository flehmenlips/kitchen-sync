import React, { useEffect, useState } from 'react';
import { getMenus, Menu, deleteMenu, archiveMenu, duplicateMenu } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Card, CardContent, CardActions, 
  Grid, IconButton, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Chip, CircularProgress,
  Paper, CardHeader, Tooltip
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
    <Box sx={{ 
      width: '100%', 
      px: { xs: 2, sm: 3, md: 4 }, 
      mt: 4, 
      mb: 6,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh'
    }}>
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
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              <MenuBookIcon sx={{ fontSize: 32, color: 'white' }} />
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
                Menu Builder
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create and manage your restaurant menus
              </Typography>
            </Box>
          </Box>
          <Button 
            startIcon={<AddIcon />}
            onClick={handleCreateMenu}
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
            Create New Menu
          </Button>
        </Box>
      </Paper>

      {/* Error message */}
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

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          mt: 8,
          mb: 8
        }}>
          <Paper sx={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            p: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress size={24} />
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              Loading menus...
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Menu list */}
      {!loading && menus.length === 0 ? (
        <Paper 
          sx={{ 
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '24px',
            p: 8, 
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
            borderRadius: '30px',
            mx: 'auto',
            mb: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
          }}>
            <RestaurantIcon sx={{ fontSize: 60, color: '#64748b' }} />
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 2,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            No menus found
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
            Create your first menu to get started with Menu Builder
          </Typography>
          <Button 
            startIcon={<AddIcon />}
            onClick={handleCreateMenu}
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
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      background: 'rgba(255,255,255,0.8)'
                    }
                  }}
                >
                  <CardHeader
                    title={
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        {menu.name}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {menu.title}
                      </Typography>
                    }
                    action={
                      <IconButton 
                        onClick={() => handleViewMenu(menu.id)} 
                        sx={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          width: '40px',
                          height: '40px',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                        aria-label="view menu"
                      >
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ 
                      pb: 1,
                      pt: 2,
                      px: 3,
                      '& .MuiCardHeader-action': {
                        margin: 0
                      }
                    }}
                  />
                  <Box sx={{ 
                    height: '1px', 
                    background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
                    mx: 3,
                    my: 1
                  }} />
                  <CardContent sx={{ pt: 1, pb: 1, flexGrow: 1, px: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        size="small" 
                        label={`${sectionCount} ${sectionCount === 1 ? 'Section' : 'Sections'}`} 
                        sx={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          color: 'white',
                          fontWeight: 600,
                          borderRadius: '8px'
                        }}
                      />
                      <Chip 
                        size="small" 
                        label={`${activeItemCount} ${activeItemCount === 1 ? 'Item' : 'Items'}`}
                        sx={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          fontWeight: 600,
                          borderRadius: '8px'
                        }}
                      />
                      {menu.font && (
                        <Chip 
                          size="small" 
                          label={menu.font}
                          sx={{ 
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: '#8b5cf6',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            fontWeight: 600,
                            borderRadius: '8px',
                            maxWidth: '100%', 
                            overflow: 'hidden' 
                          }}
                        />
                      )}
                    </Box>
                    
                    {/* Preview of menu content */}
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: '12px',
                        backgroundColor: menu.backgroundColor || '#ffffff',
                        color: menu.textColor || '#000000',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        minHeight: 120,
                        position: 'relative',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        backdropFilter: 'blur(10px)'
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
                      justifyContent: 'space-between', 
                      p: 2,
                      pt: 1,
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                      gap: 1
                    }}
                  >
                    <Tooltip title="Edit">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditMenu(menu.id)}
                        sx={{ 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          px: 2,
                          py: 0.5,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Duplicate">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDuplicateMenu(menu)}
                          sx={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            borderRadius: '8px',
                            '&:hover': {
                              background: 'rgba(59, 130, 246, 0.2)',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Archive">
                        <IconButton 
                          size="small" 
                          onClick={() => handleArchiveMenu(menu)}
                          sx={{
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: '#8b5cf6',
                            borderRadius: '8px',
                            '&:hover': {
                              background: 'rgba(139, 92, 246, 0.2)',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ArchiveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(menu)}
                          sx={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            borderRadius: '8px',
                            '&:hover': {
                              background: 'rgba(239, 68, 68, 0.2)',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
    </Box>
  );
};

export default MenusPage; 