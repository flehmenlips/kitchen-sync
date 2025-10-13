import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TableRestaurant as TableIcon,
  Person as PersonIcon
} from '@mui/icons-material';

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location: string;
  description?: string;
}

const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 2,
    location: '',
    description: ''
  });

  // Mock data for now
  useEffect(() => {
    const mockTables: Table[] = [
      {
        id: 1,
        name: 'Table 1',
        capacity: 2,
        status: 'available',
        location: 'Window Side',
        description: 'Intimate table by the window'
      },
      {
        id: 2,
        name: 'Table 2',
        capacity: 4,
        status: 'occupied',
        location: 'Center',
        description: 'Main dining area table'
      },
      {
        id: 3,
        name: 'Table 3',
        capacity: 6,
        status: 'reserved',
        location: 'Back Corner',
        description: 'Private corner table'
      },
      {
        id: 4,
        name: 'Table 4',
        capacity: 2,
        status: 'maintenance',
        location: 'Bar Area',
        description: 'Bar seating table'
      }
    ];
    
    setTimeout(() => {
      setTables(mockTables);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'error';
      case 'reserved': return 'warning';
      case 'maintenance': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'Available';
      case 'occupied': return 'Occupied';
      case 'reserved': return 'Reserved';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        name: table.name,
        capacity: table.capacity,
        location: table.location,
        description: table.description || ''
      });
    } else {
      setEditingTable(null);
      setFormData({
        name: '',
        capacity: 2,
        location: '',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTable(null);
    setFormData({
      name: '',
      capacity: 2,
      location: '',
      description: ''
    });
  };

  const handleSaveTable = () => {
    if (editingTable) {
      // Update existing table
      setTables(prev => prev.map(table => 
        table.id === editingTable.id 
          ? { ...table, ...formData, status: table.status }
          : table
      ));
    } else {
      // Create new table
      const newTable: Table = {
        id: Math.max(...tables.map(t => t.id)) + 1,
        ...formData,
        status: 'available'
      };
      setTables(prev => [...prev, newTable]);
    }
    handleCloseDialog();
  };

  const handleDeleteTable = (id: number) => {
    setTables(prev => prev.filter(table => table.id !== id));
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
          <Typography variant="h6" color="text.secondary">
            Loading tables...
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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
            <TableIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              fontWeight="800"
              sx={{
                background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 0.5
              }}
            >
              Tables Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Manage restaurant tables and seating arrangements
            </Typography>
          </Box>
        </Box>
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '16px',
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
            ml: 15,
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Add New Table
        </Button>
      </Box>

      {/* Tables Grid */}
      <Grid container spacing={3}>
        {tables.map((table) => (
          <Grid item xs={12} sm={6} md={4} key={table.id}>
            <Card sx={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                background: 'rgba(255,255,255,0.8)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                    borderRadius: '12px',
                    mr: 2
                  }}>
                    <TableIcon sx={{ fontSize: 24, color: '#64748b' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="700"
                      sx={{
                        background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {table.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {table.location}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(table.status)}
                    color={getStatusColor(table.status)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {table.capacity} seats
                    </Typography>
                  </Box>
                </Box>

                {table.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {table.description}
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ 
                p: 2, 
                pt: 0,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
              }}>
                <Tooltip title="Edit Table">
                  <IconButton 
                    onClick={() => handleOpenDialog(table)}
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
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Table">
                  <IconButton 
                    onClick={() => handleDeleteTable(table.id)}
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
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Table Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <Typography 
            variant="h6" 
            fontWeight="700"
            sx={{
              background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {editingTable ? 'Edit Table' : 'Add New Table'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              label="Table Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
            />
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 2 })}
              fullWidth
              variant="outlined"
              inputProps={{ min: 1, max: 20 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
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
            onClick={handleSaveTable}
            disabled={!formData.name || !formData.location}
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
            {editingTable ? 'Update Table' : 'Create Table'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TablesPage;
