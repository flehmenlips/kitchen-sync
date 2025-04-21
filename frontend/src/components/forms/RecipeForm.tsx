import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
    Box,
    TextField,
    Button,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Paper,
    Alert,
    Stack,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    SelectChangeEvent,
    Grid,
    Autocomplete,
    CircularProgress,
    Tabs,
    Tab,
    Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import AddIcon from '@mui/icons-material/Add';
import {
    getUnits,
    UnitOfMeasure,
    getIngredients,
    Ingredient,
    getRecipes,
    Recipe,
    createUnit,
    createIngredient,
    getCategories,
    Category,
    createCategory
} from '../../services/apiService';
import UnitForm from './UnitForm';
import IngredientForm, { IngredientFormShape } from './IngredientForm';
import CategoryForm from './CategoryForm';
import { IngredientFormData as ApiIngredientFormData } from '../../services/apiService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

// Define a type for the combined list items
type IngredientOrRecipeOption = {
    id: number; // Original ID
    name: string;
    type: 'ingredient' | 'recipe' | 'create-ingredient'; // Distinguish type
    // Add original category/description if needed for display/sorting later
};

// Interface for the raw form data
// Export this interface as well
export interface RecipeFormData {
    name: string;
    description: string;
    yieldQuantity: number | string;
    yieldUnitId: number | string;
    prepTimeMinutes: number | string;
    cookTimeMinutes: number | string;
    tags: string[];
    instructions: string;
    categoryId: number | string;
    ingredients: {
        type: 'ingredient' | 'sub-recipe' | '';
        ingredientId?: number | string;
        subRecipeId?: number | string;
        quantity: number | string;
        unitId: number | string;
    }[];
}

interface RecipeFormProps {
    onSubmit: (data: RecipeFormData) => void;
    initialData?: Partial<RecipeFormData>; 
    isSubmitting: boolean;
}

// Define placeholder objects for "Create New" options
const CREATE_NEW_UNIT_OPTION: UnitOfMeasure = {
    id: -1, // Use a special ID
    name: "+ Create New Unit",
    abbreviation: null,
    type: null,
    createdAt: '', // Add dummy values for required fields if strict
    updatedAt: ''
};
const CREATE_NEW_INGREDIENT_OPTION: Ingredient = {
    id: -1,
    name: "+ Create New Ingredient",
    description: null,
    ingredientCategoryId: null,
    ingredientCategory: null,
    createdAt: '',
    updatedAt: ''
};
const CREATE_NEW_CATEGORY_OPTION: Category = {
    id: -1,
    name: "+ Create New Category",
    description: null,
    createdAt: '',
    updatedAt: ''
};

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
    const {
        handleSubmit,
        control,
        register,
        formState: { errors },
        watch,
        setValue
    } = useForm<RecipeFormData>({
        defaultValues: initialData || {
            name: '',
            description: '',
            yieldQuantity: '',
            yieldUnitId: '',
            prepTimeMinutes: '',
            cookTimeMinutes: '',
            tags: [],
            instructions: '',
            categoryId: '',
            ingredients: [{ type: '', ingredientId: '', quantity: '', unitId: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "ingredients"
    });

    // State for fetched units AND ingredients
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [unitsLoading, setUnitsLoading] = useState<boolean>(true);
    const [unitsError, setUnitsError] = useState<string | null>(null);
    const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
    const [ingredientsLoading, setIngredientsLoading] = useState<boolean>(true);
    const [ingredientsError, setIngredientsError] = useState<string | null>(null);
    const [subRecipesList, setSubRecipesList] = useState<Recipe[]>([]);
    const [subRecipesLoading, setSubRecipesLoading] = useState<boolean>(true);
    const [subRecipesError, setSubRecipesError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);

    // Add new state for the combined list
    const [combinedIngredientOptions, setCombinedIngredientOptions] = useState<IngredientOrRecipeOption[]>([]);

    // State for the creation modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'unit' | 'ingredient' | 'category' | null>(null);
    // Store the index of the ingredient row that triggered the modal
    const [modalTargetIndex, setModalTargetIndex] = useState<number | null>(null); 
    const [modalSubmitError, setModalSubmitError] = useState<string | null>(null);
    const [isModalSubmitting, setIsModalSubmitting] = useState<boolean>(false);

    // Add state for active tab index
    const [activeTab, setActiveTab] = useState(0);

    // Add state for confirmation dialog
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogProps, setConfirmDialogProps] = useState<{
        title: string;
        contentText: string;
        onConfirm: () => void;
    } | null>(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // Fetch units AND ingredients on component mount
    useEffect(() => {
        const loadSelectData = async () => {
            setUnitsLoading(true);
            setIngredientsLoading(true);
            setSubRecipesLoading(true);
            setCategoriesLoading(true);
            try {
                const [fetchedUnits, fetchedIngredients, fetchedRecipes, fetchedCategories] = await Promise.all([
                    getUnits(),
                    getIngredients(),
                    getRecipes(),
                    getCategories()
                ]);
                setUnits([CREATE_NEW_UNIT_OPTION, ...fetchedUnits]);
                setIngredientsList([CREATE_NEW_INGREDIENT_OPTION, ...fetchedIngredients]);
                setSubRecipesList(fetchedRecipes);
                setCategories([CREATE_NEW_CATEGORY_OPTION, ...fetchedCategories]);

                // --- Create the Combined List ---
                const ingredientOptions: IngredientOrRecipeOption[] = fetchedIngredients.map(ing => ({
                    id: ing.id,
                    name: ing.name,
                    type: 'ingredient'
                }));
                const recipeOptions: IngredientOrRecipeOption[] = fetchedRecipes.map(rec => ({
                    id: rec.id,
                    name: rec.name,
                    type: 'recipe'
                }));
                // Add the "Create New" option specifically for ingredients
                const createIngredientOption: IngredientOrRecipeOption = {
                    id: CREATE_NEW_INGREDIENT_OPTION.id, // Use the special -1 ID
                    name: CREATE_NEW_INGREDIENT_OPTION.name,
                    type: 'create-ingredient'
                };

                // Combine, add create option, and sort (e.g., ingredients first, then recipes, then create)
                const combined = [
                     createIngredientOption, // Ensure "Create New" is easily accessible (e.g., at top)
                     ...ingredientOptions.sort((a, b) => a.name.localeCompare(b.name)),
                     ...recipeOptions.sort((a, b) => a.name.localeCompare(b.name)),
                ];
                setCombinedIngredientOptions(combined);
                 // --- End Combined List Creation ---

                setUnitsError(null);
                setIngredientsError(null);
                setSubRecipesError(null);
                setCategoriesError(null);
            } catch (error) {
                console.error("Failed to load select data:", error);
                setUnitsError("Could not load units.");
                setIngredientsError("Could not load ingredients/recipes.");
                setSubRecipesError("Could not load potential sub-recipes.");
                setCategoriesError("Could not load categories.");
            } finally {
                setUnitsLoading(false);
                setIngredientsLoading(false);
                setSubRecipesLoading(false);
                setCategoriesLoading(false);
            }
        };
        loadSelectData();
    }, []); 

    const handleFormSubmit = (data: RecipeFormData) => {
        console.log("[RecipeForm] Raw data before calling onSubmit prop:", data);
        // Pass data directly - tags is already string[]
        onSubmit(data);
    };

    // --- Modal Logic --- 
    const handleOpenModal = (type: 'unit' | 'ingredient' | 'category', index: number) => {
        setModalSubmitError(null); // Clear previous errors
        setModalType(type);
        setModalTargetIndex(index); 
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalType(null);
        setModalTargetIndex(null);
        setModalSubmitError(null);
    };

    // Handle successful creation within the modal
    const handleModalCreateSuccess = (newItem: UnitOfMeasure | Ingredient | Category, type: 'unit' | 'ingredient' | 'category') => {
        let fieldToUpdate: string | null = null;
        if (type === 'unit') {
            // Update units list state
            const newUnits = [CREATE_NEW_UNIT_OPTION, ...units.filter(u => u.id !== -1), newItem as UnitOfMeasure].sort((a, b) => a.id === -1 ? -1 : (b.id === -1 ? 1: a.name.localeCompare(b.name)));
            setUnits(newUnits);
            
            if (modalTargetIndex === -1) { // Special index for Yield Unit
                fieldToUpdate = `yieldUnitId`;
            } else if (modalTargetIndex !== null) {
                fieldToUpdate = `ingredients.${modalTargetIndex}.unitId`;
            }
        } else if (type === 'ingredient') {
            const newIngredient = newItem as Ingredient;
            // Update original ingredientsList state (still used by modal?)
            const newIngredients = [CREATE_NEW_INGREDIENT_OPTION, ...ingredientsList.filter(i => i.id !== -1), newIngredient].sort((a, b) => a.id === -1 ? -1 : (b.id === -1 ? 1 : a.name.localeCompare(b.name)));
             setIngredientsList(newIngredients);
             
             // Update combined options list state
             const newCombinedOption: IngredientOrRecipeOption = {
                id: newIngredient.id,
                name: newIngredient.name,
                type: 'ingredient'
             };
             setCombinedIngredientOptions(prev => 
                [ // Rebuild to maintain sorting/structure if needed
                    prev.find(o => o.type === 'create-ingredient')!, // Keep create option
                    ...prev.filter(o => o.type === 'ingredient' && o.id !== -1), // Existing ingredients
                    newCombinedOption, // Add the new one
                    ...prev.filter(o => o.type === 'recipe') // Existing recipes
                ].sort((a, b) => { // Re-sort (create first, then alpha ingredients, then alpha recipes)
                    if (a.type === 'create-ingredient') return -1;
                    if (b.type === 'create-ingredient') return 1;
                    if (a.type === 'ingredient' && b.type !== 'ingredient') return -1;
                    if (a.type !== 'ingredient' && b.type === 'ingredient') return 1;
                    return a.name.localeCompare(b.name);
                })
             );

            if (modalTargetIndex !== null) {
                // Set the type and clear subRecipeId explicitly upon selecting the new ingredient
                setValue(`ingredients.${modalTargetIndex}.type`, 'ingredient');
                setValue(`ingredients.${modalTargetIndex}.subRecipeId`, ''); 
                fieldToUpdate = `ingredients.${modalTargetIndex}.ingredientId`;
            }
        } else if (type === 'category') {
            // Update categories list state
            const newCategories = [CREATE_NEW_CATEGORY_OPTION, ...categories.filter(c => c.id !== -1), newItem as Category].sort((a, b) => a.id === -1 ? -1 : (b.id === -1 ? 1 : a.name.localeCompare(b.name)));
            setCategories(newCategories);
            fieldToUpdate = `categoryId`;
        }
        if (fieldToUpdate) {
            setValue(fieldToUpdate as any, newItem.id, { shouldValidate: true });
        }
        handleCloseModal();
    };
    
    // --- End Modal Logic ---

    const handleRemoveIngredient = (index: number) => {
        setConfirmDialogProps({
            title: 'Remove Ingredient',
            contentText: 'Are you sure you want to remove this ingredient?',
            onConfirm: () => remove(index)
        });
        setConfirmDialogOpen(true);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
            
            {/* === TABS START === */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="recipe form sections">
                    <Tab label="Details" id="recipe-tab-0" aria-controls="recipe-tabpanel-0" />
                    <Tab label="Ingredients" id="recipe-tab-1" aria-controls="recipe-tabpanel-1" />
                    <Tab label="Instructions" id="recipe-tab-2" aria-controls="recipe-tabpanel-2" />
                </Tabs>
            </Box>

            {/* === TAB PANELS START === */}

            {/* --- Details Panel (Tab 0) --- */}
            <Box role="tabpanel" hidden={activeTab !== 0} id={`recipe-tabpanel-0`} aria-labelledby={`recipe-tab-0`} sx={{ pt: 2 }}>
                <Stack spacing={2}> 
            <TextField
                {...register("name", { required: "Recipe name is required" })}
                label="Recipe Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
            />
            <TextField
                {...register("description")}
                label="Description"
                fullWidth
                multiline
                rows={2}
            />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                    name="yieldQuantity"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Yield Qty" type="number" fullWidth InputLabelProps={{ shrink: true }} />
                    )}
                />
                <Controller
                    name="yieldUnitId"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            options={units} 
                            getOptionLabel={(option) => option.name || ''} 
                            value={units.find(unit => unit.id === field.value) || null} 
                            onChange={(event, newValue) => {
                                if (newValue && newValue.id === CREATE_NEW_UNIT_OPTION.id) {
                                    handleOpenModal('unit', -1); 
                                } else {
                                    field.onChange(newValue ? newValue.id : ''); 
                                }
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                            renderOption={(props, option) => (
                                <Box component="li" {...props} key={option.id}>
                                    {option.id === CREATE_NEW_UNIT_OPTION.id ? 
                                        <Typography color="primary">{option.name}</Typography> : 
                                        option.name
                                    }
                                </Box>
                            )}
                            loading={unitsLoading}
                            disabled={unitsLoading || !!unitsError}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="Yield Unit" 
                                    error={!!unitsError} 
                                    helperText={unitsError}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {unitsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            fullWidth
                        />
                    )}
                />
                <Controller
                    name="prepTimeMinutes"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Prep Time (min)" type="number" fullWidth InputLabelProps={{ shrink: true }} />
                    )}
                />
                <Controller
                    name="cookTimeMinutes"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Cook Time (min)" type="number" fullWidth InputLabelProps={{ shrink: true }} />
                    )}
                />
            </Stack>
                    <Controller
                        name="tags"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                            <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={field.value || []}
                                onChange={(event, newValue) => {
                                    const stringValues = newValue.map(value => 
                                        typeof value === 'string' ? value.trim() : (value as any).inputValue || ''
                                    ).filter(tag => tag !== '');
                                    field.onChange(stringValues);
                                }}
                                renderTags={(value: readonly string[], getTagProps) =>
                                    value.map((option: string, index: number) => (
                                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                    ))
                                }
                                renderInput={(params) => (
            <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Tags"
                                        placeholder="Add tags (e.g., vegan, quick, dessert)"
                                    />
                                )}
                            />
                        )}
            />
                    <FormControl fullWidth error={!!categoriesError || categoriesLoading}>
                <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                                    options={categories} 
                            getOptionLabel={(option) => option.name || ''}
                            value={categories.find(cat => cat.id === field.value) || null}
                            onChange={(event, newValue) => {
                                if (newValue && newValue.id === CREATE_NEW_CATEGORY_OPTION.id) {
                                            handleOpenModal('category', -2);
                                } else {
                                    field.onChange(newValue ? newValue.id : '');
                                }
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                            renderOption={(props, option) => (
                                <Box component="li" {...props} key={option.id}>
                                    {option.id === CREATE_NEW_CATEGORY_OPTION.id ? 
                                        <Typography color="primary">{option.name}</Typography> : 
                                        option.name
                                    }
                                </Box>
                            )}
                            loading={categoriesLoading}
                            disabled={categoriesLoading || !!categoriesError}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="Category (Optional)" 
                                    error={!!categoriesError} 
                                    helperText={categoriesError}
                                    InputLabelProps={{ 
                                        ...params.InputLabelProps,
                                        shrink: true 
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {categoriesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    )}
                />
            </FormControl>
                </Stack>
            </Box>

            {/* --- Ingredients Panel (Tab 1) --- */}
            <Box role="tabpanel" hidden={activeTab !== 1} id={`recipe-tabpanel-1`} aria-labelledby={`recipe-tab-1`} sx={{ pt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Ingredients</Typography>
                {(unitsError || ingredientsError) && (
                    <Alert severity="warning" sx={{ mb: 1 }}>
                        {unitsError} {ingredientsError}
                    </Alert>
                )}
                {fields.map((item, index) => {
                    return (
                        <Paper key={item.id} sx={{ p: 1.5, mb: 1.5, position: 'relative' }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                                <Box sx={{ flexBasis: '35%' }}>
                                    <Controller
                                        name={`ingredients.${index}.ingredientId`} 
                                        control={control}
                                        rules={{ 
                                            validate: (value, formValues) => {
                                                const currentItem = formValues.ingredients[index];
                                                if (currentItem.type === 'ingredient') {
                                                    return !!currentItem.ingredientId || 'Please select an ingredient.';
                                                } else if (currentItem.type === 'sub-recipe') {
                                                    return !!currentItem.subRecipeId || 'Please select a sub-recipe.';
                                                } else {
                                                    return 'Please select an ingredient or sub-recipe.';
                                                }
                                            }
                                         }}
                                        render={({ field, fieldState }) => {
                                            const currentIngredientId = watch(`ingredients.${index}.ingredientId`);
                                            const currentSubRecipeId = watch(`ingredients.${index}.subRecipeId`);
                                            const currentType = watch(`ingredients.${index}.type`);
                                            let currentValue: IngredientOrRecipeOption | null = null;
                                            if (currentType === 'ingredient' && currentIngredientId) {
                                                currentValue = combinedIngredientOptions.find(opt => opt.type === 'ingredient' && opt.id === currentIngredientId) ?? null;
                                            } else if (currentType === 'sub-recipe' && currentSubRecipeId) {
                                                currentValue = combinedIngredientOptions.find(opt => opt.type === 'recipe' && opt.id === currentSubRecipeId) ?? null;
                                            }
                                            return (
                                                <Autocomplete
                                                    options={combinedIngredientOptions}
                                                    getOptionLabel={(option) => option.name || ''}
                                                    value={currentValue || null} 
                                                    onChange={(event, newValue) => {
                                                        if (!newValue) {
                                                            setValue(`ingredients.${index}.ingredientId`, '');
                                                            setValue(`ingredients.${index}.subRecipeId`, '');
                                                            setValue(`ingredients.${index}.type`, '');
                                                        } else if (newValue.type === 'create-ingredient') {
                                                            handleOpenModal('ingredient', index);
                                                        } else if (newValue.type === 'ingredient') {
                                                            setValue(`ingredients.${index}.ingredientId`, newValue.id);
                                                            setValue(`ingredients.${index}.subRecipeId`, '');
                                                            setValue(`ingredients.${index}.type`, 'ingredient');
                                                        } else if (newValue.type === 'recipe') {
                                                            setValue(`ingredients.${index}.subRecipeId`, newValue.id);
                                                            setValue(`ingredients.${index}.ingredientId`, '');
                                                            setValue(`ingredients.${index}.type`, 'sub-recipe');
                                                        }
                                                    }}
                                                    isOptionEqualToValue={(option, val) => option.id === val?.id && option.type === val?.type}
                                                    renderOption={(props, option) => (
                                                        <Box component="li" {...props} key={`${option.type}-${option.id}`}>
                                                            {option.type === 'ingredient' && <LocalFloristIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />}
                                                            {option.type === 'recipe' && <RestaurantMenuIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />}
                                                            {option.type === 'create-ingredient' && <AddIcon fontSize="small" sx={{ mr: 1 }} />}
                                                            <Typography 
                                                                variant="body2" 
                                                                color={option.type === 'create-ingredient' ? 'primary' : 'inherit'}
                                                            >
                                                                {option.name}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    loading={ingredientsLoading || subRecipesLoading}
                                                    disabled={ingredientsLoading || subRecipesLoading || !!ingredientsError}
                                                    renderInput={(params) => (
                                                        <TextField 
                                                            {...params} 
                                                            label="Ingredient / Sub-Recipe" 
                                                            size="small"
                                                            required
                                                            error={!!ingredientsError || !!fieldState.error}
                                                            helperText={fieldState.error?.message || ingredientsError}
                                                            InputProps={{ 
                                                                ...params.InputProps,
                                                                endAdornment: (
                                                                    <>
                                                                        {(ingredientsLoading || subRecipesLoading) ? <CircularProgress color="inherit" size={20} /> : null}
                                                                        {params.InputProps.endAdornment}
                                                                    </>
                                                                ),
                                                            }}
                                                        />
                                                    )}
                                                    fullWidth
                                                />
                                            );
                                        }}
                                    />
                                </Box>
                                <Controller
                                    name={`ingredients.${index}.quantity`}
                                    control={control}
                                    rules={{ required: 'Qty required', min: { value: 0.01, message: "Qty > 0"} }}
                                    render={({ field, fieldState }) => (
                                        <TextField 
                                            {...field}
                                            label="Qty"
                                            type="number"
                                            required
                                            size="small"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            inputProps={{ step: "any" }}
                                            sx={{ flexBasis: '15%' }}
                                        />
                                    )}
                                />
                                <FormControl fullWidth size="small" sx={{ flexBasis: '20%' }} error={!!unitsError || unitsLoading}>
                                    <InputLabel 
                                        id={`ingredient-unit-label-${index}`}
                                        sx={{ 
                                            '&.MuiInputLabel-shrink': { 
                                                backgroundColor: (theme) => theme.palette.background.paper,
                                                paddingLeft: '4px',
                                                paddingRight: '4px',
                                            }
                                        }}
                                    >
                                        Unit
                                    </InputLabel>
                                    <Controller
                                        name={`ingredients.${index}.unitId`}
                                        control={control}
                                        rules={{ required: 'Unit required' }}
                                        render={({ field, fieldState }) => (
                                            <>
                                            <Select 
                                                labelId={`ingredient-unit-label-${index}`}
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => { 
                                                    const selectedValue = e.target.value;
                                                    if (selectedValue === CREATE_NEW_UNIT_OPTION.id) {
                                                        handleOpenModal('unit', index);
                                                    } else {
                                                        field.onChange(selectedValue);
                                                    }
                                                }}
                                                error={!!fieldState.error}
                                                disabled={unitsLoading || !!unitsError}
                                            >
                                                <MenuItem value="" disabled><em>Select Unit</em></MenuItem>
                                                {units.map((unit) => (
                                                    <MenuItem key={unit.id} value={unit.id} disabled={unit.id === -1 && !unitsLoading}>
                                                        {unit.id === CREATE_NEW_UNIT_OPTION.id ? 
                                                            <Typography color="primary" variant="body2">{unit.name}</Typography> :
                                                            unit.abbreviation || unit.name
                                                        }
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {fieldState.error && <Typography variant="caption" display="block" color="error" sx={{ pl: 2 }}>{fieldState.error.message}</Typography>}
                                            {unitsError && !fieldState.error && <Typography variant="caption" display="block" color="error" sx={{ pl: 2 }}>{unitsError}</Typography>}
                                            </>
                                        )}
                                    />
                                </FormControl>
                                <Box sx={{ flexBasis: '10%', textAlign: 'center', pt: 0.5 }}>
                                    <IconButton 
                                        onClick={() => handleRemoveIngredient(index)} 
                                        color="error" 
                                        disabled={fields.length <= 1} 
                                        sx={{ mt: 0.5 }}
                                    >
                                        <RemoveCircleOutlineIcon />
                                    </IconButton>
                                </Box>
                            </Stack>
                        </Paper>
                    );
                })}
                <Button
                    type="button"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => append({ type: '', ingredientId: '', subRecipeId: '', quantity: '', unitId: '' })}
                    sx={{ mt: 1 }}
                >
                    Add Ingredient / Sub-Recipe
                </Button>
            </Box>

            {/* --- Instructions Panel (Tab 2) --- */}
            <Box role="tabpanel" hidden={activeTab !== 2} id={`recipe-tabpanel-2`} aria-labelledby={`recipe-tab-2`} sx={{ pt: 2 }}>
                <Divider sx={{ my: 2 }}/>

                <Typography variant="h5" component="h3" gutterBottom>Instructions</Typography>
                {/* Use dangerouslySetInnerHTML to render formatted instructions */}
                {watch('instructions') && watch('instructions') !== '<p><br></p>' ? (
                    <Typography
                        variant="body1"
                        sx={{ mb: 4 }}
                        dangerouslySetInnerHTML={{ __html: watch('instructions') }}
                    />
                ) : (
                    <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic' }}>
                        No instructions provided.
                    </Typography>
                )}

                {/* Render Confirmation Dialog */}
                <ConfirmationDialog
                    open={confirmDialogOpen}
                    onClose={() => setConfirmDialogOpen(false)}
                    onConfirm={() => {
                        if (confirmDialogProps?.onConfirm) {
                            confirmDialogProps.onConfirm();
                        }
                        setConfirmDialogOpen(false);
                    }}
                    title={confirmDialogProps?.title || ''}
                    contentText={confirmDialogProps?.contentText || ''}
                />
            </Box>
            
            {/* === TAB PANELS END === */}

            {/* Submit Button (Outside Tabs) */}
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Recipe')}
            </Button>

            {/* Modals (Outside Tabs) */}
            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {modalType === 'unit' ? 'Create New Unit' : 
                     modalType === 'ingredient' ? 'Create New Ingredient' : 
                     modalType === 'category' ? 'Create New Category' : 'Create New'}
                </DialogTitle>
                <DialogContent>
                    {modalSubmitError && <Alert severity="error" sx={{ mb: 2 }}>{modalSubmitError}</Alert>}
                    {modalType === 'unit' && (
                        <UnitForm 
                            isSubmitting={isModalSubmitting}
                            onSubmit={async (data) => {
                                setIsModalSubmitting(true);
                                setModalSubmitError(null);
                                try {
                                    const newUnit = await createUnit(data);
                                    handleModalCreateSuccess(newUnit, 'unit');
                                } catch (err: any) {
                                    const msg = err.response?.data?.message || err.message || 'Failed to create unit';
                                    setModalSubmitError(msg);
                                } finally {
                                    setIsModalSubmitting(false);
                                }
                            }} 
                        />
                    )}
                     {modalType === 'ingredient' && (
                        <IngredientForm 
                            isSubmitting={isModalSubmitting}
                            onSubmit={async (data: IngredientFormShape) => {
                                 setIsModalSubmitting(true);
                                 setModalSubmitError(null);
                                 
                                 // Process IngredientFormShape into ApiIngredientFormData
                                 const payload: ApiIngredientFormData = {
                                     name: data.name,
                                     description: data.description || null,
                                     ingredientCategoryId: data.ingredientCategoryId 
                                                             ? parseInt(String(data.ingredientCategoryId), 10) || null 
                                                             : null
                                 };

                                 try {
                                    const newIng = await createIngredient(payload); // Pass processed payload
                                    handleModalCreateSuccess(newIng, 'ingredient');
                                } catch (err: any) {
                                    const msg = err.response?.data?.message || err.message || 'Failed to create ingredient';
                                    setModalSubmitError(msg);
                                } finally {
                                    setIsModalSubmitting(false);
                                }
                            }}
                        />
                    )}
                    {modalType === 'category' && (
                        <CategoryForm 
                            isSubmitting={isModalSubmitting}
                            onSubmit={async (data) => {
                                setIsModalSubmitting(true);
                                setModalSubmitError(null);
                                try {
                                    const newCat = await createCategory(data as any);
                                    handleModalCreateSuccess(newCat, 'category');
                                } catch (err: any) {
                                    const msg = err.response?.data?.message || err.message || 'Failed to create category';
                                    setModalSubmitError(msg);
                                } finally {
                                    setIsModalSubmitting(false);
                                }
                            }} 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default RecipeForm; 