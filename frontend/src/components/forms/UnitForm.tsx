import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, TextField, Button, Grid, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';

// Interface for the raw form data from react-hook-form
interface UnitFormData {
    name: string;
    abbreviation: string; // TextField value is always string
    type: string; 
}

// Interface for processed data sent to API
interface ProcessedUnitFormData {
    name: string;
    abbreviation: string | null; // Can be null after processing
    type: string | null; // Can be null after processing
}

// TODO: Ideally get these enum keys from backend or shared types
const UNIT_TYPES = ['WEIGHT', 'VOLUME', 'COUNT', 'OTHER'];

interface UnitFormProps {
    onSubmit: (data: ProcessedUnitFormData) => void; // Expect processed data
    initialData?: Partial<UnitFormData>; // Initial data matches form shape
    isSubmitting: boolean;
}

const UnitForm: React.FC<UnitFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
    const {
        handleSubmit,
        control,
        register,
        formState: { errors },
    } = useForm<UnitFormData>({
        defaultValues: initialData || {
            name: '',
            abbreviation: '',
            type: '',
        }
    });

    const handleFormSubmit = (data: UnitFormData) => {
        // Process before calling the passed onSubmit
        const payload: ProcessedUnitFormData = {
            name: data.name,
            abbreviation: data.abbreviation || null,
            type: data.type || null
        };
        onSubmit(payload);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
            <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        {...register("name", { required: "Unit name is required" })}
                        label="Unit Name"
                        fullWidth
                        required
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                    <TextField
                        {...register("abbreviation")}
                        label="Abbreviation"
                        fullWidth
                    />
                </Stack>
                <FormControl fullWidth>
                    <InputLabel id="unit-type-label">Type (Optional)</InputLabel>
                    <Controller
                        name="type"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <Select labelId="unit-type-label" label="Type (Optional)" {...field} value={field.value ?? ''}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                {UNIT_TYPES.map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                </FormControl>
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Unit')}
            </Button>
        </Box>
    );
};

export default UnitForm; 