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
    CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
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
import IngredientForm from './IngredientForm';
import CategoryForm from './CategoryForm';

// Interface for the raw form data
// Export this interface as well
export interface RecipeFormData {
    name: string;
    description: string;
    yieldQuantity: number | string;
    yieldUnitId: number | string;
    prepTimeMinutes: number | string;
    cookTimeMinutes: number | string;
    tags: string;
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

// Interface for the data structure after processing, ready for API
export interface ProcessedRecipeData {
    name: string;
    description: string;
    yieldQuantity: number | null;
    yieldUnitId: number | null;
    prepTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    tags: string[];
    instructions: string;
    categoryId: number | null;
    ingredients: { 
        ingredientId?: number;
        subRecipeId?: number; 
        quantity: number; 
        unitId: number | null;
        order: number; 
    }[];
}

interface RecipeFormProps {
    onSubmit: (data: ProcessedRecipeData) => void;
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
            tags: '',
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

    // State for the creation modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'unit' | 'ingredient' | 'category' | null>(null);
    // Store the index of the ingredient row that triggered the modal
    const [modalTargetIndex, setModalTargetIndex] = useState<number | null>(null); 
    const [modalSubmitError, setModalSubmitError] = useState<string | null>(null);
    const [isModalSubmitting, setIsModalSubmitting] = useState<boolean>(false);

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
                setUnitsError(null);
                setIngredientsError(null);
                setSubRecipesError(null);
                setCategoriesError(null);
            } catch (error) {
                console.error("Failed to load select data:", error);
                setUnitsError("Could not load units.");
                setIngredientsError("Could not load ingredients.");
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

    // Watch the type field for each ingredient to conditionally render selects
    const watchIngredientTypes = watch("ingredients");

    const handleFormSubmit = (data: RecipeFormData) => {
        // Process data before calling onSubmit
        const processedData: ProcessedRecipeData = {
            name: data.name,
            description: data.description,
            instructions: data.instructions,
            tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            yieldQuantity: data.yieldQuantity ? parseFloat(data.yieldQuantity as string) : null,
            yieldUnitId: data.yieldUnitId ? parseInt(data.yieldUnitId as string, 10) : null,
            prepTimeMinutes: data.prepTimeMinutes ? parseInt(data.prepTimeMinutes as string, 10) : null,
            cookTimeMinutes: data.cookTimeMinutes ? parseInt(data.cookTimeMinutes as string, 10) : null,
            categoryId: data.categoryId ? parseInt(data.categoryId as string, 10) : null,
            ingredients: data.ingredients.map((ing, index) => ({
                ingredientId: ing.type === 'ingredient' && ing.ingredientId ? parseInt(ing.ingredientId as string, 10) : undefined,
                subRecipeId: ing.type === 'sub-recipe' && ing.subRecipeId ? parseInt(ing.subRecipeId as string, 10) : undefined,
                quantity: ing.quantity ? parseFloat(ing.quantity as string) : 0,
                unitId: ing.unitId ? parseInt(ing.unitId as string, 10) : null,
                order: index
            })).filter(ing => ing.ingredientId || ing.subRecipeId)
        };
        onSubmit(processedData);
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
            setUnits(prev => [CREATE_NEW_UNIT_OPTION, ...prev.filter(u => u.id !== -1), newItem as UnitOfMeasure].sort((a, b) => a.id === -1 ? -1 : (b.id === -1 ? 1: a.name.localeCompare(b.name))));
            if (modalTargetIndex === -1) { // Special index for Yield Unit
                fieldToUpdate = `yieldUnitId`;
            } else if (modalTargetIndex !== null) {
                fieldToUpdate = `ingredients.${modalTargetIndex}.unitId`;
            }
        } else if (type === 'ingredient') {
             setIngredientsList(prev => [CREATE_NEW_INGREDIENT_OPTION, ...prev.filter(i => i.id !== -1), newItem as Ingredient].sort((a, b) => a.id === -1 ? -1 : (b.id === -1 ? 1 : a.name.localeCompare(b.name))));
            if (modalTargetIndex !== null) {
                setValue(`ingredients.${modalTargetIndex}.type`, 'ingredient');
                setValue(`ingredients.${modalTargetIndex}.subRecipeId`, ''); 
                fieldToUpdate = `ingredients.${modalTargetIndex}.ingredientId`;
            }
        } else if (type === 'category') {
            setCategories(prev => [CREATE_NEW_CATEGORY_OPTION, ...prev.filter(c => c.id !== -1), newItem as Category].sort((a, b) => a.id === -1 ? -1 : (b.id === -1 ? 1 : a.name.localeCompare(b.name))));
            fieldToUpdate = `categoryId`;
        }
        if (fieldToUpdate) {
            setValue(fieldToUpdate as any, newItem.id, { shouldValidate: true });
        }
        handleCloseModal();
    };
    
    // --- End Modal Logic ---

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
            <TextField
                {...register("name", { required: "Recipe name is required" })}
                label="Recipe Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
            />
            <TextField
                {...register("description")}
                label="Description"
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
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
                                    // Use special index -1 for yield unit trigger
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
            <TextField
                {...register("tags")}
                label="Tags (comma-separated)"
                fullWidth
                sx={{ mb: 2 }}
            />
            <TextField
                {...register("instructions", { required: "Instructions are required" })}
                label="Instructions"
                fullWidth
                required
                multiline
                rows={6}
                error={!!errors.instructions}
                helperText={errors.instructions?.message}
                sx={{ mb: 2 }}
            />

            {/* Category Selector */}
            <FormControl fullWidth sx={{ mb: 2 }} error={!!categoriesError || categoriesLoading}>
                <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            options={categories} // Use fetched categories
                            getOptionLabel={(option) => option.name || ''}
                            value={categories.find(cat => cat.id === field.value) || null}
                            onChange={(event, newValue) => {
                                if (newValue && newValue.id === CREATE_NEW_CATEGORY_OPTION.id) {
                                    handleOpenModal('category', -2); // Use different special index for category
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

            <Box>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Ingredients</Typography>
                {(unitsError || ingredientsError) && (
                    <Alert severity="warning" sx={{ mb: 1 }}>
                        {unitsError} {ingredientsError}
                    </Alert>
                )}
                {fields.map((item, index) => {
                    const currentType = watchIngredientTypes?.[index]?.type;
                    return (
                        <Paper key={item.id} sx={{ p: 1.5, mb: 1.5, position: 'relative' }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                                <FormControl fullWidth size="small" required sx={{ minWidth: 120, flexBasis: '20%' }}>
                                    <InputLabel id={`ingredient-item-type-label-${index}`}>Type</InputLabel>
                                    <Controller
                                        name={`ingredients.${index}.type`}
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: 'Type required' }}
                                        render={({ field }) => (
                                            <Select 
                                                labelId={`ingredient-item-type-label-${index}`} 
                                                label="Type" 
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    if (e.target.value === 'ingredient') {
                                                        setValue(`ingredients.${index}.subRecipeId`, '');
                                                    } else if (e.target.value === 'sub-recipe') {
                                                        setValue(`ingredients.${index}.ingredientId`, '');
                                                    }
                                                }}
                                                error={!!errors.ingredients?.[index]?.type}
                                            >
                                                <MenuItem value=""><em>Select Type</em></MenuItem>
                                                <MenuItem value="ingredient">Base Ingredient</MenuItem>
                                                <MenuItem value="sub-recipe">Sub-Recipe</MenuItem>
                                            </Select>
                                        )}
                                    />
                                </FormControl>

                                <Box sx={{ flexBasis: '35%' }}>
                                    {currentType === 'ingredient' && (
                                        <Controller
                                            name={`ingredients.${index}.ingredientId`}
                                            control={control}
                                            rules={{ required: currentType === 'ingredient' ? 'Ingredient required' : false }}
                                            render={({ field }) => (
                                                <Autocomplete
                                                    options={ingredientsList}
                                                    getOptionLabel={(option) => option.name || ''}
                                                    value={ingredientsList.find(ing => ing.id === field.value) || null}
                                                    onChange={(event, newValue) => {
                                                        if (newValue && newValue.id === CREATE_NEW_INGREDIENT_OPTION.id) {
                                                            handleOpenModal('ingredient', index);
                                                        } else {
                                                            field.onChange(newValue ? newValue.id : '');
                                                        }
                                                    }}
                                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                                    renderOption={(props, option) => (
                                                        <Box component="li" {...props} key={option.id}>
                                                            {option.id === CREATE_NEW_INGREDIENT_OPTION.id ? 
                                                                <Typography color="primary" variant="body2">{option.name}</Typography> : 
                                                                option.name
                                                            }
                                                        </Box>
                                                    )}
                                                    loading={ingredientsLoading}
                                                    disabled={ingredientsLoading || !!ingredientsError}
                                                    renderInput={(params) => (
                                                        <TextField 
                                                            {...params} 
                                                            label="Ingredient" 
                                                            size="small"
                                                            required={currentType === 'ingredient'}
                                                            error={!!ingredientsError || !!errors.ingredients?.[index]?.ingredientId}
                                                            helperText={ingredientsError}
                                                            InputProps={{ 
                                                                ...params.InputProps,
                                                                endAdornment: (
                                                                    <>
                                                                        {ingredientsLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
                                    )}
                                    {currentType === 'sub-recipe' && (
                                        <Controller
                                            name={`ingredients.${index}.subRecipeId`}
                                            control={control}
                                            rules={{ required: currentType === 'sub-recipe' ? 'Sub-recipe required' : false }}
                                            render={({ field }) => (
                                                <Autocomplete
                                                    options={subRecipesList}
                                                    getOptionLabel={(option) => option.name || ''}
                                                    value={subRecipesList.find(sr => sr.id === field.value) || null}
                                                    onChange={(event, newValue) => field.onChange(newValue ? newValue.id : '')}
                                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                                    loading={subRecipesLoading}
                                                    disabled={subRecipesLoading || !!subRecipesError}
                                                    renderInput={(params) => (
                                                        <TextField 
                                                            {...params} 
                                                            label="Sub-Recipe" 
                                                            size="small"
                                                            required={currentType === 'sub-recipe'}
                                                            error={!!subRecipesError || !!errors.ingredients?.[index]?.subRecipeId}
                                                            helperText={subRecipesError}
                                                            InputProps={{
                                                                ...params.InputProps,
                                                                endAdornment: (
                                                                    <>
                                                                        {subRecipesLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
                                    )}
                                    {!currentType && (
                                        <TextField label="Item" size="small" fullWidth disabled value="Select Type first" />
                                    )}
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
                                    <InputLabel id={`ingredient-unit-label-${index}`}>Unit</InputLabel>
                                    <Controller
                                        name={`ingredients.${index}.unitId`}
                                        control={control}
                                        render={({ field }) => (
                                            <Autocomplete
                                                options={units}
                                                getOptionLabel={(option) => option.abbreviation || option.name || ''}
                                                value={units.find(unit => unit.id === field.value) || null}
                                                onChange={(event, newValue) => {
                                                    if (newValue && newValue.id === CREATE_NEW_UNIT_OPTION.id) {
                                                        handleOpenModal('unit', index);
                                                    } else {
                                                        field.onChange(newValue ? newValue.id : '');
                                                    }
                                                }}
                                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                                                renderOption={(props, option) => (
                                                    <Box component="li" {...props} key={option.id}>
                                                        {option.id === CREATE_NEW_UNIT_OPTION.id ? 
                                                            <Typography color="primary" variant="body2">{option.name}</Typography> :
                                                            option.abbreviation || option.name
                                                        }
                                                    </Box>
                                                )}
                                                loading={unitsLoading}
                                                disabled={unitsLoading || !!unitsError}
                                                renderInput={(params) => (
                                                    <TextField 
                                                        {...params} 
                                                        label="Unit" 
                                                        size="small"
                                                        error={!!unitsError || !!errors.ingredients?.[index]?.unitId}
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
                                                sx={{ flexBasis: '20%' }} 
                                            />
                                        )}
                                    />
                                </FormControl>
                                <Box sx={{ flexBasis: '10%', textAlign: 'center', pt: 0.5 }}>
                                    <IconButton 
                                        onClick={() => remove(index)} 
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

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating...' : 'Create Recipe'}
            </Button>

            {/* Creation Modal */}
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
                            onSubmit={async (data) => {
                                 setIsModalSubmitting(true);
                                 setModalSubmitError(null);
                                 try {
                                    const newIng = await createIngredient(data);
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
                 {/* Optional: Add Actions with Cancel button to modal */}
            </Dialog>
        </Box>
    );
};

export default RecipeForm; 