import React, { useEffect, useState } from 'react';
import { getMenus, Menu, deleteMenu, archiveMenu, duplicateMenu } from '../services/apiService';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Button, Card, CardContent, CardActions, 
  Grid, IconButton, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Chip, CircularProgress 
} from '@mui/material';
import { 
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  ContentCopy as CopyIcon, Archive as ArchiveIcon, Print as PrintIcon 
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Menus
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateMenu}
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
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6">No menus found</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Create your first menu to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {menus.map((menu) => (
            <Grid item xs={12} sm={6} md={4} key={menu.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {menu.name}
                  </Typography>
                  {menu.title && (
                    <Typography variant="body1" color="text.secondary">
                      Title: {menu.title}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Sections: {menu.sections?.length || 0}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    Last updated: {new Date(menu.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleViewMenu(menu.id)}
                      title="View & Print"
                    >
                      <PrintIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleEditMenu(menu.id)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDuplicateMenu(menu)}
                      title="Duplicate"
                    >
                      <CopyIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleArchiveMenu(menu)}
                      title="Archive"
                    >
                      <ArchiveIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteClick(menu)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
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