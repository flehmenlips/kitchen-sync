import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link as RouterLink // Import Link for navigation
} from 'react-router-dom';
import './App.css'; // Keep basic styling
import Box from '@mui/material/Box'; // For layout
import RecipeList from './components/RecipeList'; // Import our new component
import RecipeDetail from './components/RecipeDetail'; // Uncommented import
import CreateRecipePage from './pages/CreateRecipePage'; // Uncommented import
import EditRecipePage from './pages/EditRecipePage'; // Import Edit page
import UnitListPage from './pages/UnitListPage'; // Import Unit List page
import CreateUnitPage from './pages/CreateUnitPage'; // Import Create Unit page
import EditUnitPage from './pages/EditUnitPage'; // Import Edit page
import IngredientListPage from './pages/IngredientListPage'; // Import Ingredient List page
import CreateIngredientPage from './pages/CreateIngredientPage'; // Import Create Ingredient page
// import RecipeDetail from './components/RecipeDetail'; // Will create this next
// import CreateRecipePage from './pages/CreateRecipePage'; // Will create this next

function App() {
  return (
    <Router>
      <div className="App">
        <h1>KitchenSync</h1>
        {/* Temporary Navigation */}
        <Box component="nav" sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <RouterLink to="/recipes">Recipes</RouterLink>
          <RouterLink to="/units">Units</RouterLink>
          <RouterLink to="/ingredients">Ingredients</RouterLink> {/* Added Ingredients link */}
        </Box>

        <Routes>
          {/* Default route redirects to recipes list */}
          <Route path="/" element={<Navigate replace to="/recipes" />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/new" element={<CreateRecipePage />} /> {/* Use actual page component */}
          {/* <Route path="/recipes/new" element={<div>Create Recipe Page Placeholder</div>} /> */}
          <Route path="/recipes/:id/edit" element={<EditRecipePage />} /> {/* Added Edit Route */}
          <Route path="/recipes/:id" element={<RecipeDetail />} /> {/* Uncommented route */}

          {/* Unit Routes */}
          <Route path="/units" element={<UnitListPage />} />
          <Route path="/units/new" element={<CreateUnitPage />} />
          <Route path="/units/:id/edit" element={<EditUnitPage />} /> {/* Added Edit Route */}

          {/* Ingredient Routes */}
          <Route path="/ingredients" element={<IngredientListPage />} />
          <Route path="/ingredients/new" element={<CreateIngredientPage />} />

          {/* Add other routes for Ingredients, etc. later */}
          <Route path="*" element={<div>404 Not Found</div>} /> {/* Catch-all route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
