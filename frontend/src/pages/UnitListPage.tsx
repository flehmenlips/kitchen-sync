import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getUnits, UnitOfMeasure } from '../services/apiService';

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

const UnitListPage: React.FC = () => {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
                    <ListItem key={unit.id} disablePadding>
                        {/* TODO: Make these clickable to an edit page later? */}
                        <ListItemText
                            primary={`${unit.name}${unit.abbreviation ? ` (${unit.abbreviation})` : ''}`}
                            secondary={`Type: ${unit.type || 'N/A'} | ID: ${unit.id}`}
                        />
                        {/* TODO: Add Edit/Delete Icons/Buttons */}
                    </ListItem>
                ))}
            </List>
        )}
    </Container>
  );
};

export default UnitListPage; 