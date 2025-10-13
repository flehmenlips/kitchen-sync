import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Divider,
    Card,
    CardContent,
} from '@mui/material';
import {
    Close as CloseIcon,
    Restaurant as RestaurantIcon,
    List as ListIcon,
    PlayArrow as PlayArrowIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Recipe } from '../../types/recipe';
import { usePrepBoardStore } from '../../stores/prepBoardStore';

interface RecipeDetailProps {
    recipe: Recipe;
    open: boolean;
    onClose: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, open, onClose }) => {
    const { columns, addTask } = usePrepBoardStore();
    const [selectedColumn, setSelectedColumn] = useState('');
    const [notes, setNotes] = useState('');

    const handleAddToPrep = async () => {
        if (!selectedColumn) return;

        try {
            await addTask({
                title: recipe.name,
                description: notes,
                recipeId: parseInt(recipe.id),
                columnId: selectedColumn,
            });
            onClose();
            setSelectedColumn('');
            setNotes('');
        } catch (error) {
            console.error('Failed to add recipe to prep board:', error);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }
            }}
        >
            {/* Hero Header */}
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #e0f2fe 0%, #c5e1ff 100%)',
                borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                p: 3
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                            <RestaurantIcon sx={{ fontSize: 24, color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography 
                                variant="h5" 
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
                                {recipe.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Recipe Details & Prep Planning
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton 
                        onClick={onClose}
                        sx={{
                            background: 'rgba(255,255,255,0.5)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            '&:hover': {
                                background: 'rgba(255,255,255,0.8)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Recipe Info Cards */}
                <Box sx={{ p: 3, pb: 2 }}>
                    <Box display="flex" gap={2} mb={3}>
                        <Card sx={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '16px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                        }}>
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <ScheduleIcon sx={{ fontSize: 32, color: '#3b82f6', mb: 1 }} />
                                <Typography variant="h6" fontWeight="700" color="#1e40af">
                                    N/A
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Servings
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '16px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                        }}>
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <ListIcon sx={{ fontSize: 32, color: '#8b5cf6', mb: 1 }} />
                                <Typography variant="h6" fontWeight="700" color="#1e40af">
                                    {recipe.ingredients?.length || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ingredients
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(59, 130, 246, 0.1)' }} />

                {/* Recipe Content */}
                <Box sx={{ p: 3 }}>
                    {/* Description */}
                    {recipe.description && (
                        <Paper sx={{
                            p: 3,
                            mb: 3,
                            background: 'rgba(255,255,255,0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '16px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                        }}>
                            <Typography 
                                variant="h6" 
                                gutterBottom
                                fontWeight="700"
                                sx={{
                                    background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    mb: 2
                                }}
                            >
                                Description
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                {recipe.description}
                            </Typography>
                        </Paper>
                    )}

                    {/* Ingredients */}
                    <Paper sx={{
                        p: 3,
                        mb: 3,
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    }}>
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            fontWeight="700"
                            sx={{
                                background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                mb: 2
                            }}
                        >
                            Ingredients
                        </Typography>
                        {recipe.ingredients && recipe.ingredients.length > 0 ? (
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                {recipe.ingredients.map((ingredient, index) => (
                                    <Box 
                                        component="li" 
                                        key={index}
                                        sx={{
                                            mb: 1,
                                            color: 'text.secondary',
                                            fontSize: '1rem',
                                            lineHeight: 1.5
                                        }}
                                    >
                                        {ingredient}
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No ingredients listed
                            </Typography>
                        )}
                    </Paper>

                    {/* Instructions */}
                    <Paper sx={{
                        p: 3,
                        mb: 3,
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    }}>
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            fontWeight="700"
                            sx={{
                                background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                mb: 2
                            }}
                        >
                            Instructions
                        </Typography>
                        {recipe.instructions && recipe.instructions.length > 0 ? (
                            <Box component="ol" sx={{ m: 0, pl: 2 }}>
                                {recipe.instructions.map((instruction, index) => (
                                    <Box 
                                        component="li" 
                                        key={index}
                                        sx={{
                                            mb: 2,
                                            color: 'text.secondary',
                                            fontSize: '1rem',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {instruction}
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No instructions available
                            </Typography>
                        )}
                    </Paper>

                    {/* Add to Prep Board Section */}
                    <Paper sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    }}>
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            fontWeight="700"
                            sx={{
                                background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <PlayArrowIcon />
                            Add to Prep Board
                        </Typography>
                        
                        <FormControl 
                            fullWidth 
                            sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    background: 'rgba(255,255,255,0.8)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.9)'
                                    }
                                }
                            }}
                        >
                            <InputLabel>Select Column</InputLabel>
                            <Select
                                value={selectedColumn}
                                onChange={(e) => setSelectedColumn(e.target.value)}
                                label="Select Column"
                            >
                                {columns.map((column) => (
                                    <MenuItem key={column.id} value={column.id}>
                                        {column.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Prep Notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: 'rgba(255,255,255,0.8)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.9)'
                                    }
                                }
                            }}
                        />
                    </Paper>
                </Box>
            </DialogContent>

            <DialogActions sx={{
                background: 'linear-gradient(135deg, #e0f2fe 0%, #c5e1ff 100%)',
                borderTop: '1px solid rgba(59, 130, 246, 0.2)',
                p: 3
            }}>
                <Button 
                    onClick={onClose}
                    sx={{ 
                        color: '#1e40af',
                        fontWeight: 600,
                        px: 3,
                        py: 1
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleAddToPrep}
                    variant="contained"
                    disabled={!selectedColumn}
                    startIcon={<PlayArrowIcon />}
                    sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                            transform: 'translateY(-1px)'
                        },
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        borderRadius: '12px',
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        '&:disabled': {
                            background: 'rgba(0,0,0,0.12)',
                            color: 'rgba(0,0,0,0.26)'
                        }
                    }}
                >
                    Add to Prep Board
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 