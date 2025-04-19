// frontend/src/components/forms/LoginForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, TextField, Button, Stack } from '@mui/material';
import { UserCredentials } from '../../services/apiService'; // Import type

interface LoginFormProps {
    onSubmit: (data: UserCredentials) => void;
    isSubmitting: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isSubmitting }) => {
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<UserCredentials>();

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <Stack spacing={2}>
                <TextField
                    {...register("email", { required: "Email is required" })}
                    type="email"
                    label="Email Address"
                    fullWidth
                    required
                    autoFocus // Focus email field first
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />
                <TextField
                    {...register("password", { required: "Password is required" })}
                    type="password"
                    label="Password"
                    fullWidth
                    required
                    error={!!errors.password}
                    helperText={errors.password?.message}
                />
            </Stack>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
        </Box>
    );
};

export default LoginForm; 