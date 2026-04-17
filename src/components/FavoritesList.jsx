import React from 'react';
import { useRecipes } from '../context/RecipeContext';
import RecipeCard from './RecipeCard';

const FavoritesList = ({ onRecipeClick }) => {
  // ✅ FIX 1: Destructure isFavorite helper from context
  const { allRecipes, favorites, getRecommendations, isFavorite } = useRecipes();
  
  // ✅ FIX 2: Use isFavorite() for proper ID comparison (handles string/number mismatch)
  const favoriteRecipes = allRecipes.filter(recipe => isFavorite(recipe.id));
  
  const recommendations = getRecommendations();

  // 🔍 Debug: Remove after confirming it works
  console.log('📄 FavoritesList Debug:', {
    favoritesCount: favorites.length,
    favoriteIds: favorites.map(f => f.id),
    favoriteRecipesCount: favoriteRecipes.length,
    showing: favoriteRecipes.length > 0 ? 'GRID' : 'EMPTY STATE'
  });

  return (
    <div style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      
      {/* Show heading only when there are favorites */}
      {favoriteRecipes.length > 0 && (
        <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '40px' }}>
          ❤️ Your Favorite Recipes 
        </h1>
      )}

      {/* Empty state OR favorites grid */}
      {favoriteRecipes.length === 0 ? (
        <div className="empty-state" style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'white'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>💔</div>
          <h2 style={{ marginBottom: '10px' }}>No favorites yet!</h2>
          <p style={{ color: '#9ca3af' }}>Start adding recipes to your favorites to see them here.</p>
        </div>
      ) : (
        <div className="recipe-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {favoriteRecipes.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={() => onRecipeClick(recipe)}
            />
          ))}
        </div>
      )}

      {/* Recommendations section */}
      {recommendations.length > 0 && (
        <>
          <h2 style={{ 
            color: 'white', 
            textAlign: 'center', 
            marginTop: '60px', 
            marginBottom: '40px' 
          }}>
            ⭐ Recommended For You
          </h2>
          <div className="recipe-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {recommendations.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onClick={() => onRecipeClick(recipe)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FavoritesList;