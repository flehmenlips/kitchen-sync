import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecipeById, Recipe } from '../services/apiService';

const RecipeDetail: React.FC = () => {
    // Get the recipe ID from URL parameters
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!id) {
                setError('No recipe ID provided');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const recipeId = parseInt(id, 10);
                if (isNaN(recipeId)) {
                    throw new Error('Invalid recipe ID format');
                }
                const data = await getRecipeById(recipeId);
                setRecipe(data);
                setError(null);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to fetch recipe details.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]); // Re-run effect if the ID changes

    if (loading) {
        return <div>Loading recipe details...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (!recipe) {
        return <div>Recipe not found.</div>;
    }

    // Helper to format time
    const formatTime = (minutes: number | null): string => {
        if (minutes === null || minutes === undefined) return 'N/A';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} hr${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ''}`;
    };

    return (
        <div>
            <Link to="/recipes">&larr; Back to List</Link>
            <h2>{recipe.name}</h2>
            {recipe.description && <p><em>{recipe.description}</em></p>}
            
            <div>
                <strong>Yield:</strong> {recipe.yieldQuantity || 'N/A'} {recipe.yieldUnit?.name || ''}
            </div>
            <div>
                <strong>Prep Time:</strong> {formatTime(recipe.prepTimeMinutes)}
            </div>
             <div>
                <strong>Cook Time:</strong> {formatTime(recipe.cookTimeMinutes)}
            </div>
            {recipe.tags && recipe.tags.length > 0 && (
                <div>
                    <strong>Tags:</strong> {recipe.tags.join(', ')}
                </div>
            )}

            <h3>Ingredients</h3>
            {recipe.recipeIngredients && recipe.recipeIngredients.length > 0 ? (
                 <ul>
                    {recipe.recipeIngredients.map((item) => (
                        <li key={item.id}>
                            {item.quantity} {item.unit.abbreviation || item.unit.name}{/* 
                             */}{item.ingredient ? ` ${item.ingredient.name}` : ''}{/* 
                             */}{item.subRecipe ? ` ${item.subRecipe.name} (Sub-Recipe)` : ''}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No ingredients listed.</p>
            )}

            <h3>Instructions</h3>
            {/* Preserve line breaks from the instructions text */}
            <div style={{ whiteSpace: 'pre-wrap' }}>
                {recipe.instructions || 'No instructions provided.'}
            </div>

            {/* TODO: Add Edit/Delete buttons */}
        </div>
    );
};

export default RecipeDetail; 