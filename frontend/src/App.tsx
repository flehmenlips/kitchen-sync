import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  // Link as RouterLink // No longer needed here
} from 'react-router-dom';
import './App.css';
// Removed Box import
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
import Typography from '@mui/material/Typography';

// Placeholder Dashboard Component
const Dashboard = () => <Typography variant="h5">Dashboard Content Placeholder</Typography>;

function App() {
  return (
    <Router>
      {/* Remove outer div and title, MainLayout provides structure */}
      {/* Remove Temporary Navigation Box */}
        <Routes>
           {/* Wrap page routes within MainLayout */}
          <Route path="/" element={<MainLayout />}>
            {/* Default route within layout */}
            <Route index element={<Dashboard />} /> {/* Render Dashboard at root */}
            
            {/* Recipe Routes */}
            <Route path="recipes" element={<RecipeList />} />
            <Route path="recipes/new" element={<CreateRecipePage />} /> 
            <Route path="recipes/:id/edit" element={<EditRecipePage />} /> 
            <Route path="recipes/:id" element={<RecipeDetail />} />

            {/* Unit Routes */}
            <Route path="units" element={<UnitListPage />} />
            <Route path="units/new" element={<CreateUnitPage />} />
            <Route path="units/:id/edit" element={<EditUnitPage />} />

            {/* Ingredient Routes */}
            <Route path="ingredients" element={<IngredientListPage />} />
            <Route path="ingredients/new" element={<CreateIngredientPage />} />
            <Route path="ingredients/:id/edit" element={<EditIngredientPage />} />

            {/* Add other module routes later */}
            
             {/* Catch-all within layout */}
            <Route path="*" element={<div>404 Page Not Found (within layout)</div>} />
          </Route>

           {/* Routes outside MainLayout (e.g., Login page) could go here */}
           {/* <Route path="/login" element={<LoginPage />} /> */}

        </Routes>
    </Router>
  );
}

export default App;
