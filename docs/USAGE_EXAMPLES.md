# KitchenSync Usage Examples & Developer Guide

## Overview

This guide provides practical examples for developers working with the KitchenSync API and components. It includes common use cases, code examples, and best practices.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication Examples](#authentication-examples)
3. [Recipe Management](#recipe-management)
4. [Menu Building](#menu-building)
5. [Reservation System](#reservation-system)
6. [Customer Portal](#customer-portal)
7. [Website Builder](#website-builder)
8. [Multi-tenant Setup](#multi-tenant-setup)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

## Quick Start

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/your-org/kitchensync.git
cd kitchensync

# Install dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local

# Start the development servers
npm run dev:all
```

### Environment Configuration

```bash
# backend/.env.local
DATABASE_URL="postgresql://user:password@localhost:5432/kitchensync_local"
JWT_SECRET="your-jwt-secret-here"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
STRIPE_SECRET_KEY="sk_test_..."
EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
```

### Basic API Client Setup

```typescript
// frontend/src/utils/apiClient.ts
import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Authentication Examples

### Staff Login

```typescript
// Login a staff member
const loginStaff = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/api/users/login', {
      email,
      password
    });
    
    const { token, user } = response.data;
    
    // Store token and user data
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: error.response?.data?.message };
  }
};

// Usage
const handleLogin = async () => {
  const result = await loginStaff('chef@restaurant.com', 'password123');
  if (result.success) {
    navigate('/dashboard');
  } else {
    setError(result.error);
  }
};
```

### Customer Authentication

```typescript
// Register a new customer
const registerCustomer = async (customerData: CustomerRegistrationData) => {
  try {
    const response = await apiClient.post('/api/auth/customer/register', {
      email: customerData.email,
      password: customerData.password,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      restaurantSubdomain: customerData.restaurantSubdomain
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message };
  }
};

// Customer login with subdomain
const loginCustomer = async (email: string, password: string, subdomain: string) => {
  try {
    const response = await apiClient.post('/api/auth/customer/login', {
      email,
      password,
      restaurantSubdomain: subdomain
    });
    
    const { accessToken, refreshToken, customer } = response.data;
    
    // Store tokens
    localStorage.setItem('customer_access_token', accessToken);
    localStorage.setItem('customer_refresh_token', refreshToken);
    localStorage.setItem('customer_data', JSON.stringify(customer));
    
    return { success: true, customer };
  } catch (error) {
    return { success: false, error: error.response?.data?.message };
  }
};
```

## Recipe Management

### Creating a Recipe

```typescript
interface CreateRecipeData {
  name: string;
  description?: string;
  instructions: string;
  yieldQuantity?: number;
  yieldUnitId?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  categoryId?: number;
  tags: string[];
  ingredients: {
    ingredientId?: number;
    subRecipeId?: number;
    quantity: number;
    unitId: number;
    order: number;
  }[];
}

const createRecipe = async (recipeData: CreateRecipeData) => {
  try {
    const response = await apiClient.post('/api/recipes', recipeData);
    return { success: true, recipe: response.data.recipe };
  } catch (error) {
    return { success: false, error: error.response?.data?.message };
  }
};

// Example usage
const marinara = {
  name: "Marinara Sauce",
  description: "Classic Italian tomato sauce",
  instructions: `1. Heat olive oil in a large saucepan over medium heat.
2. Add minced garlic and cook until fragrant, about 1 minute.
3. Add crushed tomatoes, salt, and pepper.
4. Simmer for 20-30 minutes, stirring occasionally.
5. Taste and adjust seasoning as needed.`,
  yieldQuantity: 32,
  yieldUnitId: 1, // fluid ounces
  prepTimeMinutes: 10,
  cookTimeMinutes: 30,
  categoryId: 2, // Sauces
  tags: ["italian", "sauce", "tomato", "vegetarian"],
  ingredients: [
    {
      ingredientId: 1, // Olive oil
      quantity: 2,
      unitId: 15, // tablespoons
      order: 0
    },
    {
      ingredientId: 2, // Garlic
      quantity: 3,
      unitId: 25, // cloves
      order: 1
    },
    {
      ingredientId: 3, // Crushed tomatoes
      quantity: 28,
      unitId: 5, // ounces
      order: 2
    }
  ]
};

const result = await createRecipe(marinara);
```

### Scaling a Recipe

```typescript
const scaleRecipe = async (recipeId: number, scaleFactor: number) => {
  try {
    const response = await apiClient.post(`/api/recipes/${recipeId}/scale`, {
      scaleFactor
    });
    
    return { success: true, scaledRecipe: response.data.scaledRecipe };
  } catch (error) {
    return { success: false, error: error.response?.data?.message };
  }
};

// Scale recipe to serve 50 people instead of 10
const scaleForBanquet = async (recipeId: number) => {
  const result = await scaleRecipe(recipeId, 5.0);
  if (result.success) {
    console.log('Scaled recipe:', result.scaledRecipe);
  }
};
```

### Recipe Search and Filtering

```typescript
const searchRecipes = async (filters: RecipeFilters) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category.toString());
  if (filters.tags?.length) params.append('tags', filters.tags.join(','));
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  try {
    const response = await apiClient.get(`/api/recipes?${params}`);
    return {
      success: true,
      recipes: response.data.recipes,
      totalCount: response.data.totalCount,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    return { success: false, error: error.response?.data?.message };
  }
};

// Usage
const findItalianSauces = async () => {
  const result = await searchRecipes({
    search: 'sauce',
    category: 2, // Sauces category
    tags: ['italian'],
    page: 1,
    limit: 20
  });
  
  if (result.success) {
    result.recipes.forEach(recipe => {
      console.log(`${recipe.name} - ${recipe.description}`);
    });
  }
};
```

## Menu Building

### Creating a Menu with Sections

```typescript
const createMenuWithSections = async () => {
  // First, create the menu
  const menuData = {
    name: "Dinner Menu",
    title: "Evening Selection",
    subtitle: "Fresh, Seasonal Ingredients",
    font: "Playfair Display",
    layout: "single",
    backgroundColor: "#ffffff",
    textColor: "#333333",
    accentColor: "#d4af37"
  };
  
  const menuResult = await apiClient.post('/api/menus', menuData);
  if (!menuResult.data.success) {
    throw new Error('Failed to create menu');
  }
  
  const menu = menuResult.data.menu;
  
  // Add sections to the menu
  const sections = [
    { name: "Appetizers", position: 0 },
    { name: "Soups & Salads", position: 1 },
    { name: "Main Courses", position: 2 },
    { name: "Desserts", position: 3 }
  ];
  
  for (const sectionData of sections) {
    await apiClient.post(`/api/menus/${menu.id}/sections`, sectionData);
  }
  
  return menu;
};
```

### Adding Menu Items with Recipes

```typescript
const addMenuItemsToSection = async (sectionId: number, items: MenuItemData[]) => {
  const results = [];
  
  for (const item of items) {
    try {
      const response = await apiClient.post(`/api/menu-sections/${sectionId}/items`, {
        name: item.name,
        description: item.description,
        price: item.price,
        recipeId: item.recipeId,
        position: item.position,
        active: true
      });
      
      results.push({ success: true, item: response.data.item });
    } catch (error) {
      results.push({ success: false, error: error.response?.data?.message });
    }
  }
  
  return results;
};

// Example: Add items to appetizers section
const appetizerItems = [
  {
    name: "Bruschetta",
    description: "Toasted bread with fresh tomatoes and basil",
    price: "8.99",
    recipeId: 15,
    position: 0
  },
  {
    name: "Calamari Fritti",
    description: "Crispy squid rings with marinara sauce",
    price: "12.99",
    recipeId: 22,
    position: 1
  }
];

await addMenuItemsToSection(appetizersSection.id, appetizerItems);
```

## Reservation System

### Creating Customer Reservations

```typescript
const createReservation = async (reservationData: CreateReservationData) => {
  try {
    const response = await apiClient.post('/api/customer/reservations', {
      restaurantId: reservationData.restaurantId,
      partySize: reservationData.partySize,
      reservationDate: reservationData.date, // YYYY-MM-DD format
      reservationTime: reservationData.time, // HH:MM format
      specialRequests: reservationData.specialRequests
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('customer_access_token')}`
      }
    });
    
    return { success: true, reservation: response.data.reservation };
  } catch (error) {
    return { success: false, error: error.response?.data?.message };
  }
};

// Example reservation
const bookTable = async () => {
  const reservationData = {
    restaurantId: 1,
    partySize: 4,
    date: "2024-03-25",
    time: "19:00",
    specialRequests: "Window table if available, celebrating anniversary"
  };
  
  const result = await createReservation(reservationData);
  if (result.success) {
    console.log('Reservation created:', result.reservation);
    // Send confirmation email automatically handled by backend
  }
};
```

### Staff Reservation Management

```typescript
const getReservationsForDate = async (date: string) => {
  try {
    const response = await apiClient.get(`/api/reservations?date=${date}`);
    return { success: true, reservations: response.data.reservations };
  } catch (error) {
    return { success: false, error: error.response?.data?.message };
  }
};

const updateReservationStatus = async (reservationId: number, status: ReservationStatus) => {
  try {
    const response = await apiClient.put(`/api/reservations/${reservationId}`, {
      status
    });
    
    return { success: true, reservation: response.data.reservation };
  } catch (error) {
    return { success: false, error: error.response?.data?.message };
  }
};

// Check in a customer
const checkInCustomer = async (reservationId: number) => {
  const result = await updateReservationStatus(reservationId, 'SEATED');
  if (result.success) {
    // Update actual arrival time
    await apiClient.put(`/api/reservations/${reservationId}`, {
      actualArrivalTime: new Date().toISOString()
    });
  }
};
```

## Customer Portal

### Setting Up Customer Portal Routes

```typescript
// CustomerPortalRouter.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CustomerLayout } from '../components/customer/CustomerLayout';
import { CustomerHomePage } from '../pages/customer/CustomerHomePage';
import { CustomerMenuPage } from '../pages/customer/CustomerMenuPage';
import { CustomerReservationPage } from '../pages/customer/CustomerReservationPage';

interface CustomerPortalRouterProps {
  restaurantSubdomain: string;
}

export const CustomerPortalRouter: React.FC<CustomerPortalRouterProps> = ({ 
  restaurantSubdomain 
}) => {
  return (
    <CustomerLayout restaurantSubdomain={restaurantSubdomain}>
      <Routes>
        <Route path="/" element={<CustomerHomePage />} />
        <Route path="/menu" element={<CustomerMenuPage />} />
        <Route path="/reservations" element={<CustomerReservationPage />} />
        <Route path="/account" element={<CustomerAccountPage />} />
      </Routes>
    </CustomerLayout>
  );
};
```

### Customer Registration Form

```typescript
const CustomerRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { restaurantSubdomain } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const result = await registerCustomer({
      ...formData,
      restaurantSubdomain
    });

    if (result.success) {
      setSuccess('Registration successful! Please check your email to verify your account.');
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <TextField
        label="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        required
      />
      {/* More fields... */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};
```

## Website Builder

### Applying Templates and Themes

```typescript
const applyRestaurantTemplate = async (restaurantId: number, templateId: string) => {
  try {
    const response = await apiClient.post(`/api/website-builder/${restaurantId}/template`, {
      templateId
    });
    
    return { success: true, config: response.data.config };
  } catch (error) {
    return { success: false, error: error.response?.data?.message };
  }
};

const updateRestaurantTheme = async (restaurantId: number, themeConfig: ThemeConfig) => {
  try {
    const response = await apiClient.put(`/api/theming/${restaurantId}/theme`, themeConfig);
    return { success: true, theme: response.data.theme };
  } catch (error) {
    return { success: false, error: error.response?.data?.message };
  }
};

// Example: Set up a modern restaurant theme
const setupModernTheme = async (restaurantId: number) => {
  const themeConfig = {
    colors: {
      primary: '#2c3e50',
      secondary: '#e74c3c',
      accent: '#f39c12',
      background: '#ffffff',
      text: '#2c3e50'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Open Sans',
      fontSize: {
        base: '16px',
        heading1: '2.5rem',
        heading2: '2rem'
      }
    },
    layout: {
      headerStyle: 'modern',
      navigationStyle: 'horizontal',
      footerStyle: 'minimal'
    }
  };
  
  await updateRestaurantTheme(restaurantId, themeConfig);
};
```

### Managing Content Blocks

```typescript
const addHeroSection = async (restaurantId: number) => {
  const heroBlock = {
    type: 'hero',
    title: 'Welcome to Bella Vista',
    subtitle: 'Authentic Italian Cuisine in the Heart of the City',
    content: 'Experience the finest Italian dining with fresh, locally-sourced ingredients and traditional recipes passed down through generations.',
    imageUrl: 'https://cloudinary.com/restaurant-hero.jpg',
    ctaText: 'Make a Reservation',
    ctaUrl: '/reservations',
    isActive: true,
    order: 0
  };
  
  const response = await apiClient.post(`/api/content-blocks`, heroBlock);
  return response.data.contentBlock;
};

const addMenuHighlight = async (restaurantId: number) => {
  const menuBlock = {
    type: 'menu_highlight',
    title: 'Featured Dishes',
    content: 'Discover our chef\'s special selections for this week',
    featuredItems: [
      { name: 'Osso Buco', description: 'Braised veal shanks with risotto', price: '$32.00' },
      { name: 'Tiramisu', description: 'Classic Italian dessert', price: '$8.00' }
    ],
    isActive: true,
    order: 2
  };
  
  const response = await apiClient.post(`/api/content-blocks`, menuBlock);
  return response.data.contentBlock;
};
```

## Multi-tenant Setup

### Restaurant Context Hook

```typescript
// useRestaurantContext.ts
export const useRestaurantContext = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRestaurantContext = async () => {
      try {
        // Get restaurant from subdomain or user context
        const subdomain = window.location.hostname.split('.')[0];
        if (subdomain && subdomain !== 'www') {
          // Customer portal - load by subdomain
          const response = await apiClient.get(`/api/restaurants/by-subdomain/${subdomain}`);
          setRestaurant(response.data.restaurant);
        } else {
          // Staff portal - get from user context
          const user = JSON.parse(localStorage.getItem('user_data') || '{}');
          if (user.restaurantId) {
            const response = await apiClient.get(`/api/restaurants/${user.restaurantId}`);
            setRestaurant(response.data.restaurant);
          }
        }
      } catch (error) {
        console.error('Failed to load restaurant context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurantContext();
  }, []);

  return { restaurant, isLoading, setRestaurant };
};
```

### Data Isolation Example

```typescript
// All API calls automatically include restaurant context through middleware
const getRestaurantRecipes = async () => {
  // This automatically filters by current restaurant due to middleware
  const response = await apiClient.get('/api/recipes');
  return response.data.recipes;
};

// Manual restaurant filtering (if needed)
const getRecipesForRestaurant = async (restaurantId: number) => {
  const response = await apiClient.get(`/api/recipes?restaurantId=${restaurantId}`);
  return response.data.recipes;
};
```

## Common Patterns

### Error Handling Pattern

```typescript
const handleApiCall = async <T>(
  apiCall: () => Promise<T>,
  options: {
    loadingState?: (loading: boolean) => void;
    errorHandler?: (error: string) => void;
    successHandler?: (data: T) => void;
  } = {}
) => {
  try {
    options.loadingState?.(true);
    const result = await apiCall();
    options.successHandler?.(result);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    options.errorHandler?.(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    options.loadingState?.(false);
  }
};

// Usage
const saveRecipe = async (recipeData: Recipe) => {
  return handleApiCall(
    () => apiClient.post('/api/recipes', recipeData),
    {
      loadingState: setIsLoading,
      errorHandler: (error) => showSnackbar(error, 'error'),
      successHandler: () => showSnackbar('Recipe saved successfully!', 'success')
    }
  );
};
```

### Pagination Hook

```typescript
const usePagination = <T>(
  fetchFunction: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  initialLimit: number = 20
) => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (page: number = currentPage) => {
    setIsLoading(true);
    try {
      const response = await fetchFunction(page, initialLimit);
      setData(response.data);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchData(page);
    }
  };

  return {
    data,
    currentPage,
    totalPages,
    totalCount,
    isLoading,
    goToPage,
    refetch: () => fetchData(currentPage)
  };
};
```

### Form Validation Hook

```typescript
const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validate = (fieldName?: keyof T) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    const fieldsToValidate = fieldName ? [fieldName] : Object.keys(validationRules);

    fieldsToValidate.forEach((field) => {
      const value = values[field as keyof T];
      const rules = validationRules[field as keyof T];
      
      if (rules) {
        const error = rules.find(rule => !rule.validator(value))?.message;
        if (error) {
          newErrors[field as keyof T] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setTimeout(() => validate(field), 0);
    }
  };

  const setTouched = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate(field);
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched: setTouched,
    validate,
    isValid: Object.keys(errors).length === 0
  };
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. CORS Errors

```javascript
// If you see CORS errors, check backend server.ts
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://your-domain.com'
];

// Make sure your frontend URL is in the allowed origins
```

#### 2. Authentication Token Issues

```typescript
// Clear expired tokens
const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('customer_access_token');
  localStorage.removeItem('customer_refresh_token');
  localStorage.removeItem('customer_data');
};

// Auto-refresh tokens
const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('customer_refresh_token');
  if (!refreshToken) return false;

  try {
    const response = await apiClient.post('/api/auth/customer/refresh-token', {
      refreshToken
    });
    
    localStorage.setItem('customer_access_token', response.data.accessToken);
    return true;
  } catch (error) {
    clearAuthData();
    return false;
  }
};
```

#### 3. Database Connection Issues

```bash
# Check database connection
npm run db:check

# Reset local database
npm run db:reset:local

# Run migrations
npm run db:migrate
```

#### 4. Environment Variables Not Loading

```typescript
// Check if environment variables are loaded
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
});
```

### Debug Mode

```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Use in API calls
const apiCallWithDebug = async (url: string, data?: any) => {
  debugLog(`API Call: ${url}`, data);
  try {
    const response = await apiClient.post(url, data);
    debugLog(`API Response: ${url}`, response.data);
    return response;
  } catch (error) {
    debugLog(`API Error: ${url}`, error);
    throw error;
  }
};
```

This usage guide provides practical examples for the most common development scenarios with KitchenSync. For more detailed API documentation, refer to the [API Documentation](./API_DOCUMENTATION.md).