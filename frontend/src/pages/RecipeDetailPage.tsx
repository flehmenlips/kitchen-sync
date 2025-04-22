import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getRecipeById, Recipe as ApiRecipe, RecipeIngredient, updateRecipe } from '../services/apiService';
import EditIcon from '@mui/icons-material/Edit';
import ScaleIcon from '@mui/icons-material/Scale';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { RecipeScaleDialog } from '../components/RecipeScaleDialog';
import { scaleRecipe } from '../utils/recipeScaling';

type UnitType = 'WEIGHT' | 'VOLUME' | 'COUNT' | 'LENGTH' | 'TEMPERATURE';

interface ScalingIngredient {
    id: number;
    name: string;
    quantity: number;
    unit: {
        id: number;
        name: string;
        type: UnitType;
    };
}

interface ScaledRecipeIngredient extends RecipeIngredient {
    note?: string;
}

type DisplayedIngredient = {
    id: number;
    quantity: number;
    unit: {
        id: number;
        name: string;
        abbreviation: string;
    };
    ingredient?: {
        id: number;
        name: string;
    };
    note?: string;
};

const RecipeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState<ApiRecipe | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScaleDialogOpen, setIsScaleDialogOpen] = useState(false);
    const [scaledIngredients, setScaledIngredients] = useState<DisplayedIngredient[] | null>(null);
    const [scaleFactor, setScaleFactor] = useState<number>(1);
    const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);

    useEffect(() => {
        const loadRecipe = async () => {
            try {
                if (!id) throw new Error('Recipe ID is required');
                const data = await getRecipeById(parseInt(id, 10));
                setRecipe(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load recipe');
            } finally {
                setIsLoading(false);
            }
        };

        loadRecipe();
    }, [id]);

    const handleScale = (options: { type: 'multiply' | 'divide' | 'constraint'; value: number }) => {
        if (!recipe?.recipeIngredients) return;

        const ingredients: ScalingIngredient[] = recipe.recipeIngredients.map(ri => ({
            id: ri.id,
            name: ri.ingredient?.name || '',
            quantity: ri.quantity,
            unit: {
                ...ri.unit,
                type: 'VOLUME' as UnitType // Default to VOLUME if not specified
            }
        }));

        const scaled = scaleRecipe(ingredients, options);

        // Update the recipe ingredients with scaled values
        setScaledIngredients(recipe.recipeIngredients.map((ri, index) => ({
            ...ri,
            quantity: scaled[index].quantity,
            note: scaled[index].note
        })) as DisplayedIngredient[]);

        setScaleFactor(options.value);
    };

    const resetScale = () => {
        setScaledIngredients(null);
        setScaleFactor(1);
    };

    const handleSaveScaledVersion = async () => {
        if (!recipe || !scaledIngredients) return;
        
        try {
            // Create new recipe data with scaled quantities
            const updatedRecipe = {
                name: recipe.name,
                description: recipe.description || '',
                instructions: recipe.instructions,
                yieldQuantity: (recipe.yieldQuantity || 1) * scaleFactor,
                yieldUnitId: recipe.yieldUnit?.id || 1,
                prepTimeMinutes: recipe.prepTimeMinutes || 0,
                cookTimeMinutes: recipe.cookTimeMinutes || 0,
                categoryId: recipe.categoryId || 1,
                tags: recipe.tags,
                ingredients: scaledIngredients.map(ing => ({
                    type: 'ingredient' as const,
                    ingredientId: ing.ingredient?.id,
                    quantity: ing.quantity,
                    unitId: ing.unit.id,
                }))
            };
            
            await updateRecipe(recipe.id, updatedRecipe);
            // Reload the recipe to show updated values
            const refreshedRecipe = await getRecipeById(recipe.id);
            setRecipe(refreshedRecipe);
            setScaledIngredients(null);
            setScaleFactor(1);
            setSaveDialogOpen(false);
        } catch (err) {
            setError('Failed to save scaled version');
        }
    };

    if (isLoading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !recipe || !recipe.recipeIngredients) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error || 'Recipe not found'}</Alert>
            </Container>
        );
    }

    const displayedIngredients: DisplayedIngredient[] = scaledIngredients || 
        recipe.recipeIngredients.map(ri => ({
            id: ri.id,
            quantity: ri.quantity,
            unit: ri.unit,
            ingredient: ri.ingredient,
        }));
    const scaledYield = (recipe.yieldQuantity || 1) * scaleFactor;

    const RecipeContent = ({ ingredients, yield: yieldQty, isScaled = false }: { 
        ingredients: DisplayedIngredient[], 
        yield: number,
        isScaled?: boolean 
    }) => (
        <Paper sx={{ p: 3, mb: 3, height: '100%' }}>
            {isScaled && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" color="primary">
                        Scaled Version ({scaleFactor}x)
                    </Typography>
                    <Box>
                        <Tooltip title="Save as New Base Recipe">
                            <IconButton 
                                onClick={() => setSaveDialogOpen(true)}
                                color="primary"
                                size="small"
                            >
                                <SaveIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Close Scaled Version">
                            <IconButton 
                                onClick={() => {
                                    setScaledIngredients(null);
                                    setScaleFactor(1);
                                }}
                                size="small"
                            >
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            )}

            {recipe.description && (
                <>
                    <Typography variant="h6" gutterBottom>
                        Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {recipe.description}
                    </Typography>
                </>
            )}

            <Typography variant="h6" gutterBottom>
                Yield
            </Typography>
            <Typography variant="body1" paragraph>
                {yieldQty} {recipe.yieldUnit?.name || 'servings'}
            </Typography>

            <Typography variant="h6" gutterBottom>
                Ingredients
            </Typography>
            <List>
                {ingredients.map((ing, idx) => (
                    <React.Fragment key={ing.id}>
                        {idx > 0 && <Divider />}
                        <ListItem>
                            <ListItemText
                                primary={`${ing.quantity} ${ing.unit.name} ${ing.ingredient?.name || ''}`}
                                secondary={ing.note}
                            />
                        </ListItem>
                    </React.Fragment>
                ))}
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Instructions
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
        </Paper>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/">
                    KitchenSync
                </Link>
                <Link component={RouterLink} underline="hover" color="inherit" to="/recipes">
                    Recipes
                </Link>
                <Typography color="text.primary">{recipe.name}</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    {recipe.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Scale Recipe">
                        <IconButton 
                            onClick={() => setIsScaleDialogOpen(true)} 
                            color="primary"
                            disabled={Boolean(scaledIngredients)}
                        >
                            <ScaleIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Recipe">
                        <IconButton onClick={() => navigate(`/recipes/${recipe.id}/edit`)} color="primary">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Recipe">
                        <IconButton color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: 1, minWidth: scaledIngredients ? '45%' : '100%' }}>
                    <RecipeContent 
                        ingredients={recipe.recipeIngredients} 
                        yield={recipe.yieldQuantity || 1}
                    />
                </Box>
                {scaledIngredients && (
                    <Box sx={{ flex: 1, minWidth: '45%' }}>
                        <RecipeContent 
                            ingredients={scaledIngredients} 
                            yield={scaledYield}
                            isScaled
                        />
                    </Box>
                )}
            </Box>

            <RecipeScaleDialog
                open={isScaleDialogOpen}
                onClose={() => setIsScaleDialogOpen(false)}
                onScale={handleScale}
                ingredients={recipe.recipeIngredients.map(ri => ({
                    id: ri.id,
                    name: ri.ingredient?.name || '',
                    quantity: ri.quantity,
                    unit: {
                        ...ri.unit,
                        type: 'VOLUME' as UnitType // Default to VOLUME if not specified
                    }
                }))}
            />

            {/* Confirmation Dialog for Saving Scaled Version */}
            <Dialog open={isSaveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
                <DialogTitle>Save Scaled Version?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to replace your base recipe with the scaled version? 
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveScaledVersion} variant="contained" color="primary">
                        Save as Base Recipe
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RecipeDetailPage; 