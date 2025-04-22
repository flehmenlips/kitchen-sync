import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Paper,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    parseRecipe,
    createRecipe,
    getUnits,
    createUnit,
    getIngredients,
    createIngredient,
    UnitOfMeasure,
    Ingredient
} from '../services/apiService';
import EditIcon from '@mui/icons-material/Edit';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ParsedRecipe {
    name: string;
    description: string;
    instructions: string;
    ingredients: {
        type: "" | "ingredient" | "sub-recipe";
        ingredientId?: string | number;
        subRecipeId?: string | number;
        quantity: string | number;
        unitId: string | number;
        // These are just for display/editing
        name?: string;
        unit?: string;
        raw?: string; // Original text from parsing
    }[];
}

// Add CSS for ReactQuill
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['clean']
    ]
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'align'
];

interface IngredientEditDialogProps {
    open: boolean;
    onClose: () => void;
    ingredient: ParsedRecipe['ingredients'][0];
    onSave: (updatedIngredient: ParsedRecipe['ingredients'][0]) => void;
}

const IngredientEditDialog: React.FC<IngredientEditDialogProps> = ({
    open,
    onClose,
    ingredient,
    onSave,
}) => {
    const [editedIngredient, setEditedIngredient] = useState({ ...ingredient });

    const handleSave = () => {
        onSave(editedIngredient);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Show original parsed text */}
                    <TextField
                        label="Original Text"
                        value={ingredient.raw || ''}
                        fullWidth
                        disabled
                        size="small"
                    />
                    
                    <TextField
                        label="Quantity"
                        type="number"
                        value={editedIngredient.quantity}
                        onChange={(e) => setEditedIngredient({
                            ...editedIngredient,
                            quantity: e.target.value
                        })}
                        fullWidth
                        size="small"
                        inputProps={{ step: "any" }}
                    />

                    <TextField
                        label="Unit"
                        value={editedIngredient.unit || ''}
                        onChange={(e) => setEditedIngredient({
                            ...editedIngredient,
                            unit: e.target.value
                        })}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Ingredient Name"
                        value={editedIngredient.name || ''}
                        onChange={(e) => setEditedIngredient({
                            ...editedIngredient,
                            name: e.target.value
                        })}
                        fullWidth
                        size="small"
                    />

                    <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={editedIngredient.type}
                            label="Type"
                            onChange={(e) => setEditedIngredient({
                                ...editedIngredient,
                                type: e.target.value as "" | "ingredient" | "sub-recipe"
                            })}
                        >
                            <MenuItem value="ingredient">Ingredient</MenuItem>
                            <MenuItem value="sub-recipe">Sub-Recipe</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

const RecipeImportPage: React.FC = () => {
    const [rawRecipe, setRawRecipe] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const [editingIngredient, setEditingIngredient] = useState<{
        index: number;
        ingredient: ParsedRecipe['ingredients'][0];
    } | null>(null);
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const steps = ['Paste Recipe', 'Review & Edit', 'Import'];

    // Fetch units and ingredients when component mounts
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                const [fetchedUnits, fetchedIngredients] = await Promise.all([
                    getUnits(),
                    getIngredients()
                ]);
                setUnits(fetchedUnits);
                setIngredients(fetchedIngredients);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load units and ingredients');
            } finally {
                setIsLoadingData(false);
            }
        };
        loadData();
    }, []);

    // Helper function to normalize unit names
    const normalizeUnit = (unit: string): string => {
        const unitMap: { [key: string]: string } = {
            'tbsp': 'tablespoon',
            'tbs': 'tablespoon',
            'tablespoons': 'tablespoon',
            'tablespoon': 'tablespoon',
            'tsp': 'teaspoon',
            'teaspoons': 'teaspoon',
            'teaspoon': 'teaspoon',
            'oz': 'ounce',
            'ounces': 'ounce',
            'ounce': 'ounce',
            'lb': 'pound',
            'lbs': 'pound',
            'pounds': 'pound',
            'pound': 'pound',
            'cup': 'cup',
            'cups': 'cup',
            'g': 'gram',
            'grams': 'gram',
            'gram': 'gram',
            'kg': 'kilogram',
            'kilograms': 'kilogram',
            'kilogram': 'kilogram',
            'ml': 'milliliter',
            'milliliters': 'milliliter',
            'milliliter': 'milliliter',
            'l': 'liter',
            'liters': 'liter',
            'liter': 'liter',
            'whole': 'piece',
            'wholes': 'piece',
            'piece': 'piece',
            'pieces': 'piece',
            'count': 'piece',
            'counts': 'piece',
            '#': 'pound'
        };
        return unitMap[unit.toLowerCase()] || unit.toLowerCase();
    };

    // Helper function to find or create a unit
    const findOrCreateUnit = async (unitName: string): Promise<number> => {
        if (!unitName) {
            throw new Error('Unit name is required');
        }

        // Map of common units to their types
        const unitTypeMap: { [key: string]: 'WEIGHT' | 'VOLUME' | 'COUNT' | 'LENGTH' | 'TEMPERATURE' } = {
            'tablespoon': 'VOLUME',
            'teaspoon': 'VOLUME',
            'cup': 'VOLUME',
            'milliliter': 'VOLUME',
            'liter': 'VOLUME',
            'pound': 'WEIGHT',
            'ounce': 'WEIGHT',
            'gram': 'WEIGHT',
            'kilogram': 'WEIGHT',
            'piece': 'COUNT',
            'whole': 'COUNT',
            'count': 'COUNT',
            'inch': 'LENGTH',
            'centimeter': 'LENGTH',
            'fahrenheit': 'TEMPERATURE',
            'celsius': 'TEMPERATURE'
        };

        // If the unit is "whole", try to find or create a default unit for countable items
        if (unitName.toLowerCase() === 'whole') {
            const defaultUnit = units.find(u => 
                u.name.toLowerCase() === 'piece' || 
                u.name.toLowerCase() === 'whole' ||
                u.name.toLowerCase() === 'count'
            );
            if (defaultUnit) return defaultUnit.id;

            // Create a default unit if none exists
            try {
                const newUnit = await createUnit({
                    name: 'piece',
                    abbreviation: 'pc',
                    type: 'COUNT'
                });
                setUnits([...units, newUnit]);
                return newUnit.id;
            } catch (err) {
                console.error('Error creating default unit:', err);
                throw new Error('Failed to create default unit');
            }
        }

        // First try to find an exact match
        const exactMatch = units.find(u => 
            u.name.toLowerCase() === unitName.toLowerCase() || 
            u.abbreviation?.toLowerCase() === unitName.toLowerCase()
        );
        if (exactMatch) return exactMatch.id;

        // Normalize the unit name for type lookup
        const normalizedUnit = normalizeUnit(unitName);
        const unitType = unitTypeMap[normalizedUnit] || 'COUNT'; // Default to COUNT if unknown

        // If no match, create a new unit
        try {
            const newUnit = await createUnit({
                name: unitName,
                abbreviation: unitName.length <= 5 ? unitName : null,
                type: unitType
            });
            setUnits([...units, newUnit]);
            return newUnit.id;
        } catch (err) {
            console.error('Error creating unit:', err);
            throw new Error(`Failed to create unit: ${unitName}`);
        }
    };

    // Helper function to find or create an ingredient
    const findOrCreateIngredient = async (ingredientName: string): Promise<number> => {
        if (!ingredientName) {
            throw new Error('Ingredient name is required');
        }
        // First try to find an exact match
        const exactMatch = ingredients.find(i => 
            i.name.toLowerCase() === ingredientName.toLowerCase()
        );
        if (exactMatch) return exactMatch.id;

        // If no match, create a new ingredient
        try {
            const newIngredient = await createIngredient({
                name: ingredientName,
                description: null
            });
            setIngredients([...ingredients, newIngredient]);
            return newIngredient.id;
        } catch (err) {
            console.error('Error creating ingredient:', err);
            throw new Error(`Failed to create ingredient: ${ingredientName}`);
        }
    };

    const handleParse = async () => {
        if (!rawRecipe.trim()) {
            setError('Please paste a recipe to import');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const parsed = await parseRecipe(rawRecipe);
            setParsedRecipe(parsed);
            setActiveStep(1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse recipe');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async () => {
        if (!parsedRecipe) return;

        setIsProcessing(true);
        setError(null);

        try {
            // Process all ingredients first
            const processedIngredients = await Promise.all(
                parsedRecipe.ingredients.map(async (ing, index) => {
                    try {
                        if (!ing.name) {
                            throw new Error(`Missing name for ingredient at index ${index}`);
                        }

                        // Use the unit from the ingredient or default to "whole"
                        const unitId = await findOrCreateUnit(ing.unit || 'whole');
                        const ingredientId = await findOrCreateIngredient(ing.name);
                        
                        return {
                            type: 'ingredient' as const,
                            ingredientId,
                            quantity: ing.quantity || 1,
                            unitId,
                            order: index
                        };
                    } catch (err) {
                        console.error(`Error processing ingredient "${ing.name}":`, err);
                        throw new Error(`Failed to process ingredient "${ing.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
                    }
                })
            );

            // Create the recipe with processed ingredients
            const recipe = await createRecipe({
                name: parsedRecipe.name,
                description: parsedRecipe.description || '',
                instructions: parsedRecipe.instructions || '',
                ingredients: processedIngredients,
                yieldQuantity: 1,
                yieldUnitId: 1, // Default to "serving"
                prepTimeMinutes: 0,
                cookTimeMinutes: 0,
                tags: [],
                categoryId: 1 // Default to "Uncategorized"
            });
            
            navigate(`/recipes/${recipe.id}`);
        } catch (err) {
            console.error('Import error:', err);
            setError(err instanceof Error ? err.message : 'Failed to import recipe');
            setActiveStep(1);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEditIngredient = (index: number) => {
        if (parsedRecipe) {
            setEditingIngredient({
                index,
                ingredient: parsedRecipe.ingredients[index]
            });
        }
    };

    const handleSaveIngredient = (updatedIngredient: ParsedRecipe['ingredients'][0]) => {
        if (parsedRecipe && editingIngredient !== null) {
            const updatedIngredients = [...parsedRecipe.ingredients];
            updatedIngredients[editingIngredient.index] = updatedIngredient;
            setParsedRecipe({
                ...parsedRecipe,
                ingredients: updatedIngredients
            });
            setEditingIngredient(null);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 2 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/">
                    KitchenSync
                </Link>
                <Link component={RouterLink} underline="hover" color="inherit" to="/recipes">
                    Recipes
                </Link>
                <Typography color="text.primary">Import Recipe</Typography>
            </Breadcrumbs>

            <Typography variant="h4" component="h1" gutterBottom>
                Import Recipe
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {activeStep === 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="body1" gutterBottom>
                        Paste your recipe below and our AI will help parse it into a structured format.
                        We'll identify ingredients, quantities, units, and instructions automatically.
                    </Typography>

                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        value={rawRecipe}
                        onChange={(e) => setRawRecipe(e.target.value)}
                        placeholder="Paste your recipe here..."
                        sx={{ mt: 2, mb: 2 }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleParse}
                            disabled={isProcessing || !rawRecipe.trim()}
                            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                        >
                            {isProcessing ? 'Processing...' : 'Parse Recipe'}
                        </Button>
                        <Button
                            variant="outlined"
                            component={RouterLink}
                            to="/recipes"
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Paper>
            )}

            {activeStep === 1 && parsedRecipe && (
                <Box sx={{ mb: 3 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Review Parsed Recipe
                        </Typography>

                        <TextField
                            fullWidth
                            label="Recipe Name"
                            value={parsedRecipe.name}
                            onChange={(e) => setParsedRecipe({ ...parsedRecipe, name: e.target.value })}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={parsedRecipe.description}
                            onChange={(e) => setParsedRecipe({ ...parsedRecipe, description: e.target.value })}
                            sx={{ mb: 3 }}
                        />

                        <Typography variant="subtitle1" gutterBottom>
                            Ingredients:
                        </Typography>
                        <Card variant="outlined" sx={{ mb: 3 }}>
                            <List>
                                {parsedRecipe.ingredients.map((ing, idx) => (
                                    <React.Fragment key={idx}>
                                        {idx > 0 && <Divider />}
                                        <ListItem
                                            secondaryAction={
                                                <Tooltip title="Edit">
                                                    <IconButton 
                                                        edge="end" 
                                                        aria-label="edit"
                                                        onClick={() => handleEditIngredient(idx)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                        >
                                            <ListItemText
                                                primary={`${ing.quantity} ${ing.unit} ${ing.name}`}
                                                secondary={ing.raw}
                                            />
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                            </List>
                        </Card>

                        <Typography variant="subtitle1" gutterBottom>
                            Instructions:
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <ReactQuill
                                value={parsedRecipe.instructions}
                                onChange={(content) => setParsedRecipe({ ...parsedRecipe, instructions: content })}
                                modules={quillModules}
                                formats={quillFormats}
                                theme="snow"
                            />
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleImport}
                                disabled={isProcessing}
                                startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                            >
                                {isProcessing ? 'Importing...' : 'Import Recipe'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setActiveStep(0)}
                                disabled={isProcessing}
                            >
                                Back
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            )}

            {/* Ingredient Edit Dialog */}
            {editingIngredient && (
                <IngredientEditDialog
                    open={true}
                    onClose={() => setEditingIngredient(null)}
                    ingredient={editingIngredient.ingredient}
                    onSave={handleSaveIngredient}
                />
            )}

            {/* Example Format */}
            {activeStep === 0 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Example Format
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                        {`Classic Chocolate Chip Cookies

Description:
Soft and chewy chocolate chip cookies with a perfect golden-brown edge.

Ingredients:
2 1/4 cups all-purpose flour
1 tsp baking soda
1 tsp salt
1 cup unsalted butter, softened
3/4 cup granulated sugar
3/4 cup packed brown sugar
2 large eggs
2 tsp vanilla extract
2 cups semi-sweet chocolate chips

Instructions:
1. Preheat oven to 375°F (190°C)
2. Whisk flour, baking soda, and salt in a bowl
3. Cream butter and sugars until light and fluffy
4. Beat in eggs one at a time, then stir in vanilla
5. Gradually blend in dry ingredients
6. Stir in chocolate chips
7. Drop rounded tablespoons onto ungreased baking sheets
8. Bake for 9 to 11 minutes or until golden brown
9. Let stand on baking sheet for 2 minutes before removing`}
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default RecipeImportPage; 