import React from 'react';
import './App.css'; // Keep basic styling
import RecipeList from './components/RecipeList'; // Import our new component

function App() {
  return (
    <div className="App">
      <h1>KitchenSync</h1>
      <RecipeList />
      {/* We can add routing and other components here later */}
    </div>
  );
}

export default App;
