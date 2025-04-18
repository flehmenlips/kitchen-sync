import React, { useState, useEffect } from 'react';
import { getRecipes, Recipe } from '../services/apiService';

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await getRecipes();
        setRecipes(data);
        setError(null);
      } catch (err) {
        console.error(err); // Log the actual error
        setError('Failed to fetch recipes. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <div>Loading recipes...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Recipe List (CookBook)</h2>
      {recipes.length === 0 ? (
        <p>No recipes found. Add some via the API!</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <strong>{recipe.name}</strong>
              {recipe.description && <p style={{ margin: '0.2em 0 0.5em 0', fontSize: '0.9em' }}>{recipe.description}</p>}
              {/* TODO: Add link/button to view full recipe details */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeList; 