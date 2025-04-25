import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { PrepTask } from './types';
import { COLUMN_IDS } from '../../stores/prepBoardStore';

interface PrepCardProps {
    task: PrepTask;
    onDelete: (taskId: string) => void;
    onViewRecipe: (taskId: string) => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case COLUMN_IDS.TO_PREP:
            return 'info';
        case COLUMN_IDS.PREPPING:
            return 'warning';
        case COLUMN_IDS.READY:
            return 'success';
        case COLUMN_IDS.COMPLETE:
            return 'default';
        default:
            return 'default';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case COLUMN_IDS.TO_PREP:
            return 'To Prep';
        case COLUMN_IDS.PREPPING:
            return 'Prepping';
        case COLUMN_IDS.READY:
            return 'Ready';
        case COLUMN_IDS.COMPLETE:
            return 'Complete';
        default:
            return status;
    }
};

const PrepCard: React.FC<PrepCardProps> = ({ task, onDelete, onViewRecipe }) => {
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
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {task.description}
                            </Typography>
                        )}
                        <Chip 
                            label={getStatusLabel(task.status)}
                            color={getStatusColor(task.status)}
                            size="small"
                            sx={{ mt: 1 }}
                        />
                    </Box>
                    <Box>
                        {task.recipeId && (
                            <IconButton 
                                size="small" 
                                onClick={() => onViewRecipe(task.id)}
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