import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import './App.css';

// Layout and Context Providers
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

// Recipe Components
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';

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
              <Route element={<MainLayout />}>
                {/* Dashboard */}
                <Route index element={<DashboardPage />} />

                {/* CookBook Module Routes */}
                {/* Recipes */}
                <Route path="recipes" element={<RecipeList />} />
                <Route path="recipes/new" element={<CreateRecipePage />} />
                <Route path="recipes/:id" element={<RecipeDetail />} />
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
