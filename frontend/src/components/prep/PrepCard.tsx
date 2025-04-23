import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { PrepTask } from './types';
import { usePrepBoardStore } from '../../stores/prepBoardStore';

interface PrepCardProps {
    task: PrepTask;
    onClick?: () => void;
    onViewRecipe?: () => void;
}

const PrepCard: React.FC<PrepCardProps> = ({ task, onClick, onViewRecipe }) => {
    const { removeTask } = usePrepBoardStore();

    const getPriorityColor = (priority: PrepTask['priority']) => {
        switch (priority) {
            case 'HIGH':
                return 'error';
            case 'MEDIUM':
                return 'warning';
            case 'LOW':
                return 'success';
            default:
                return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'to-prep':
                return 'info';
            case 'prepping':
                return 'warning';
            case 'ready':
                return 'success';
            case 'complete':
                return 'default';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'to-prep':
                return 'To Prep';
            case 'prepping':
                return 'Prepping';
            case 'ready':
                return 'Ready';
            case 'complete':
                return 'Complete';
            default:
                return status;
        }
    };

    const handleViewRecipe = (e: React.MouseEvent) => {
        e.stopPropagation();
        onViewRecipe?.();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeTask(task.id);
    };

    return (
        <Card 
            onClick={onClick}
            sx={{ 
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: 3
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                        {task.recipeName}
                    </Typography>
                    <Box>
                        <IconButton 
                            size="small" 
                            onClick={handleViewRecipe}
                            sx={{ mr: 1 }}
                        >
                            <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                            size="small" 
                            onClick={handleDelete}
                            color="error"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {task.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip 
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                    />
                    <Chip 
                        label={getStatusLabel(task.status)}
                        color={getStatusColor(task.status)}
                        size="small"
                        variant="outlined"
                    />
                    {task.assignedTo && (
                        <Chip
                            label={task.assignedTo}
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default PrepCard; 