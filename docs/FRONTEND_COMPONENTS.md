# Frontend Components Documentation

## Overview

This document covers all reusable React components, hooks, utilities, and services in the KitchenSync frontend application.

## Table of Contents

1. [Core Components](#core-components)
2. [Layout Components](#layout-components)
3. [Common Components](#common-components)
4. [Feature Components](#feature-components)
5. [Custom Hooks](#custom-hooks)
6. [Services](#services)
7. [Utilities](#utilities)
8. [Context Providers](#context-providers)

## Architecture Overview

The frontend is built with:
- **React 18** with TypeScript
- **Material-UI (MUI)** for component library
- **React Query** for server state management
- **React Router** for routing
- **Zustand** for client state management
- **Vite** for build tooling

## Core Components

### App Component

**Location**: `src/App.tsx`

Main application component that sets up routing, providers, and global configurations.

```tsx
import { App } from './App';

// Usage
<App />
```

**Features:**
- Route configuration for staff and customer portals
- Global providers setup (Auth, Restaurant, Subscription)
- Theme provider with Material-UI
- Query client configuration
- Error boundary handling

### MainLayout

**Location**: `src/components/layout/MainLayout.tsx`

Primary layout component for authenticated staff users.

```tsx
import { MainLayout } from './components/layout/MainLayout';

// Usage (automatically used in protected routes)
<MainLayout>
  <DashboardPage />
</MainLayout>
```

**Props:**
```tsx
interface MainLayoutProps {
  children: React.ReactNode;
}
```

**Features:**
- Responsive sidebar navigation
- Top navigation bar with user menu
- Restaurant selector
- Notification system integration
- Mobile-optimized drawer navigation

### CustomerLayout

**Location**: `src/components/customer/CustomerLayout.tsx`

Layout component for customer-facing portal.

```tsx
import { CustomerLayout } from './components/customer/CustomerLayout';

// Usage
<CustomerLayout>
  <CustomerHomePage />
</CustomerLayout>
```

**Features:**
- Customer-specific navigation
- Restaurant branding
- Simplified header/footer
- Responsive design

## Layout Components

### Navigation Components

#### Sidebar
**Location**: `src/components/layout/Sidebar.tsx`

```tsx
interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'temporary';
}
```

**Features:**
- Module-based navigation (CookBook, TableFarm, AgileChef, Website)
- Role-based menu items
- Collapsible sub-menus
- Active route highlighting

#### TopBar
**Location**: `src/components/layout/TopBar.tsx`

```tsx
interface TopBarProps {
  onMenuToggle: () => void;
  title?: string;
}
```

**Features:**
- User avatar and dropdown menu
- Restaurant selector
- Notifications badge
- Search functionality (future)

## Common Components

### ProtectedRoute

**Location**: `src/components/common/ProtectedRoute.tsx`

Route wrapper that requires staff authentication.

```tsx
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

**Features:**
- JWT token validation
- Automatic redirect to login
- Loading states
- Restaurant context verification

### CustomerProtectedRoute

**Location**: `src/components/common/CustomerProtectedRoute.tsx`

Route wrapper for customer authentication.

```tsx
<CustomerProtectedRoute>
  <CustomerDashboardPage />
</CustomerProtectedRoute>
```

### PublicRoute

**Location**: `src/components/common/PublicRoute.tsx`

Route wrapper that redirects authenticated users.

```tsx
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

### ConfirmationDialog

**Location**: `src/components/common/ConfirmationDialog.tsx`

Reusable confirmation dialog component.

```tsx
interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

// Usage
<ConfirmationDialog
  open={isOpen}
  title="Delete Recipe"
  content="Are you sure you want to delete this recipe? This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setIsOpen(false)}
  severity="error"
  confirmText="Delete"
/>
```

### RestaurantSelector

**Location**: `src/components/common/RestaurantSelector.tsx`

Dropdown component for switching between restaurants (multi-tenant).

```tsx
interface RestaurantSelectorProps {
  value: number;
  onChange: (restaurantId: number) => void;
  restaurants: Restaurant[];
}

// Usage
<RestaurantSelector
  value={currentRestaurant.id}
  onChange={handleRestaurantChange}
  restaurants={userRestaurants}
/>
```

### SubdomainRouter

**Location**: `src/components/common/SubdomainRouter.tsx`

Component that handles subdomain-based routing for customer portals.

```tsx
<SubdomainRouter>
  <Routes>
    {/* Customer routes when on subdomain */}
    {/* Staff routes when on main domain */}
  </Routes>
</SubdomainRouter>
```

**Features:**
- Detects restaurant subdomain
- Automatically routes to customer portal
- Handles subdomain validation
- Fallback to main application

## Feature Components

### Recipe Components

#### RecipeList

**Location**: `src/components/RecipeList.tsx`

Display grid of recipes with search and filtering.

```tsx
interface RecipeListProps {
  categoryFilter?: number;
  searchTerm?: string;
  onRecipeSelect?: (recipe: Recipe) => void;
}

// Usage
<RecipeList
  categoryFilter={selectedCategory}
  searchTerm={searchQuery}
  onRecipeSelect={handleRecipeClick}
/>
```

**Features:**
- Grid/list view toggle
- Infinite scrolling
- Category filtering
- Search functionality
- Recipe cards with images

#### RecipeDetail

**Location**: `src/components/RecipeDetail.tsx`

Detailed recipe view with ingredients and instructions.

```tsx
interface RecipeDetailProps {
  recipeId: number;
  mode?: 'view' | 'edit';
  onScale?: (factor: number) => void;
}

// Usage
<RecipeDetail
  recipeId={recipeId}
  mode="view"
  onScale={handleScale}
/>
```

**Features:**
- Recipe scaling calculator
- Ingredient list with measurements
- Step-by-step instructions
- Photo display
- Print functionality
- Edit mode with form

#### RecipeScaleDialog

**Location**: `src/components/RecipeScaleDialog.tsx`

Modal dialog for scaling recipe quantities.

```tsx
interface RecipeScaleDialogProps {
  open: boolean;
  recipe: Recipe;
  onClose: () => void;
  onScale: (scaledRecipe: Recipe, factor: number) => void;
}

// Usage
<RecipeScaleDialog
  open={isScaleDialogOpen}
  recipe={selectedRecipe}
  onClose={() => setIsScaleDialogOpen(false)}
  onScale={handleRecipeScale}
/>
```

### Menu Components

#### VisualCanvas

**Location**: `src/components/VisualCanvas.tsx`

Drag-and-drop visual menu builder interface.

```tsx
interface VisualCanvasProps {
  menu: Menu;
  onUpdate: (menu: Menu) => void;
  mode?: 'edit' | 'preview';
}

// Usage
<VisualCanvas
  menu={currentMenu}
  onUpdate={handleMenuUpdate}
  mode="edit"
/>
```

**Features:**
- Drag-and-drop menu items
- Real-time preview
- Section management
- Style customization
- Recipe linking

#### VisualBlockPalette

**Location**: `src/components/VisualBlockPalette.tsx`

Palette of draggable menu elements.

```tsx
interface VisualBlockPaletteProps {
  onDragStart: (blockType: string) => void;
  availableRecipes: Recipe[];
}

// Usage
<VisualBlockPalette
  onDragStart={handleDragStart}
  availableRecipes={recipes}
/>
```

### Website Builder Components

#### ContentBlockEditor

**Location**: `src/components/ContentBlockEditor.tsx`

WYSIWYG editor for website content blocks.

```tsx
interface ContentBlockEditorProps {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  mode?: 'edit' | 'preview';
}

// Usage
<ContentBlockEditor
  block={contentBlock}
  onChange={handleBlockChange}
  mode="edit"
/>
```

**Features:**
- Rich text editing
- Image upload and management
- Block type switching
- Live preview
- Responsive design tools

#### TemplateSelector

**Location**: `src/components/TemplateSelector.tsx`

Component for selecting website templates.

```tsx
interface TemplateSelectorProps {
  templates: WebsiteTemplate[];
  selectedTemplate?: string;
  onSelect: (templateId: string) => void;
}

// Usage
<TemplateSelector
  templates={availableTemplates}
  selectedTemplate={currentTemplate}
  onSelect={handleTemplateSelect}
/>
```

### Prep Board Components

#### PrepBoard

**Location**: `src/components/prep/PrepBoard.tsx`

Kanban-style board for prep task management.

```tsx
interface PrepBoardProps {
  columns: PrepColumn[];
  onTaskUpdate: (taskId: string, updates: Partial<PrepTask>) => void;
  onColumnUpdate: (columnId: string, updates: Partial<PrepColumn>) => void;
}

// Usage
<PrepBoard
  columns={prepColumns}
  onTaskUpdate={handleTaskUpdate}
  onColumnUpdate={handleColumnUpdate}
/>
```

**Features:**
- Drag-and-drop task management
- Column customization
- Recipe linking
- Time tracking
- Progress indicators

### Customer Portal Components

#### CustomerHomePage

**Location**: `src/pages/customer/CustomerHomePage.tsx`

Landing page for customer portal.

```tsx
// Usage (automatically routed on subdomain)
// customer.restaurant.com -> CustomerHomePage
```

**Features:**
- Restaurant branding
- Menu highlights
- Reservation CTA
- Recent orders
- Account management

#### CustomerReservationPage

**Location**: `src/pages/customer/CustomerReservationPage.tsx`

Reservation booking interface for customers.

```tsx
interface CustomerReservationPageProps {
  restaurantId: number;
}

// Usage
<CustomerReservationPage restaurantId={restaurant.id} />
```

**Features:**
- Date/time picker
- Party size selection
- Special requests
- Availability checking
- Confirmation flow

## Custom Hooks

### Authentication Hooks

#### useAuth

**Location**: `src/hooks/useAuth.ts`

Hook for staff authentication state and actions.

```tsx
const useAuth = () => {
  const login: (email: string, password: string) => Promise<void>;
  const logout: () => void;
  const user: User | null;
  const isLoading: boolean;
  const isAuthenticated: boolean;
}

// Usage
const { user, login, logout, isAuthenticated } = useAuth();
```

#### useCustomerAuth

**Location**: `src/hooks/useCustomerAuth.ts`

Hook for customer authentication.

```tsx
const useCustomerAuth = () => {
  const login: (email: string, password: string, subdomain: string) => Promise<void>;
  const register: (customerData: CustomerRegistrationData) => Promise<void>;
  const logout: () => void;
  const customer: Customer | null;
  const isLoading: boolean;
  const isAuthenticated: boolean;
}
```

### Data Hooks

#### useRecipes

**Location**: `src/hooks/useRecipes.ts`

Hook for recipe data management.

```tsx
const useRecipes = (filters?: RecipeFilters) => {
  const recipes: Recipe[];
  const isLoading: boolean;
  const error: Error | null;
  const refetch: () => void;
  const createRecipe: (recipe: CreateRecipeData) => Promise<Recipe>;
  const updateRecipe: (id: number, updates: Partial<Recipe>) => Promise<Recipe>;
  const deleteRecipe: (id: number) => Promise<void>;
}

// Usage
const {
  recipes,
  isLoading,
  createRecipe,
  updateRecipe,
  deleteRecipe
} = useRecipes({ category: selectedCategory });
```

#### useMenus

**Location**: `src/hooks/useMenus.ts`

Hook for menu management.

```tsx
const useMenus = () => {
  const menus: Menu[];
  const isLoading: boolean;
  const createMenu: (menu: CreateMenuData) => Promise<Menu>;
  const updateMenu: (id: number, updates: Partial<Menu>) => Promise<Menu>;
  const deleteMenu: (id: number) => Promise<void>;
  const duplicateMenu: (id: number) => Promise<Menu>;
}
```

#### useReservations

**Location**: `src/hooks/useReservations.ts`

Hook for reservation management.

```tsx
const useReservations = (filters?: ReservationFilters) => {
  const reservations: Reservation[];
  const isLoading: boolean;
  const createReservation: (reservation: CreateReservationData) => Promise<Reservation>;
  const updateReservation: (id: number, updates: Partial<Reservation>) => Promise<Reservation>;
  const cancelReservation: (id: number) => Promise<void>;
}
```

### UI Hooks

#### useSnackbar

**Location**: `src/hooks/useSnackbar.ts`

Hook for showing toast notifications.

```tsx
const useSnackbar = () => {
  const showSuccess: (message: string) => void;
  const showError: (message: string) => void;
  const showWarning: (message: string) => void;
  const showInfo: (message: string) => void;
}

// Usage
const { showSuccess, showError } = useSnackbar();

const handleSave = async () => {
  try {
    await saveData();
    showSuccess('Data saved successfully!');
  } catch (error) {
    showError('Failed to save data');
  }
};
```

#### useConfirmDialog

**Location**: `src/hooks/useConfirmDialog.ts`

Hook for confirmation dialogs.

```tsx
const useConfirmDialog = () => {
  const confirm: (options: ConfirmOptions) => Promise<boolean>;
  const ConfirmDialog: React.ComponentType;
}

// Usage
const { confirm, ConfirmDialog } = useConfirmDialog();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Recipe',
    content: 'Are you sure?',
    severity: 'error'
  });
  
  if (confirmed) {
    // Proceed with deletion
  }
};

return (
  <div>
    {/* Your component JSX */}
    <ConfirmDialog />
  </div>
);
```

#### useLocalStorage

**Location**: `src/hooks/useLocalStorage.ts`

Hook for localStorage management with TypeScript support.

```tsx
const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue]: [T, (value: T) => void];
  const removeValue: () => void;
}

// Usage
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
```

## Services

### API Services

#### apiService

**Location**: `src/services/apiService.ts`

Main API service with common CRUD operations.

```tsx
const apiService = {
  // Generic methods
  get: <T>(url: string) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  delete: (url: string) => Promise<void>;
  
  // Authentication
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: UserRegistrationData) => Promise<AuthResponse>;
  
  // Recipes
  getRecipes: (filters?: RecipeFilters) => Promise<Recipe[]>;
  getRecipe: (id: number) => Promise<Recipe>;
  createRecipe: (recipe: CreateRecipeData) => Promise<Recipe>;
  updateRecipe: (id: number, updates: Partial<Recipe>) => Promise<Recipe>;
  deleteRecipe: (id: number) => Promise<void>;
  scaleRecipe: (id: number, factor: number) => Promise<Recipe>;
  
  // Menus
  getMenus: () => Promise<Menu[]>;
  createMenu: (menu: CreateMenuData) => Promise<Menu>;
  updateMenu: (id: number, updates: Partial<Menu>) => Promise<Menu>;
  
  // Reservations
  getReservations: (filters?: ReservationFilters) => Promise<Reservation[]>;
  createReservation: (reservation: CreateReservationData) => Promise<Reservation>;
  updateReservation: (id: number, updates: Partial<Reservation>) => Promise<Reservation>;
};
```

#### customerAuthService

**Location**: `src/services/customerAuthService.ts`

Service for customer authentication operations.

```tsx
const customerAuthService = {
  login: (email: string, password: string, subdomain: string) => Promise<CustomerAuthResponse>;
  register: (customerData: CustomerRegistrationData) => Promise<CustomerAuthResponse>;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string, subdomain: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshToken: (refreshToken: string) => Promise<CustomerAuthResponse>;
  getProfile: () => Promise<Customer>;
  updateProfile: (updates: Partial<Customer>) => Promise<Customer>;
};
```

#### websiteBuilderService

**Location**: `src/services/websiteBuilderService.ts`

Service for website builder operations.

```tsx
const websiteBuilderService = {
  getConfig: () => Promise<WebsiteConfig>;
  updateConfig: (config: Partial<WebsiteConfig>) => Promise<WebsiteConfig>;
  getTemplates: () => Promise<WebsiteTemplate[]>;
  applyTemplate: (templateId: string) => Promise<void>;
  publishWebsite: () => Promise<void>;
  previewWebsite: () => Promise<string>; // Returns preview URL
};
```

### Utility Services

#### themingService

**Location**: `src/services/themingService.ts`

Service for theme and styling management.

```tsx
const themingService = {
  getTheme: () => Promise<ThemeConfig>;
  updateTheme: (theme: Partial<ThemeConfig>) => Promise<ThemeConfig>;
  getColorPalettes: () => Promise<ColorPalette[]>;
  createColorPalette: (palette: CreateColorPaletteData) => Promise<ColorPalette>;
  getTypographyConfigs: () => Promise<TypographyConfig[]>;
  generateThemePreview: (config: ThemeConfig) => string; // Returns CSS
};
```

## Utilities

### API Client

**Location**: `src/utils/apiClient.ts`

Axios-based HTTP client with interceptors.

```tsx
const apiClient = {
  // Request interceptor for auth tokens
  // Response interceptor for error handling
  // Automatic token refresh
  // Request/response logging
}
```

### Validation

**Location**: `src/utils/validation.ts`

Form validation utilities.

```tsx
const validation = {
  email: (email: string) => boolean;
  password: (password: string) => boolean;
  phone: (phone: string) => boolean;
  required: (value: any) => boolean;
  minLength: (value: string, min: number) => boolean;
  maxLength: (value: string, max: number) => boolean;
}

// Usage
const validateForm = (data: FormData) => {
  const errors: Record<string, string> = {};
  
  if (!validation.required(data.name)) {
    errors.name = 'Name is required';
  }
  
  if (!validation.email(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  return errors;
};
```

### Formatters

**Location**: `src/utils/formatters.ts`

Data formatting utilities.

```tsx
const formatters = {
  currency: (amount: number, currency = 'USD') => string;
  date: (date: Date | string, format?: string) => string;
  time: (time: string) => string;
  phone: (phone: string) => string;
  truncate: (text: string, length: number) => string;
}

// Usage
const formattedPrice = formatters.currency(29.99); // "$29.99"
const formattedDate = formatters.date(new Date(), 'MMM dd, yyyy'); // "Jan 15, 2024"
```

### Storage

**Location**: `src/utils/storage.ts`

Local storage abstraction with encryption.

```tsx
const storage = {
  set: (key: string, value: any) => void;
  get: <T>(key: string, defaultValue?: T) => T | null;
  remove: (key: string) => void;
  clear: () => void;
  
  // Secure storage for sensitive data
  setSecure: (key: string, value: any) => void;
  getSecure: <T>(key: string) => T | null;
}

// Usage
storage.set('user-preferences', { theme: 'dark', language: 'en' });
const preferences = storage.get('user-preferences', { theme: 'light' });
```

## Context Providers

### AuthContext

**Location**: `src/context/AuthContext.tsx`

Staff authentication context provider.

```tsx
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Usage
<AuthProvider>
  <App />
</AuthProvider>

// In components
const { user, login, logout, isAuthenticated } = useContext(AuthContext);
```

### CustomerAuthContext

**Location**: `src/context/CustomerAuthContext.tsx`

Customer authentication context provider.

```tsx
interface CustomerAuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, subdomain: string) => Promise<void>;
  register: (customerData: CustomerRegistrationData) => Promise<void>;
  logout: () => void;
}
```

### RestaurantContext

**Location**: `src/context/RestaurantContext.tsx`

Restaurant/tenant context provider.

```tsx
interface RestaurantContextType {
  restaurant: Restaurant | null;
  isLoading: boolean;
  switchRestaurant: (restaurantId: number) => Promise<void>;
  updateRestaurant: (updates: Partial<Restaurant>) => void;
}
```

### SubscriptionContext

**Location**: `src/context/SubscriptionContext.tsx`

Subscription status context provider.

```tsx
interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  hasFeature: (feature: string) => boolean;
  upgradeSubscription: (plan: string) => Promise<void>;
}

// Usage
const { subscription, hasFeature } = useContext(SubscriptionContext);

if (hasFeature('advanced-analytics')) {
  // Show advanced analytics
}
```

### SnackbarContext

**Location**: `src/context/SnackbarContext.tsx`

Global notification context provider.

```tsx
interface SnackbarContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

// Usage
<SnackbarProvider>
  <App />
</SnackbarProvider>
```

## TypeScript Types

### Core Types

**Location**: `src/types.ts`

```tsx
interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  restaurantId: number;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isEmailVerified: boolean;
  restaurants: CustomerRestaurant[];
}

interface Recipe {
  id: number;
  name: string;
  description?: string;
  instructions: string;
  yieldQuantity?: number;
  yieldUnit?: UnitOfMeasure;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  tags: string[];
  category?: Category;
  ingredients: RecipeIngredient[];
  photoUrl?: string;
  restaurantId: number;
}

interface Menu {
  id: number;
  name: string;
  title?: string;
  subtitle?: string;
  font: string;
  layout: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  isArchived: boolean;
  sections: MenuSection[];
  restaurantId: number;
}

interface Reservation {
  id: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: ReservationStatus;
  notes?: string;
  specialRequests?: string;
  restaurantId: number;
}
```

## Component Testing

### Testing Utilities

**Location**: `src/utils/test-utils.tsx`

Custom render function with providers.

```tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Example Component Tests

```tsx
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { RecipeList } from '../components/RecipeList';
import { mockRecipes } from '../__mocks__/recipes';

describe('RecipeList', () => {
  it('renders recipe cards', () => {
    render(<RecipeList />);
    
    expect(screen.getByText('Marinara Sauce')).toBeInTheDocument();
    expect(screen.getByText('Classic Italian tomato sauce')).toBeInTheDocument();
  });

  it('filters recipes by category', async () => {
    render(<RecipeList categoryFilter={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Marinara Sauce')).toBeInTheDocument();
      expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();
    });
  });

  it('handles recipe selection', () => {
    const onSelect = jest.fn();
    render(<RecipeList onRecipeSelect={onSelect} />);
    
    fireEvent.click(screen.getByText('Marinara Sauce'));
    expect(onSelect).toHaveBeenCalledWith(mockRecipes[0]);
  });
});
```

## Performance Optimizations

### Code Splitting

Components are lazy-loaded for better performance:

```tsx
const RecipeDetail = React.lazy(() => import('./components/RecipeDetail'));

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <RecipeDetail recipeId={id} />
</Suspense>
```

### Memoization

Use React.memo for expensive components:

```tsx
const RecipeCard = React.memo<RecipeCardProps>(({ recipe, onSelect }) => {
  // Component implementation
});

// With custom comparison
const RecipeCard = React.memo<RecipeCardProps>(
  ({ recipe, onSelect }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    return prevProps.recipe.id === nextProps.recipe.id &&
           prevProps.recipe.updatedAt === nextProps.recipe.updatedAt;
  }
);
```

### Virtual Scrolling

For large lists, use virtual scrolling:

```tsx
import { FixedSizeList as List } from 'react-window';

const VirtualizedRecipeList: React.FC<{ recipes: Recipe[] }> = ({ recipes }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <RecipeCard recipe={recipes[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={recipes.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## Best Practices

### Component Guidelines

1. **Single Responsibility**: Each component should have one clear purpose
2. **Props Interface**: Always define TypeScript interfaces for props
3. **Default Props**: Use default parameters instead of defaultProps
4. **Error Boundaries**: Wrap components that might fail
5. **Loading States**: Always show loading indicators for async operations

### State Management

1. **Local State**: Use useState for component-specific state
2. **Server State**: Use React Query for API data
3. **Global State**: Use Context for shared application state
4. **Form State**: Use controlled components with proper validation

### Styling

1. **Material-UI**: Prefer MUI components and theming
2. **Responsive Design**: Use MUI breakpoints and Grid system
3. **Consistent Spacing**: Use theme spacing values
4. **Color Consistency**: Use theme colors and avoid hardcoded values

### Performance

1. **Lazy Loading**: Split large components and routes
2. **Memoization**: Use React.memo and useMemo appropriately
3. **Virtual Lists**: For large datasets
4. **Image Optimization**: Use proper image formats and lazy loading

This documentation provides a comprehensive overview of the KitchenSync frontend architecture and components. For specific implementation details, refer to the individual component files.