export interface UserProfile {
    id: number;
    name: string | null;
    email: string;
    role: 'USER' | 'ADMIN' | 'SUPERADMIN';
    company?: string;
    position?: string;
    phone?: string;
    address?: string;
    bio?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserCredentials {
    email: string;
    password: string;
    name?: string;
}

export interface AuthResponse extends UserProfile {
    token: string;
} 