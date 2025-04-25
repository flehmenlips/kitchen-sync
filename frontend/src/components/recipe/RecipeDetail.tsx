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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
                recipeId: recipe.id,
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
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{recipe.name}</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Description
                    </Typography>
                    <Typography variant="body1">
                        {recipe.description || 'No description available'}
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Ingredients
                    </Typography>
                    <Typography variant="body1" component="div">
                        {recipe.ingredients ? (
                            <ul>
                                {recipe.ingredients.map((ingredient, index) => (
                                    <li key={index}>{ingredient}</li>
                                ))}
                            </ul>
                        ) : (
                            'No ingredients listed'
                        )}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="subtitle1" gutterBottom>
                        Instructions
                    </Typography>
                    <Typography variant="body1" component="div">
                        {recipe.instructions ? (
                            <ol>
                                {recipe.instructions.map((instruction, index) => (
                                    <li key={index}>{instruction}</li>
                                ))}
                            </ol>
                        ) : (
                            'No instructions available'
                        )}
                    </Typography>
                </Box>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Add to Prep Board
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
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
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleAddToPrep}
                    variant="contained"
                    disabled={!selectedColumn}
                >
                    Add to Prep Board
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 