import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, TextField, Button, Stack } from '@mui/material';

// Raw form data
export interface CategoryFormData {
    name: string;
    description: string | null;
}

// Processed data for API
interface ProcessedCategoryFormData {
    name: string;
    description: string | null;
}

interface CategoryFormProps {
    onSubmit: (data: ProcessedCategoryFormData) => void;
    initialData?: Partial<CategoryFormData>;
    isSubmitting: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<CategoryFormData>({
        defaultValues: {
             name: initialData?.name || '',
             description: initialData?.description || '',
        }
    });

    const handleFormSubmit = (data: CategoryFormData) => {
        // Process description (empty string to null)
        const payload: ProcessedCategoryFormData = {
            ...data,
            description: data.description || null,
        };
        onSubmit(payload);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
            <Stack spacing={2}>
                <TextField
                    {...register("name", { required: "Category name is required" })}
                    label="Category Name"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />
                <TextField
                    {...register("description")}
                    label="Description (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                />
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Category')}
            </Button>
        </Box>
    );
};

export default CategoryForm; 