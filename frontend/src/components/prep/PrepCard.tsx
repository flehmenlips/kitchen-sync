import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { PrepTask } from '../../types/prep';

interface PrepCardProps {
    task: PrepTask;
    index: number;
    onDelete: (taskId: string) => void;
    onViewRecipe: (taskId: string) => void;
    columnColor?: string;
    columnName?: string;
}

const PrepCard: React.FC<PrepCardProps> = ({ 
    task, 
    index, 
    onDelete, 
    onViewRecipe,
    columnColor = '#1976d2',
    columnName = ''
}) => {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <Card 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    sx={{ 
                        width: '100%', 
                        mb: 1,
                        backgroundColor: snapshot.isDragging ? '#f0f7ff' : '#fff',
                        boxShadow: snapshot.isDragging 
                            ? '0px 5px 10px rgba(0, 0, 0, 0.1)' 
                            : '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
                        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                            backgroundColor: snapshot.isDragging ? '#f0f7ff' : '#f5f5f5',
                        },
                        position: 'relative',
                        overflow: 'visible',
                        borderLeft: `4px solid ${columnColor}`,
                    }}
                >
                    <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                flex: 1,
                                cursor: 'grab',
                                '&:active': {
                                    cursor: 'grabbing',
                                },
                                flexDirection: 'column'
                            }} 
                            {...provided.dragHandleProps}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                                    <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                                    <Typography variant="h6" component="div" sx={{ fontSize: '1rem', flexGrow: 1 }}>
                                        {task.title}
                                    </Typography>
                                    <Box>
                                        {task.recipeId && (
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewRecipe(task.id);
                                                }}
                                                sx={{ mr: 1 }}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(task.id);
                                            }}
                                            color="error"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                                    {columnName && (
                                        <Chip
                                            label={columnName}
                                            size="small"
                                            sx={{
                                                backgroundColor: `${columnColor}22`,
                                                color: columnColor,
                                                borderRadius: '4px',
                                                height: '20px',
                                                fontSize: '0.7rem',
                                                mr: 1,
                                            }}
                                        />
                                    )}
                                    {task.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            {task.description}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Draggable>
    );
};

export default PrepCard; 