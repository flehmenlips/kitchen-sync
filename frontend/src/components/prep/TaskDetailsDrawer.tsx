import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    TextField,
    Button,
    CircularProgress,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    Alert,
    Paper,
    Avatar,
    Card,
    CardMedia
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Timer as TimerIcon,
    Today as TodayIcon,
    Restaurant as RestaurantIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Description as DescriptionIcon,
    Comment as CommentIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { PrepTask } from '../../types/prep';
import { usePrepBoardStore } from '../../stores/prepBoardStore';
import { getRecipeById } from '../../services/apiService';

// Interface for recipe from API service
interface RecipeDetails {
    id: number;
    name: string;
    description: string | null;
    instructions: string;
    yieldQuantity: number | null;
    yieldUnit: { id: number; name: string; abbreviation: string } | null;
    prepTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    recipeIngredients?: {
        id: number;
        quantity: number;
        order: number;
        unit: { id: number; name: string; abbreviation: string };
        ingredient?: { id: number; name: string };
        subRecipe?: { id: number; name: string };
    }[];
    photoUrl?: string;
}

// Interface for comments
interface TaskComment {
    id: string;
    text: string;
    createdAt: string;
    authorName: string;
    authorId: string;
}

interface TaskDetailsDrawerProps {
    open: boolean;
    onClose: () => void;
    task: PrepTask | null;
    columnName: string;
    columnColor: string;
}

// Cloudinary transformation function for thumbnails
const getThumbUrl = (photoUrl: string | null | undefined, size: number = 120): string | undefined => {
    if (!photoUrl) return undefined;
    
    // If it's a Cloudinary URL, transform it
    if (photoUrl.includes('res.cloudinary.com')) {
        // Extract the base URL and transformation path
        const parts = photoUrl.split('/upload/');
        if (parts.length === 2) {
            // Insert thumbnail transformation parameters
            // w_120,h_120,c_fill: width 120px, height 120px, crop mode fill
            // q_auto: automatic quality optimization
            return `${parts[0]}/upload/w_${size},h_${size},c_fill,q_auto/${parts[1]}`;
        }
    }
    
    // Return original URL if not Cloudinary or can't parse
    return photoUrl;
};

const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({
    open,
    onClose,
    task,
    columnName,
    columnColor
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ingredientsOpen, setIngredientsOpen] = useState(true);
    const [instructionsOpen, setInstructionsOpen] = useState(false);
    
    // Comments state
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentsExpanded, setCommentsExpanded] = useState(true);
    
    const updateTask = usePrepBoardStore(state => state.updateTask);

    useEffect(() => {
        if (task) {
            setEditTitle(task.title);
            setEditDescription(task.description || '');
            
            // For demo purposes, load sample comments
            // In a real app, you would fetch these from an API
            setComments([
                {
                    id: '1',
                    text: 'This task needs to be completed by tomorrow',
                    createdAt: new Date().toISOString(),
                    authorName: 'Chef Mike',
                    authorId: '123'
                },
                {
                    id: '2',
                    text: 'I\'ve started prepping the ingredients',
                    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                    authorName: 'Sous Chef Alex',
                    authorId: '456'
                }
            ]);
        }
    }, [task]);

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            if (!task?.recipeId) {
                setRecipe(null);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const recipeId = parseInt(task.recipeId);
                const recipeData = await getRecipeById(recipeId);
                setRecipe(recipeData as unknown as RecipeDetails);
            } catch (err) {
                console.error('Error fetching recipe details:', err);
                setError('Failed to load recipe details. Please try again later.');
                setRecipe(null);
            } finally {
                setLoading(false);
            }
        };

        if (open && task?.recipeId) {
            fetchRecipeDetails();
        }
    }, [open, task]);

    const handleSave = async () => {
        if (!task) return;

        try {
            await updateTask(task.id, {
                title: editTitle,
                description: editDescription
            });
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    const handleAddComment = () => {
        if (!newComment.trim() || !task) return;

        // In a real app, you would send this to your API
        const newCommentObj: TaskComment = {
            id: Date.now().toString(), // Use a real ID generator in production
            text: newComment.trim(),
            createdAt: new Date().toISOString(),
            authorName: 'You', // In a real app, get the current user's name
            authorId: 'current-user-id' // In a real app, get the current user's ID
        };

        setComments([...comments, newCommentObj]);
        setNewComment('');
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'PPP p'); // e.g., "April 29, 2023 at 3:45 PM"
        } catch (err) {
            return 'Invalid date';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays < 7) return `${diffDays}d ago`;
            
            return format(date, 'MMM d');
        } catch (err) {
            return 'Unknown time';
        }
    };

    if (!task) return null;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{ 
                '& .MuiDrawer-paper': { 
                    width: { xs: '100%', sm: 400 },
                    maxWidth: '100%'
                } 
            }}
        >
            <Box sx={{ 
                p: 2,
                borderLeft: `4px solid ${columnColor}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 2
                }}>
                    <Box>
                        <Chip 
                            label={columnName}
                            size="small"
                            sx={{
                                backgroundColor: `${columnColor}22`,
                                color: columnColor,
                                borderRadius: '4px',
                                height: '20px',
                                fontSize: '0.7rem',
                                mb: 1
                            }}
                        />
                        {isEditing ? (
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                sx={{ mb: 1 }}
                            />
                        ) : (
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                {task.title}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TodayIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Created: {formatDate(task.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        {isEditing ? (
                            <IconButton onClick={handleSave} color="primary">
                                <SaveIcon />
                            </IconButton>
                        ) : (
                            <IconButton onClick={() => setIsEditing(true)}>
                                <EditIcon />
                            </IconButton>
                        )}
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Description */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Description
                    </Typography>
                    {isEditing ? (
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            placeholder="Add a description..."
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                        />
                    ) : (
                        <Typography variant="body1">
                            {task.description || 'No description provided.'}
                        </Typography>
                    )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Comments Section */}
                <List 
                    component="nav" 
                    sx={{ 
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 2
                    }}
                >
                    <ListItem button onClick={() => setCommentsExpanded(!commentsExpanded)}>
                        <ListItemIcon>
                            <CommentIcon />
                        </ListItemIcon>
                        <ListItemText primary={`Comments (${comments.length})`} />
                        {commentsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItem>
                    <Collapse in={commentsExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2 }}>
                            {comments.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    No comments yet. Add the first one!
                                </Typography>
                            ) : (
                                comments.map((comment) => (
                                    <Paper 
                                        key={comment.id} 
                                        elevation={0} 
                                        sx={{ 
                                            p: 2, 
                                            mb: 2, 
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: 2
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                            <Avatar 
                                                sx={{ 
                                                    width: 32, 
                                                    height: 32, 
                                                    mr: 1,
                                                    bgcolor: columnColor
                                                }}
                                            >
                                                {comment.authorName.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="subtitle2" component="span">
                                                        {comment.authorName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatTimeAgo(comment.createdAt)}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    {comment.text}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                ))
                            )}
                            
                            {/* Add comment input */}
                            <Box sx={{ display: 'flex', mt: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                />
                                <Button 
                                    variant="contained"
                                    disabled={!newComment.trim()}
                                    onClick={handleAddComment}
                                    sx={{ 
                                        bgcolor: columnColor,
                                        '&:hover': {
                                            bgcolor: `${columnColor}dd`
                                        }
                                    }}
                                >
                                    <SendIcon fontSize="small" />
                                </Button>
                            </Box>
                        </Box>
                    </Collapse>
                </List>

                {/* Recipe Details Section */}
                {task.recipeId ? (
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <RestaurantIcon sx={{ mr: 1 }} />
                            Recipe Details
                        </Typography>
                        
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                        ) : recipe ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, gap: 2 }}>
                                    {recipe.photoUrl ? (
                                        <Card sx={{ width: 120, height: 120, flexShrink: 0, borderRadius: 2, overflow: 'hidden' }}>
                                            <CardMedia
                                                component="img"
                                                image={getThumbUrl(recipe.photoUrl)}
                                                alt={recipe.name}
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </Card>
                                    ) : (
                                        <Card sx={{ 
                                            width: 120, 
                                            height: 120, 
                                            flexShrink: 0, 
                                            borderRadius: 2, 
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'primary.light'
                                        }}>
                                            <RestaurantIcon sx={{ fontSize: 48, color: 'white' }} />
                                        </Card>
                                    )}
                                    <Box>
                                        <Typography variant="h6">{recipe.name}</Typography>
                                        {recipe.description && (
                                            <Typography variant="body2" color="text.secondary">
                                                {recipe.description}
                                            </Typography>
                                        )}
                                        
                                        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                            {recipe.prepTimeMinutes && (
                                                <Chip
                                                    icon={<TimerIcon />}
                                                    label={`Prep: ${recipe.prepTimeMinutes} min`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                            {recipe.cookTimeMinutes && (
                                                <Chip
                                                    icon={<TimerIcon />}
                                                    label={`Cook: ${recipe.cookTimeMinutes} min`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                            {recipe.yieldQuantity && recipe.yieldUnit && (
                                                <Chip
                                                    icon={<RestaurantIcon />}
                                                    label={`Yield: ${recipe.yieldQuantity} ${recipe.yieldUnit.name}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                                
                                {/* Ingredients */}
                                <List 
                                    component="nav" 
                                    sx={{ 
                                        bgcolor: 'background.paper',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <ListItem button onClick={() => setIngredientsOpen(!ingredientsOpen)}>
                                        <ListItemIcon>
                                            <RestaurantIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Ingredients" />
                                        {ingredientsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </ListItem>
                                    <Collapse in={ingredientsOpen} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {recipe.recipeIngredients?.map((item, index) => (
                                                <ListItem key={index} sx={{ pl: 4 }}>
                                                    <ListItemText 
                                                        primary={
                                                            <Typography variant="body2">
                                                                {item.quantity} {item.unit.abbreviation || item.unit.name} {' '}
                                                                {item.ingredient?.name || item.subRecipe?.name}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                    
                                    {/* Instructions */}
                                    <ListItem button onClick={() => setInstructionsOpen(!instructionsOpen)}>
                                        <ListItemIcon>
                                            <DescriptionIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Instructions" />
                                        {instructionsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </ListItem>
                                    <Collapse in={instructionsOpen} timeout="auto" unmountOnExit>
                                        <Box sx={{ p: 2 }}>
                                            <Typography variant="body2" whiteSpace="pre-wrap">
                                                {recipe.instructions}
                                            </Typography>
                                        </Box>
                                    </Collapse>
                                </List>
                            </>
                        ) : (
                            <Alert severity="info">No recipe details available.</Alert>
                        )}
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        This task is not linked to a recipe.
                    </Typography>
                )}
                
                {/* Action Buttons */}
                {isEditing && (
                    <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => {
                                setIsEditing(false);
                                setEditTitle(task.title);
                                setEditDescription(task.description || '');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            onClick={handleSave}
                            disabled={!editTitle.trim()}
                            sx={{ 
                                bgcolor: columnColor,
                                '&:hover': {
                                    bgcolor: `${columnColor}dd`
                                }
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

export default TaskDetailsDrawer; 