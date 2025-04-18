import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getUnits, UnitOfMeasure, deleteUnit } from '../services/apiService';

// Import MUI components
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Stack from '@mui/material/Stack';

const UnitListPage: React.FC = () => {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ [key: number]: string | null }>({});
  const [isDeleting, setIsDeleting] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const data = await getUnits();
        setUnits(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch units. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const handleDelete = async (unit: UnitOfMeasure) => {
    if (window.confirm(`Are you sure you want to delete unit "${unit.name}"? This cannot be undone if the unit is in use.`)) {
        setIsDeleting(prev => ({ ...prev, [unit.id]: true }));
        setDeleteError(prev => ({ ...prev, [unit.id]: null }));
        try {
            await deleteUnit(unit.id);
            console.log('Unit deleted successfully');
            setUnits(prevUnits => prevUnits.filter(u => u.id !== unit.id));
        } catch (err: any) {
            console.error('Failed to delete unit:', err);
            setDeleteError(prev => ({ ...prev, [unit.id]: err.response?.data?.message || err.message || 'Failed to delete unit.' }));
        } finally {
             setIsDeleting(prev => ({ ...prev, [unit.id]: false }));
        }
    }
  };

  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
         <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link component={RouterLink} underline="hover" color="inherit" to="/">
                KitchenSync
            </Link>
            <Typography color="text.primary">Units of Measure</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
                Units of Measure
            </Typography>
            <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                component={RouterLink} 
                to="/units/new"
            >
                Add Unit
            </Button>
        </Box>
      
        {units.length === 0 ? (
            <Typography sx={{ mt: 2 }}>No units found.</Typography>
        ) : (
            <List>
                {units.map((unit) => (
                    <ListItem 
                        key={unit.id} 
                        disablePadding
                        secondaryAction={
                            <Stack direction="row" spacing={1}>
                                <IconButton 
                                    edge="end" 
                                    aria-label="edit" 
                                    component={RouterLink} 
                                    to={`/units/${unit.id}/edit`}
                                    size="small"
                                >
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                                <IconButton 
                                    edge="end" 
                                    aria-label="delete" 
                                    onClick={() => handleDelete(unit)}
                                    disabled={isDeleting[unit.id]}
                                    color="error"
                                    size="small"
                                >
                                   {isDeleting[unit.id] ? <CircularProgress size={16} color="inherit"/> : <DeleteIcon fontSize="small"/>}
                                </IconButton>
                            </Stack>
                        }
                    >
                        <ListItemText
                            primary={`${unit.name}${unit.abbreviation ? ` (${unit.abbreviation})` : ''}`}
                            secondary={`Type: ${unit.type || 'N/A'} | ID: ${unit.id}`}
                        />
                    </ListItem>
                ))}
            </List>
        )}
        {Object.entries(deleteError).map(([id, msg]) => 
            msg ? <Alert severity="error" key={id} sx={{ mt: 1 }}>Error deleting unit {id}: {msg}</Alert> : null
        )}
    </Container>
  );
};

export default UnitListPage; 