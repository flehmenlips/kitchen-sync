import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Navigate, // Might not need Navigate at root anymore
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

// Placeholder Dashboard Component
const Dashboard = () => <Typography variant="h5">Dashboard Content Placeholder</Typography>;

function App() {
  return (
    <Router>
       <Routes>
          {/* Routes requiring Main Layout AND Authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} /> 
              <Route path="recipes" element={<RecipeList />} />
              <Route path="recipes/new" element={<CreateRecipePage />} /> 
              <Route path="recipes/:id/edit" element={<EditRecipePage />} /> 
              <Route path="recipes/:id" element={<RecipeDetail />} />
              <Route path="units" element={<UnitListPage />} />
              <Route path="units/new" element={<CreateUnitPage />} />
              <Route path="units/:id/edit" element={<EditUnitPage />} />
              <Route path="ingredients" element={<IngredientListPage />} />
              <Route path="ingredients/new" element={<CreateIngredientPage />} />
              <Route path="ingredients/:id/edit" element={<EditIngredientPage />} />
              <Route path="categories" element={<CategoryListPage />} />
              <Route path="categories/new" element={<CreateCategoryPage />} />
              <Route path="categories/:id/edit" element={<EditCategoryPage />} />
              <Route path="ingredient-categories" element={<IngredientCategoryListPage />} />
              <Route path="ingredient-categories/new" element={<CreateIngredientCategoryPage />} />
              <Route path="ingredient-categories/:id/edit" element={<EditIngredientCategoryPage />} />
              {/* Add other protected routes here */}
              <Route path="*" element={<div>404 Page Not Found</div>} /> 
            </Route>{/* End of routes within MainLayout */}
          </Route> {/* End of protected routes */}

          {/* Standalone routes (no layout, public) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

        </Routes>
    </Router>
  );
}

export default App;
