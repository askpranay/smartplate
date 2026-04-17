import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../context/RecipeContext';

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();
  
  // ✅ FIX: Destructure isFavorite from context (was missing!)
  const { favorites, toggleFavorite, ratings, calculateMatch, isFavorite } = useRecipes();
  
  // ❌ REMOVED: const isFavorite = favorites.includes(recipe.id);
  // ✅ Now using the helper from context which handles type-safe comparisons
  
  const rating = ratings[recipe.id] || 0;
  const matchPercentage = recipe.matchPercentage || calculateMatch(recipe);

  const goToRecipe = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    // ✅ toggleFavorite already receives full recipe object (correct!)
    toggleFavorite(recipe);
  };

  return (
    <div className="recipe-card" onClick={goToRecipe}>
      <img 
        src={recipe.image} 
        alt={recipe.title} 
        className="recipe-image"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
        }}
      />
      <div className="recipe-content">
        
        {/* --- DYNAMIC MATCH BAR --- */}
        {matchPercentage > 0 && (
          <div style={{
            width: '100%',
            height: '24px',
            background: '#e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '15px',
            boxShadow: 'none',
            border: 'none'
          }}>
            <div style={{
              width: `${matchPercentage}%`,
              height: '100%',
              background: '#10b981',
              borderRadius: '12px 0 0 12px',
              transition: 'width 0.5s ease'
            }} />
            
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '10px',
              fontSize: '11px',
              fontWeight: '800',
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              {matchPercentage}% Match
            </div>
          </div>
        )}
        
        <h3 className="recipe-title">{recipe.title}</h3>
        
        <div className="recipe-meta">
          <span>⏱️ {recipe.cookingTime} min</span>
          <span>👥 {recipe.servings} servings</span>
        </div>

        <div className="recipe-tags">
          {recipe.dietaryTags.map((tag, index) => (
            <span key={index} className={`tag ${tag}`}>
              {tag}
            </span>
          ))}
        </div>

        {/* --- FOOTER LAYOUT --- */}
        <div style={{ marginTop: '20px' }}>
            
          {/* Row 1: Rating (Left) & Favorite (Right) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            
            {/* Rating Text */}
            <div style={{ 
              color: '#f59e0b', 
              fontWeight: '700', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: '#fffbeb',
              padding: '6px 12px',
              borderRadius: '20px'
            }}>
              {rating > 0 ? (
                <>
                  {rating} Stars <span style={{ fontSize: '16px', paddingBottom: '2px' }}>★</span>
                </>
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '500' }}>No ratings</span>
              )}
            </div>

            {/* Favorite Button - ✅ Uses isFavorite helper from context */}
            <button 
              onClick={handleFavoriteClick}
              aria-label="Add to favorites"
              style={{ 
                fontSize: '24px', 
                padding: '8px', 
                background: 'transparent', 
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                // ✅ Conditional styling based on favorite status
                color: isFavorite(recipe.id) ? '#e74c3c' : '#9ca3af',
                transform: isFavorite(recipe.id) ? 'scale(1.1)' : 'scale(1)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {/* ✅ Uses isFavorite helper - ensures proper re-render */}
              {isFavorite(recipe.id) ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Row 2: View Recipe Button */}
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', borderRadius: '14px', fontWeight: '700' }}
            onClick={(e) => { e.stopPropagation(); goToRecipe(); }}
          >
            View Recipe
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default RecipeCard;