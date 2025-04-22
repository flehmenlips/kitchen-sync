import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link as RouterLink
} from 'react-router-dom';
import './App.css';
import Box from '@mui/material/Box'; 
import MainLayout from './components/layout/MainLayout'; // Import the layout
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import CreateRecipePage from './pages/CreateRecipePage'; 
import EditRecipePage from './pages/EditRecipePage';
import UnitListPage from './pages/UnitListPage';
import CreateUnitPage from './pages/CreateUnitPage';
import EditUnitPage from './pages/EditUnitPage';
import IngredientListPage from './pages/IngredientListPage'; 
import CreateIngredientPage from './pages/CreateIngredientPage'; 
import EditIngredientPage from './pages/EditIngredientPage';
import CategoryListPage from './pages/CategoryListPage'; 
import CreateCategoryPage from './pages/CreateCategoryPage'; 
import EditCategoryPage from './pages/EditCategoryPage';
import Typography from '@mui/material/Typography';
import IngredientCategoryListPage from './pages/IngredientCategoryListPage';
import CreateIngredientCategoryPage from './pages/CreateIngredientCategoryPage';
import EditIngredientCategoryPage from './pages/EditIngredientCategoryPage';
import LoginPage from './pages/LoginPage'; // Import Login page
import RegisterPage from './pages/RegisterPage'; // Import Register page
import ProtectedRoute from './components/common/ProtectedRoute'; // Import ProtectedRoute
import DashboardPage from './pages/DashboardPage'; // <-- Import new DashboardPage
import RecipeListPage from './pages/RecipeListPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';

// Remove Placeholder Dashboard Component
// const Dashboard = () => <Typography variant="h5">Dashboard Content Placeholder</Typography>;

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SnackbarProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout children={undefined} />}>
                {/* Dashboard */}
                <Route index element={<DashboardPage />} />

                {/* CookBook Module Routes */}
                {/* Recipes */}
                <Route path="recipes" element={<RecipeListPage />} />
                <Route path="recipes/new" element={<CreateRecipePage />} />
                <Route path="recipes/:id" element={<RecipeDetailPage />} />
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

                {/* Redirect any unknown routes to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </SnackbarProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
