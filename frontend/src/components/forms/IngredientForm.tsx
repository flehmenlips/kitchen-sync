import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, TextField, Button, Grid } from '@mui/material';

// Interface for the raw form data
export interface IngredientFormData {
    name: string;
    description: string | null; // Allow null for initial data consistency
}

// Interface for processed data sent to API
interface ProcessedIngredientFormData {
    name: string;
    description: string | null; // Can be null after processing
}

interface IngredientFormProps {
    onSubmit: (data: ProcessedIngredientFormData) => void; // Use processed type
    initialData?: Partial<IngredientFormData>;
    isSubmitting: boolean;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<IngredientFormData>({
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
        }
    });

    const handleFormSubmit = (data: IngredientFormData) => {
        // Type the payload explicitly
        const payload: ProcessedIngredientFormData = {
            name: data.name,
            description: data.description || null // Convert empty string to null
        };
        onSubmit(payload);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        {...register("name", { required: "Ingredient name is required" })}
                        label="Ingredient Name"
                        fullWidth
                        required
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        {...register("description")}
                        label="Description (Optional)"
                        fullWidth
                        multiline
                        rows={3}
                    />
                </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Ingredient')}
            </Button>
        </Box>
    );
};

export default IngredientForm; 