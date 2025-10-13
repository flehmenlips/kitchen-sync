import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider as NotistackProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme'; // Import theme from a separate file

// Layout and Context Providers
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import CustomerProtectedRoute from './components/common/CustomerProtectedRoute';
import { SubdomainRouter } from './components/common/SubdomainRouter';
import { ConditionalRoutes } from './components/common/ConditionalRoutes';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantRegisterPage from './pages/RestaurantRegisterPage';
import RestaurantWelcomePage from './pages/RestaurantWelcomePage';
import VerifyEmailSentPage from './pages/VerifyEmailSentPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import { AssetLibraryPage } from './pages/AssetLibraryPage';
import LogoTestPage from './pages/LogoTestPage';

// Recipe Components
import RecipeList from './components/RecipeList';
// Lazy load RecipeDetail
const RecipeDetail = React.lazy(() => import('./components/RecipeDetail'));
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import RecipeImportPage from './pages/RecipeImportPage';

// Category Components
import CategoryListPage from './pages/CategoryListPage';
import CreateCategoryPage from './pages/CreateCategoryPage';
import EditCategoryPage from './pages/EditCategoryPage';

// Ingredient Components
import IngredientListPage from './pages/IngredientListPage';
import CreateIngredientPage from './pages/CreateIngredientPage';
import EditIngredientPage from './pages/EditIngredientPage';

// Ingredient Category Components
import IngredientCategoryListPage from './pages/IngredientCategoryListPage';
import CreateIngredientCategoryPage from './pages/CreateIngredientCategoryPage';
import EditIngredientCategoryPage from './pages/EditIngredientCategoryPage';

// Unit Components
import UnitListPage from './pages/UnitListPage';
import CreateUnitPage from './pages/CreateUnitPage';
import EditUnitPage from './pages/EditUnitPage';

// CookBook Settings
import CookBookSettingsPage from './pages/CookBookSettingsPage';

// Prep Board Component
import { PrepBoard } from './components/prep/PrepBoard';

// Menu Components
import MenusPage from './pages/MenusPage';
import MenuFormPage from './pages/MenuFormPage';
import MenuDetailPage from './pages/MenuDetailPage';

// TableFarm Components
import { TableFarmPage } from './pages/TableFarmPage';
import TablesPage from './pages/TablesPage';

// Website & Marketing Module
import WebsiteBuilderPage from './pages/WebsiteBuilderPage';
import ContentBlocksPage from './pages/ContentBlocksPage';
import BillingPage from './pages/BillingPage';

// Customer Portal Components
import CustomerLayout from './components/customer/CustomerLayout';
import CustomerHomePage from './pages/customer/CustomerHomePage';
import CustomerReservationPage from './pages/customer/CustomerReservationPage';
import CustomerMenuPage from './pages/customer/CustomerMenuPage';
import { CustomerRegisterPage } from './pages/customer/CustomerRegisterPage';
import { CustomerLoginPage } from './pages/customer/CustomerLoginPage';
import { CustomerVerifyEmailSentPage } from './pages/customer/CustomerVerifyEmailSentPage';
import { CustomerVerifyEmailPage } from './pages/customer/CustomerVerifyEmailPage';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';

// Reservation Management Page
import ReservationManagementPage from './pages/ReservationManagementPage';

// Admin Dashboard
import AdminDashboard from './pages/AdminDashboard';

// Platform Admin Components
import PlatformLogin from './platform-admin/pages/PlatformLogin';
import PlatformDashboard from './platform-admin/pages/PlatformDashboard';
import PlatformAdminLayout from './platform-admin/components/PlatformAdminLayout';
import RestaurantList from './platform-admin/pages/RestaurantList';
import RestaurantDetail from './platform-admin/pages/RestaurantDetail';
import RestaurantEdit from './platform-admin/pages/RestaurantEdit';
import PlatformAnalytics from './platform-admin/pages/PlatformAnalytics';
import { SubscriptionsPage } from './platform-admin/pages/SubscriptionsPage';
import { SubscriptionAnalytics } from './platform-admin/pages/SubscriptionAnalytics';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <RestaurantProvider>
              <SubscriptionProvider>
                <NotistackProvider maxSnack={3}>
                  <SnackbarProvider>
                    <SubdomainRouter>
                      <ConditionalRoutes>
                        {/* Public routes */}
                        <Route path="/login" element={
                          <PublicRoute>
                            <LoginPage />
                          </PublicRoute>
                        } />
                        <Route path="/register" element={
                          <PublicRoute>
                            <RestaurantRegisterPage />
                          </PublicRoute>
                        } />
                        <Route path="/welcome" element={<RestaurantWelcomePage />} />
                        <Route path="/verify-email-sent" element={<VerifyEmailSentPage />} />
                        <Route path="/verify-email" element={<VerifyEmailPage />} />
                        
                        {/* Logo Test Page */}
                        <Route path="/logo-test" element={<LogoTestPage />} />

                        {/* Platform Admin Routes - Separate from main app */}
                        <Route path="/platform-admin/login" element={<PlatformLogin />} />
                        <Route path="/platform-admin" element={<PlatformAdminLayout />}>
                          <Route path="dashboard" element={<PlatformDashboard />} />
                          <Route path="restaurants" element={<RestaurantList />} />
                          <Route path="restaurants/:id" element={<RestaurantDetail />} />
                          <Route path="restaurants/:id/edit" element={<RestaurantEdit />} />
                          <Route path="analytics" element={<PlatformAnalytics />} />
                          <Route path="subscriptions" element={<SubscriptionsPage />} />
                          <Route path="subscriptions/analytics" element={<SubscriptionAnalytics />} />
                          <Route index element={<Navigate to="/platform-admin/dashboard" replace />} />
                        </Route>

                        {/* Protected routes (staff app) */}
                        <Route element={<ProtectedRoute />}>
                          <Route element={<MainLayout />}>
                            {/* Dashboard */}
                            <Route path="/dashboard" element={<DashboardPage />} />

                            {/* CookBook Module Routes */}
                            {/* Recipes */}
                            <Route path="recipes" element={<RecipeList />} />
                            <Route path="recipes/new" element={<CreateRecipePage />} />
                            <Route path="recipes/import" element={<RecipeImportPage />} />
                            <Route path="recipes/:id" element={
                              <Suspense fallback={<div>Loading...</div>}>
                                <RecipeDetail />
                              </Suspense>
                            } />
                            <Route path="recipes/:id/edit" element={<EditRecipePage />} />

                            {/* CookBook Settings */}
                            <Route path="cookbook/settings" element={<CookBookSettingsPage />} />

                            {/* Categories */}
                            <Route path="categories" element={<CategoryListPage />} />
                            <Route path="categories/new" element={<CreateCategoryPage />} />
                            <Route path="categories/:id/edit" element={<EditCategoryPage />} />

                            {/* Ingredients */}
                            <Route path="ingredients" element={<IngredientListPage />} />
                            <Route path="ingredients/new" element={<CreateIngredientPage />} />
                            <Route path="ingredients/:id/edit" element={<EditIngredientPage />} />

                            {/* Ingredient Categories */}
                            <Route path="ingredient-categories" element={<IngredientCategoryListPage />} />
                            <Route path="ingredient-categories/new" element={<CreateIngredientCategoryPage />} />
                            <Route path="ingredient-categories/:id/edit" element={<EditIngredientCategoryPage />} />

                            {/* Units */}
                            <Route path="units" element={<UnitListPage />} />
                            <Route path="units/new" element={<CreateUnitPage />} />
                            <Route path="units/:id/edit" element={<EditUnitPage />} />

                            {/* Menu Builder */}
                            <Route path="menus" element={<MenusPage />} />
                            <Route path="menus/new" element={<MenuFormPage />} />
                            <Route path="menus/:id" element={<MenuDetailPage />} />
                            <Route path="menus/:id/edit" element={<MenuFormPage />} />

                            {/* TableFarm Module Routes */}
                            <Route path="tablefarm" element={<TableFarmPage />} />
                            <Route path="tables" element={<TablesPage />} />
                            <Route path="reservations" element={<ReservationManagementPage />} />

                            {/* Website & Marketing Module Routes */}
                            <Route path="website" element={<WebsiteBuilderPage />} />
                            <Route path="website/content" element={<ContentBlocksPage />} />
                            
                            {/* Billing Settings */}
                            <Route path="settings/billing" element={<BillingPage />} />

                            {/* AgileChef Module Routes */}
                            <Route path="prep" element={<PrepBoard />} />

                            {/* Profile Route */}
                            <Route path="profile" element={<ProfilePage />} />

                            {/* Admin Dashboard */}
                            <Route path="admin-dashboard" element={<AdminDashboard />} />

                            {/* Asset Library Page */}
                            <Route path="asset-library" element={<AssetLibraryPage />} />

                            {/* Redirect any unknown routes to dashboard */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Route>
                        </Route>
                      </ConditionalRoutes>
                    </SubdomainRouter>
                  </SnackbarProvider>
                </NotistackProvider>
              </SubscriptionProvider>
            </RestaurantProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
