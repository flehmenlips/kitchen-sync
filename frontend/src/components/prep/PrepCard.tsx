import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { PrepTask } from './types';
import { usePrepBoardStore } from '../../stores/prepBoardStore';
import { COLUMN_IDS } from '../../stores/prepBoardStore';
import RecipeDetailsDialog from '../RecipeDetail';

interface PrepCardProps {
    task: PrepTask;
}

const PrepCard: React.FC<PrepCardProps> = ({ task }) => {
    const { removeTask } = usePrepBoardStore();
    const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case COLUMN_IDS.TO_PREP:
                return '#1976d2'; // info
            case COLUMN_IDS.PREPPING:
                return '#ed6c02'; // warning
            case COLUMN_IDS.READY:
                return '#2e7d32'; // success
            case COLUMN_IDS.COMPLETE:
                return '#757575'; // default
            default:
                return '#757575';
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeTask(task.id);
    };

    return (
        <>
            <Card 
                sx={{ 
                    cursor: 'grab',
                    '&:hover': {
                        boxShadow: 3
                    },
                    borderLeft: 3,
                    borderColor: getStatusColor(task.status)
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="div" sx={{ fontSize: '1rem' }}>
                            {task.title}
                        </Typography>
                        <Box>
                            {task.recipeId && (
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRecipeDialogOpen(true);
                                    }}
                                    sx={{ mr: 1 }}
                                >
                                    <VisibilityIcon />
                                </IconButton>
                            )}
                            <IconButton 
                                size="small" 
                                onClick={handleDelete}
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    {task.description && (
                        <Typography variant="body2" color="text.secondary">
                            {task.description}
                        </Typography>
                    )}
                    {task.recipe && (
                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                            From recipe: {task.recipe.name}
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {task.recipeId && (
                <RecipeDetailsDialog
                    open={recipeDialogOpen}
                    onClose={() => setRecipeDialogOpen(false)}
                    recipeId={task.recipeId}
                />
            )}
        </>
    );
};

export default PrepCard; 