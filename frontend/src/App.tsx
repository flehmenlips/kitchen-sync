import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import './App.css'; // Keep basic styling
import RecipeList from './components/RecipeList'; // Import our new component
import RecipeDetail from './components/RecipeDetail'; // Uncommented import
// import RecipeDetail from './components/RecipeDetail'; // Will create this next

function App() {
  return (
    <Router>
      <div className="App">
        <h1>KitchenSync</h1>
        <Routes>
          {/* Default route redirects to recipes list */}
          <Route path="/" element={<Navigate replace to="/recipes" />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} /> {/* Uncommented route */}
          {/* Add other routes for Units, Ingredients, etc. later */}
          <Route path="*" element={<div>404 Not Found</div>} /> {/* Catch-all route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
