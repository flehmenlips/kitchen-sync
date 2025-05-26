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
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import CustomerProtectedRoute from './components/common/CustomerProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

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

// Unit Components
import UnitListPage from './pages/UnitListPage';
import CreateUnitPage from './pages/CreateUnitPage';
import EditUnitPage from './pages/EditUnitPage';

// Issue Tracker Components
import IssueListPage from './pages/IssueListPage';
import IssueDetailPage from './pages/IssueDetailPage';
import IssueFormPage from './pages/IssueFormPage';

// Prep Board Component
import { PrepBoard } from './components/prep/PrepBoard';

// Menu Components
import MenusPage from './pages/MenusPage';
import MenuFormPage from './pages/MenuFormPage';
import MenuDetailPage from './pages/MenuDetailPage';

// TableFarm Component
import { TableFarmPage } from './pages/TableFarmPage';

// Restaurant Settings
import RestaurantSettingsPage from './pages/RestaurantSettingsPage';
import ContentBlocksPage from './pages/ContentBlocksPage';

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
            <NotistackProvider maxSnack={3}>
              <SnackbarProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  } />

                  {/* Customer Portal Routes - Public Access */}
                  <Route path="/customer" element={
                    <CustomerAuthProvider>
                      <CustomerLayout />
                    </CustomerAuthProvider>
                  }>
                    <Route index element={<CustomerHomePage />} />
                    <Route path="reservations/new" element={<CustomerReservationPage />} />
                    <Route path="menu" element={<CustomerMenuPage />} />
                    <Route path="register" element={<CustomerRegisterPage />} />
                    <Route path="login" element={<CustomerLoginPage />} />
                    <Route path="verify-email-sent" element={<CustomerVerifyEmailSentPage />} />
                    <Route path="verify-email" element={<CustomerVerifyEmailPage />} />
                    {/* Protected customer routes */}
                    <Route path="dashboard" element={
                      <CustomerProtectedRoute>
                        <CustomerDashboardPage />
                      </CustomerProtectedRoute>
                    } />
                    {/* Future customer routes */}
                    {/* <Route path="reservations" element={<CustomerReservationsListPage />} /> */}
                    {/* <Route path="profile" element={<CustomerProfilePage />} /> */}
                  </Route>

                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                      {/* Dashboard */}
                      <Route index element={<DashboardPage />} />

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

                      {/* Categories */}
                      <Route path="categories" element={<CategoryListPage />} />
                      <Route path="categories/new" element={<CreateCategoryPage />} />
                      <Route path="categories/:id/edit" element={<EditCategoryPage />} />

                      {/* Ingredients */}
                      <Route path="ingredients" element={<IngredientListPage />} />
                      <Route path="ingredients/new" element={<CreateIngredientPage />} />
                      <Route path="ingredients/:id/edit" element={<EditIngredientPage />} />

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
                      <Route path="reservations" element={<ReservationManagementPage />} />

                      {/* Restaurant Settings */}
                      <Route path="settings" element={<RestaurantSettingsPage />} />
                      <Route path="content-blocks" element={<ContentBlocksPage />} />

                      {/* AgileChef Module Routes */}
                      <Route path="prep" element={<PrepBoard />} />

                      {/* Issue Tracker Routes */}
                      <Route path="issues" element={<IssueListPage />} />
                      <Route path="issues/new" element={<IssueFormPage />} />
                      <Route path="issues/:id" element={<IssueDetailPage />} />
                      <Route path="issues/:id/edit" element={<IssueFormPage />} />

                      {/* Profile Route */}
                      <Route path="profile" element={<ProfilePage />} />

                      {/* Redirect any unknown routes to dashboard */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                  </Route>
                </Routes>
              </SnackbarProvider>
            </NotistackProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
