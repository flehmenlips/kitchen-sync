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

// Placeholder Dashboard Component
const Dashboard = () => <Typography variant="h5">Dashboard Content Placeholder</Typography>;

function App() {
  return (
    <Router>
       <Routes>
          {/* Define MainLayout as the parent route element */}
          <Route path="/" element={<MainLayout />}>
            {/* Index route within MainLayout (Dashboard) */}
            {/* path="/" is implied by index=true */}
            <Route index element={<Dashboard />} /> 
            
            {/* Recipe Routes (nested under /) */}
            <Route path="recipes" element={<RecipeList />} />
            <Route path="recipes/new" element={<CreateRecipePage />} /> 
            <Route path="recipes/:id/edit" element={<EditRecipePage />} /> 
            <Route path="recipes/:id" element={<RecipeDetail />} />

            {/* Unit Routes (nested under /) */}
            <Route path="units" element={<UnitListPage />} />
            <Route path="units/new" element={<CreateUnitPage />} />
            <Route path="units/:id/edit" element={<EditUnitPage />} />

            {/* Ingredient Routes (nested under /) */}
            <Route path="ingredients" element={<IngredientListPage />} />
            <Route path="ingredients/new" element={<CreateIngredientPage />} />
            <Route path="ingredients/:id/edit" element={<EditIngredientPage />} />

            {/* Category Routes (nested under /) */}
            <Route path="categories" element={<CategoryListPage />} />
            <Route path="categories/new" element={<CreateCategoryPage />} />
            <Route path="categories/:id/edit" element={<EditCategoryPage />} />

            {/* Ingredient Category Routes */}
            <Route path="ingredient-categories" element={<IngredientCategoryListPage />} />
            <Route path="ingredient-categories/new" element={<CreateIngredientCategoryPage />} />
            <Route path="ingredient-categories/:id/edit" element={<EditIngredientCategoryPage />} />

            {/* Catch-all within layout */}
            <Route path="*" element={<div>404 Page Not Found</div>} /> 
          </Route>{/* End of routes within MainLayout */}

           {/* Routes outside MainLayout (e.g., Login page) could go here later */}
           {/* <Route path="/login" element={<LoginPage />} /> */}

        </Routes>
    </Router>
  );
}

export default App;
