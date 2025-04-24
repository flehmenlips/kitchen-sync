import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import { PrepTask } from './types';
import { useNavigate } from 'react-router-dom';

interface PrepCardProps {
    task: PrepTask;
    onDelete: (taskId: string) => void;
}

const PrepCard: React.FC<PrepCardProps> = ({ task, onDelete }) => {
    const navigate = useNavigate();

    const handleViewRecipe = () => {
        if (task.recipeId) {
            navigate(`/recipe/${task.recipeId}`);
        }
    };

    return (
        <Card sx={{ 
            width: '100%', 
            mb: 1,
            backgroundColor: '#fff',
            '&:hover': {
                backgroundColor: '#f5f5f5',
            }
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="div" gutterBottom>
                            {task.title}
                        </Typography>
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
                    </Box>
                    <Box>
                        {task.recipeId && (
                            <IconButton 
                                size="small" 
                                onClick={handleViewRecipe}
                                sx={{ mr: 1 }}
                            >
                                <VisibilityIcon />
                            </IconButton>
                        )}
                        <IconButton 
                            size="small" 
                            onClick={() => onDelete(task.id)}
                            color="error"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PrepCard; 