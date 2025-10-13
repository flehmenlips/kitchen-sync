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
    Switch,
    FormControlLabel,
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
import DeleteIcon from '@mui/icons-material/Delete';
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
        alternatives?: string[]; // Alternative ingredients (e.g., "or clam juice")
        parenthetical?: string; // Text in parentheses (e.g., "(~3 cups)")
        skipDatabase?: boolean; // Flag to skip adding to database for complex ingredients
    }[];
    yieldQuantity?: number;
    yieldUnit?: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
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
    onDelete: (ingredient: ParsedRecipe['ingredients'][0]) => void;
}

const IngredientEditDialog: React.FC<IngredientEditDialogProps> = ({
    open,
    onClose,
    ingredient,
    onSave,
    onDelete,
}) => {
    const [editedIngredient, setEditedIngredient] = useState({ ...ingredient });

    const handleSave = () => {
        onSave(editedIngredient);
        onClose();
    };

    const handleDelete = () => {
        onDelete(ingredient);
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
                    
                    {ingredient.alternatives && ingredient.alternatives.length > 0 && (
                        <TextField
                            label="Alternative Ingredients"
                            value={editedIngredient.alternatives?.join(', ') || ''}
                            onChange={(e) => setEditedIngredient({
                                ...editedIngredient,
                                alternatives: e.target.value.split(',').map(alt => alt.trim())
                            })}
                            fullWidth
                            size="small"
                            helperText="Comma-separated list of alternatives"
                        />
                    )}
                    
                    {ingredient.parenthetical && (
                        <TextField
                            label="Notes (in parentheses)"
                            value={editedIngredient.parenthetical || ''}
                            onChange={(e) => setEditedIngredient({
                                ...editedIngredient,
                                parenthetical: e.target.value
                            })}
                            fullWidth
                            size="small"
                        />
                    )}

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
                    
                    {/* Add checkbox for skipping database */}
                    <FormControl fullWidth size="small">
                        <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={editedIngredient.skipDatabase || false}
                                onChange={(e) => setEditedIngredient({
                                    ...editedIngredient,
                                    skipDatabase: e.target.checked
                                })}
                                id="skip-database-checkbox"
                                style={{ marginRight: '8px' }}
                            />
                            <label htmlFor="skip-database-checkbox">
                                Skip adding to ingredient database
                            </label>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                            Use for complex or descriptive ingredients
                        </Typography>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={handleDelete} 
                    color="error" 
                    startIcon={<DeleteIcon />}
                >
                    Delete
                </Button>
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
    const [useAI, setUseAI] = useState(true);

    const steps = ['Paste Recipe', 'Review & Edit', 'Import'];

    // Fetch units and ingredients when component mounts
    useEffect(() => {
        const loadData = async () => {
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
            }
        };
        loadData();
    }, []);


    // Helper function to find or create a unit
    const findOrCreateUnit = async (unitName: string): Promise<number> => {
        if (!unitName) {
            throw new Error('Unit name is required');
        }

        // Map of common units to their types
        const unitTypeMap: { [key: string]: 'WEIGHT' | 'VOLUME' | 'COUNT' | 'LENGTH' | 'TEMPERATURE' | 'OTHER' } = {
            'tablespoon': 'VOLUME',
            'tbsp': 'VOLUME',
            'teaspoon': 'VOLUME',
            'tsp': 'VOLUME',
            'cup': 'VOLUME',
            'milliliter': 'VOLUME',
            'ml': 'VOLUME',
            'liter': 'VOLUME',
            'pound': 'WEIGHT',
            'lb': 'WEIGHT',
            'ounce': 'WEIGHT',
            'oz': 'WEIGHT',
            'gram': 'WEIGHT',
            'g': 'WEIGHT',
            'kilogram': 'WEIGHT',
            'kg': 'WEIGHT',
            'piece': 'COUNT',
            'whole': 'COUNT',
            'clove': 'COUNT',
            'count': 'COUNT',
            'inch': 'LENGTH',
            'cm': 'LENGTH',
            'pinch': 'OTHER',
            'dash': 'OTHER',
            'to taste': 'OTHER',
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
                setUnits(prev => [...prev, newUnit]);
                return newUnit.id;
            } catch (err) {
                console.error('Error creating default unit:', err);
                throw new Error('Failed to create default unit');
            }
        }

        // First try to find an exact match (case-insensitive)
        const exactMatch = units.find(u => 
            u.name.toLowerCase() === unitName.toLowerCase() || 
            u.abbreviation?.toLowerCase() === unitName.toLowerCase()
        );
        if (exactMatch) return exactMatch.id;

        // Try to find a similar match if no exact match is found
        const similarMatch = units.find(u => 
            unitName.toLowerCase().includes(u.name.toLowerCase()) || 
            u.name.toLowerCase().includes(unitName.toLowerCase()) ||
            (u.abbreviation && 
                (unitName.toLowerCase().includes(u.abbreviation.toLowerCase()) || 
                u.abbreviation.toLowerCase().includes(unitName.toLowerCase())))
        );
        if (similarMatch) return similarMatch.id;

        // Determine unit type based on the name
        let unitType: 'WEIGHT' | 'VOLUME' | 'COUNT' | 'LENGTH' | 'TEMPERATURE' | 'OTHER' = 'OTHER';
        
        // Try to find the type based on exact unit name
        const lowerUnitName = unitName.toLowerCase();
        if (unitTypeMap[lowerUnitName]) {
            unitType = unitTypeMap[lowerUnitName];
        } else {
            // Or try to infer from unit name parts
            if (lowerUnitName.includes('cup') || lowerUnitName.includes('spoon') || 
                lowerUnitName.includes('liter') || lowerUnitName.includes('gal') || 
                lowerUnitName.includes('quart') || lowerUnitName.includes('pint')) {
                unitType = 'VOLUME';
            } else if (lowerUnitName.includes('gram') || lowerUnitName.includes('pound') || 
                    lowerUnitName.includes('ounce') || lowerUnitName.includes('lb') || 
                    lowerUnitName.includes('oz') || lowerUnitName.includes('kg')) {
                unitType = 'WEIGHT';
            } else if (lowerUnitName.includes('piece') || lowerUnitName.includes('count') || 
                    lowerUnitName.includes('whole') || lowerUnitName.includes('slice') || 
                    lowerUnitName.includes('clove')) {
                unitType = 'COUNT';
            }
        }

        // If no match, create a new unit
        try {
            const newUnit = await createUnit({
                name: unitName,
                abbreviation: unitName.length <= 5 ? unitName : undefined,
                type: unitType
            });
            setUnits(prev => [...prev, newUnit]);
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
        
        try {
            // Normalize the ingredient name (lowercase, trim excess spaces)
            const normalizedName = ingredientName.toLowerCase().trim();
            
            // First try to find an exact match (case-insensitive)
            const exactMatch = ingredients.find(i => 
                i.name.toLowerCase() === normalizedName
            );
            if (exactMatch) return exactMatch.id;

            // Try to find a similar match
            const similarMatch = ingredients.find(i => {
                const iName = i.name.toLowerCase();
                return (
                    // Check if names are very similar (one is contained in the other)
                    (normalizedName.includes(iName) && iName.length > 3) || 
                    (iName.includes(normalizedName) && normalizedName.length > 3) ||
                    // Check for plural forms
                    (normalizedName.endsWith('s') && iName === normalizedName.slice(0, -1)) ||
                    (iName.endsWith('s') && normalizedName === iName.slice(0, -1))
                );
            });
            if (similarMatch) return similarMatch.id;

            // If no exact match in local state, try to query all ingredients from the backend
            // This handles cases where the ingredient might exist in the DB but not in our local state
            try {
                const allIngredients = await getIngredients();
                
                // First try exact match
                const backendExactMatch = allIngredients.find(i => 
                    i.name.toLowerCase() === normalizedName
                );
                
                if (backendExactMatch) {
                    // Update local state and return the found ID
                    if (!ingredients.some(i => i.id === backendExactMatch.id)) {
                        setIngredients(prev => [...prev, backendExactMatch]);
                    }
                    return backendExactMatch.id;
                }
                
                // Then try similar match
                const backendSimilarMatch = allIngredients.find(i => {
                    const iName = i.name.toLowerCase();
                    return (
                        (normalizedName.includes(iName) && iName.length > 3) || 
                        (iName.includes(normalizedName) && normalizedName.length > 3) ||
                        (normalizedName.endsWith('s') && iName === normalizedName.slice(0, -1)) ||
                        (iName.endsWith('s') && normalizedName === iName.slice(0, -1))
                    );
                });
                
                if (backendSimilarMatch) {
                    if (!ingredients.some(i => i.id === backendSimilarMatch.id)) {
                        setIngredients(prev => [...prev, backendSimilarMatch]);
                    }
                    return backendSimilarMatch.id;
                }
                
                // Update our local state with all ingredients for future searches
                setIngredients(allIngredients);
            } catch (queryError) {
                console.warn('Error querying for existing ingredients:', queryError);
                // Continue to creation attempt if query fails
            }

            // If no match, create a new ingredient
            const newIngredient = await createIngredient({
                name: ingredientName, // Use original casing
                description: null
            });
            setIngredients(prev => [...prev, newIngredient]);
            return newIngredient.id;
        } catch (err: any) {
            // If we got a 409 Conflict error, the ingredient likely exists already
            // Attempt to fetch it one more time
            if (err.response?.status === 409) {
                console.log(`Ingredient "${ingredientName}" already exists. Fetching it...`);
                try {
                    const refreshedIngredients = await getIngredients();
                    const existingIngredient = refreshedIngredients.find(i => 
                        i.name.toLowerCase() === ingredientName.toLowerCase()
                    );
                    
                    if (existingIngredient) {
                        // Update local state with all ingredients and return the ID
                        setIngredients(refreshedIngredients);
                        return existingIngredient.id;
                    }
                } catch (refreshError) {
                    console.error('Error refreshing ingredients after conflict:', refreshError);
                }
            }
            
            // If all recovery attempts fail, throw a more informative error
            console.error(`Error creating ingredient "${ingredientName}":`, err);
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            throw new Error(`Failed to process ingredient "${ingredientName}": ${errorMessage}`);
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
            const parsed = await parseRecipe(rawRecipe, useAI);
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
            const processedIngredients = [];
            const failedIngredients = [];
            const successfulIngredients = []; // Track successful ingredients for reporting
            const createdUnits = new Set<string>(); // Track units created during this import session
            
            // Set up a progress message for status updates
            const setProgressError = (message: string) => {
                setError(`${message} - continuing with other ingredients...`);
            };
            
            // Process ingredients sequentially instead of in parallel to avoid race conditions
            for (const [index, ing] of parsedRecipe.ingredients.entries()) {
                try {
                    if (!ing.name) {
                        throw new Error(`Missing name for ingredient at index ${index}`);
                    }

                    // Use the unit from the ingredient or default to "whole"
                    let unitId: number;
                    try {
                        unitId = await findOrCreateUnit(ing.unit || 'whole');
                        // Add to successful logs only if we actually created a new unit and haven't already logged it
                        if (ing.unit && !units.some(u => u.name.toLowerCase() === ing.unit!.toLowerCase()) && !createdUnits.has(ing.unit.toLowerCase())) {
                            successfulIngredients.push(`Created unit: ${ing.unit}`);
                            createdUnits.add(ing.unit.toLowerCase());
                        }
                    } catch (unitError) {
                        console.error(`Error processing unit "${ing.unit}":`, unitError);
                        setProgressError(`Error with unit "${ing.unit}": ${unitError instanceof Error ? unitError.message : 'Unknown error'}`);
                        // Use a default "count" unit if unit creation fails
                        const defaultUnit = units.find(u => u.name === 'piece' || u.name === 'whole' || u.name === 'count');
                        if (!defaultUnit) {
                            throw new Error(`Failed to process unit "${ing.unit}" and no default unit available`);
                        }
                        unitId = defaultUnit.id;
                    }
                    
                    // If skipDatabase is true, just return the ingredient as text
                    if (ing.skipDatabase) {
                        // For complex ingredients, we still need a valid ingredientId
                        // We'll use a placeholder ingredient for text-only entries
                        const textPlaceholderId = await getOrCreateTextPlaceholder();
                        
                        processedIngredients.push({
                            type: 'ingredient' as const,
                            ingredientId: textPlaceholderId,
                            quantity: ing.quantity || 1,
                            unitId,
                            order: index,
                            // These additional properties will be used when displaying the ingredient
                            // but won't be sent to the backend as part of the recipe creation
                            _displayText: ing.raw || `${ing.quantity} ${ing.unit} ${ing.name || 'Unknown ingredient'}`,
                            _skipDatabase: true
                        });
                        successfulIngredients.push(`Added text placeholder: ${ing.name || 'Unknown ingredient'}`);
                    } else {
                        // For normal ingredients, create or find them in the database
                        try {
                            const ingredientId = await findOrCreateIngredient(ing.name);
                            
                            // Add to successful logs if we created a new ingredient
                            if (!ingredients.some(i => i.name.toLowerCase() === ing.name!.toLowerCase())) {
                                successfulIngredients.push(`Created ingredient: ${ing.name}`);
                            }
                            
                            processedIngredients.push({
                                type: 'ingredient' as const,
                                ingredientId,
                                quantity: ing.quantity || 1,
                                unitId,
                                order: index
                            });
                        } catch (ingredientError) {
                            console.error(`Error processing ingredient "${ing.name}":`, ingredientError);
                            setProgressError(`Error with ingredient "${ing.name}": ${ingredientError instanceof Error ? ingredientError.message : 'Unknown error'}`);
                            failedIngredients.push({
                                name: ing.name,
                                error: ingredientError instanceof Error ? ingredientError.message : 'Unknown error'
                            });
                            
                            // For failed ingredients, create a text placeholder instead
                            const textPlaceholderId = await getOrCreateTextPlaceholder();
                            
                            processedIngredients.push({
                                type: 'ingredient' as const,
                                ingredientId: textPlaceholderId,
                                quantity: ing.quantity || 1,
                                unitId,
                                order: index,
                                _displayText: ing.raw || `${ing.quantity} ${ing.unit} ${ing.name || 'Unknown ingredient'}`,
                                _skipDatabase: true
                            });
                            successfulIngredients.push(`Added as text: ${ing.name || 'Unknown ingredient'} (after failed creation)`);
                        }
                    }
                } catch (err) {
                    console.error(`Error processing ingredient "${ing.name}":`, err);
                    failedIngredients.push({
                        name: ing.name,
                        error: err instanceof Error ? err.message : 'Unknown error'
                    });
                    
                    // For failed ingredients, add a placeholder instead of failing the whole import
                    if (!ing.skipDatabase) {
                        // Mark the ingredient as skipDatabase so we use a placeholder
                        ing.skipDatabase = true;
                        
                        try {
                            const textPlaceholderId = await getOrCreateTextPlaceholder();
                            
                            // Get unitId - use default if necessary
                            let unitId: number;
                            try {
                                unitId = await findOrCreateUnit(ing.unit || 'whole');
                            } catch (unitError) {
                                const defaultUnit = units.find(u => u.name === 'piece' || u.name === 'whole' || u.name === 'count');
                                if (!defaultUnit) {
                                    throw new Error('No default unit available');
                                }
                                unitId = defaultUnit.id;
                            }
                            
                            processedIngredients.push({
                                type: 'ingredient' as const,
                                ingredientId: textPlaceholderId,
                                quantity: ing.quantity || 1,
                                unitId,
                                order: index,
                                _displayText: ing.raw || `${ing.quantity} ${ing.unit} ${ing.name || 'Unknown ingredient'}`,
                                _skipDatabase: true
                            });
                            successfulIngredients.push(`Added as text: ${ing.name || 'Unknown ingredient'} (after error)`);
                        } catch (placeholderError) {
                            console.error(`Failed to create placeholder for "${ing.name}":`, placeholderError);
                            // If even the placeholder fails, we just skip this ingredient
                        }
                    }
                }
            }

            // Find or create yield unit
            let yieldUnitId = 1; // Default to "serving"
            if (parsedRecipe.yieldUnit) {
                try {
                    yieldUnitId = await findOrCreateUnit(parsedRecipe.yieldUnit);
                    // Add to successful logs only if we actually created a new unit and haven't already logged it
                    if (!units.some(u => u.name.toLowerCase() === parsedRecipe.yieldUnit!.toLowerCase()) && !createdUnits.has(parsedRecipe.yieldUnit.toLowerCase())) {
                        successfulIngredients.push(`Created unit: ${parsedRecipe.yieldUnit}`);
                        createdUnits.add(parsedRecipe.yieldUnit.toLowerCase());
                    }
                } catch (unitError) {
                    console.warn(`Could not create yield unit "${parsedRecipe.yieldUnit}", using default`);
                    yieldUnitId = 1; // Default to "serving"
                }
            }

            // Create the recipe with processed ingredients
            const recipe = await createRecipe({
                name: parsedRecipe.name,
                description: parsedRecipe.description || '',
                instructions: parsedRecipe.instructions || '',
                ingredients: processedIngredients,
                yieldQuantity: parsedRecipe.yieldQuantity || 1,
                yieldUnitId: yieldUnitId,
                prepTimeMinutes: parsedRecipe.prepTimeMinutes || 0,
                cookTimeMinutes: parsedRecipe.cookTimeMinutes || 0,
                tags: [],
                categoryId: 1 // Default to "Uncategorized"
            });
            
            // Prepare success message with details about what was created
            let successMessage = `Recipe "${parsedRecipe.name}" imported successfully!`;
            
            if (successfulIngredients.length > 0) {
                // Limit to 5 items to avoid overwhelming message
                const limitedList = successfulIngredients.slice(0, 5);
                const remainingCount = successfulIngredients.length - 5;
                
                successMessage += ' Created: ' + limitedList.join(', ');
                if (remainingCount > 0) {
                    successMessage += ` and ${remainingCount} more`;
                }
            }
            
            // If we had any failed ingredients, show a warning but continue with navigation
            if (failedIngredients.length > 0) {
                const failedNames = failedIngredients.map(f => f.name).join(', ');
                setError(`Recipe imported successfully, but ${failedIngredients.length} ingredient(s) were problematic and added as text placeholders: ${failedNames}`);
                
                // Give the user a chance to see the warning before navigating
                setTimeout(() => {
                    navigate(`/recipes/${recipe.id}`);
                }, 4000);
            } else {
                // Show success message using a snackbar or similar component
                setError(null);
                alert(successMessage);
                navigate(`/recipes/${recipe.id}`);
            }
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

    const handleAddNewIngredient = () => {
        // Create a new empty ingredient
        const newIngredient: ParsedRecipe['ingredients'][0] = {
            type: "ingredient",
            quantity: 1,
            unit: "piece",
            unitId: "",
            name: "",
            raw: ""
        };
        
        // Set in editing mode with a "new" index that is the length of the array
        if (parsedRecipe) {
            setEditingIngredient({
                index: -1, // Special index to indicate new ingredient
                ingredient: newIngredient
            });
        }
    };

    const handleSaveIngredient = (updatedIngredient: ParsedRecipe['ingredients'][0]) => {
        if (parsedRecipe && editingIngredient !== null) {
            const updatedIngredients = [...parsedRecipe.ingredients];
            
            // Check if this is a new ingredient or editing an existing one
            if (editingIngredient.index === -1) {
                // Add new ingredient
                updatedIngredients.push(updatedIngredient);
            } else {
                // Update existing ingredient
                updatedIngredients[editingIngredient.index] = updatedIngredient;
            }
            
            setParsedRecipe({
                ...parsedRecipe,
                ingredients: updatedIngredients
            });
            setEditingIngredient(null);
        }
    };

    const handleDeleteIngredient = (ingredientToDelete: ParsedRecipe['ingredients'][0]) => {
        if (parsedRecipe && editingIngredient !== null) {
            const updatedIngredients = parsedRecipe.ingredients.filter((_, index) => 
                index !== editingIngredient.index
            );
            setParsedRecipe({
                ...parsedRecipe,
                ingredients: updatedIngredients
            });
            setEditingIngredient(null);
        }
    };

    // Helper function to get or create a placeholder ingredient for text-only entries
    const getOrCreateTextPlaceholder = async (): Promise<number> => {
        const placeholderName = "TEXT_PLACEHOLDER";
        
        // Try to find an existing placeholder
        const existingPlaceholder = ingredients.find(i => i.name === placeholderName);
        if (existingPlaceholder) {
            return existingPlaceholder.id;
        }
        
        // Create a new placeholder
        try {
            const newPlaceholder = await createIngredient({
                name: placeholderName,
                description: "Placeholder for text-only ingredients"
            });
            setIngredients([...ingredients, newPlaceholder]);
            return newPlaceholder.id;
        } catch (err) {
            console.error('Error creating placeholder ingredient:', err);
            throw new Error('Failed to create ingredient placeholder');
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

                    <FormControlLabel
                        control={
                            <Switch
                                checked={useAI}
                                onChange={(e) => setUseAI(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Use AI for parsing (Claude)"
                        sx={{ mb: 2 }}
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
                                                primary={
                                                    <Box>
                                                        <Typography variant="body1" component="span">
                                                            {`${ing.quantity} ${ing.unit} ${ing.name}`}
                                                        </Typography>
                                                        {ing.alternatives && ing.alternatives.length > 0 && (
                                                            <Typography variant="body2" component="span" color="text.secondary">
                                                                {" (or "}{ing.alternatives.join(', or ')}{")"}
                                                            </Typography>
                                                        )}
                                                        {ing.parenthetical && (
                                                            <Typography variant="body2" component="span" color="text.secondary">
                                                                {" ("}{ing.parenthetical}{")"}
                                                            </Typography>
                                                        )}
                                                        {ing.skipDatabase && (
                                                            <Typography 
                                                                variant="caption" 
                                                                component="span" 
                                                                sx={{ 
                                                                    ml: 1, 
                                                                    backgroundColor: 'info.lighter', 
                                                                    px: 1, 
                                                                    py: 0.5, 
                                                                    borderRadius: 1 
                                                                }}
                                                            >
                                                                Text only
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                                secondary={ing.raw}
                                            />
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                                {/* Add Ingredient Button */}
                                <ListItem>
                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        onClick={handleAddNewIngredient}
                                        sx={{ mt: 1 }}
                                    >
                                        + Add Ingredient
                                    </Button>
                                </ListItem>
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
                    onDelete={handleDeleteIngredient}
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