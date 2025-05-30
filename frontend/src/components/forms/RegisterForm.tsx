// frontend/src/components/forms/RegisterForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, TextField, Button, Stack, FormControlLabel, Checkbox, Link } from '@mui/material';
import { UserCredentials } from '../../types/user';
import { useLegalDocuments } from '../../hooks/useLegalDocuments';

interface RegisterFormData extends UserCredentials {
    confirmPassword?: string;
}

interface RegisterFormProps {
    onSubmit: (data: UserCredentials) => void;
    isSubmitting: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isSubmitting }) => {
    const {
        handleSubmit,
        register,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>();

    const [eulaAccepted, setEulaAccepted] = useState(false);
    const [formError, setFormError] = useState('');
    const password = watch('password'); // Watch password field for confirmation
    const { showEULA, LegalDocumentModals } = useLegalDocuments();

    const handleFormSubmit = (data: RegisterFormData) => {
        if (!eulaAccepted) {
            setFormError('You must agree to the End User License Agreement (EULA) to create an account.');
            return;
        }
        setFormError('');
        onSubmit(data);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
            <Stack spacing={2}>
                <TextField
                    {...register("name")}
                    label="Name (Optional)"
                    fullWidth
                    autoFocus 
                />
                <TextField
                    {...register("email", { required: "Email is required" })}
                    type="email"
                    label="Email Address"
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />
                <TextField
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters"} })}
                    type="password"
                    label="Password"
                    fullWidth
                    required
                    error={!!errors.password}
                    helperText={errors.password?.message}
                />
                <TextField
                    {...register("confirmPassword", { 
                        required: "Please confirm password", 
                        validate: value => value === password || "Passwords do not match" 
                    })}
                    type="password"
                    label="Confirm Password"
                    fullWidth
                    required
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={eulaAccepted}
                            onChange={(e) => {
                                setEulaAccepted(e.target.checked);
                                setFormError('');
                            }}
                            color="primary"
                        />
                    }
                    label={
                        <Box component="span">
                            I have read and agree to the{' '}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    showEULA();
                                }}
                            >
                                End User License Agreement (EULA)
                            </Link>
                        </Box>
                    }
                />
                {formError && <Box sx={{ color: 'error.main', typography: 'body2' }}>{formError}</Box>}
            </Stack>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Registering...' : 'Sign Up'}
            </Button>
            <LegalDocumentModals />
        </Box>
    );
};

export default RegisterForm; 