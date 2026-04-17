import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '../context/RecipeContext';
import { substitutions } from '../data/recipes';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ✅ FIX: Destructure isFavorite from context
  const { 
    allRecipes, 
    favorites, 
    toggleFavorite, 
    ratings, 
    rateRecipe, 
    getMissingIngredients,
    userIngredients,
    isFavorite  // ✅ Added - was missing!
  } = useRecipes();

  // Find the recipe based on the URL ID
  const recipe = allRecipes.find(r => r.id === parseInt(id));
  
  // State for servings
  const [servings, setServings] = useState(recipe ? recipe.servings : 4);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!recipe) return <div className="container" style={{paddingTop: '100px', color: 'white'}}>Recipe not found!</div>;

  // ❌ REMOVED: const isFavorite = favorites.includes(recipe.id);
  // ✅ Now using the helper from context (type-safe, re-renders properly)
  
  const currentRating = ratings[recipe.id] || 0;
  const missingIngredients = getMissingIngredients(recipe);

  // --- LOGIC TO SCALE INGREDIENTS ---
  const getScaledIngredient = (ingredientStr) => {
    const originalServings = recipe.servings;
    if (servings === originalServings) return ingredientStr;

    const ratio = servings / originalServings;
    const regex = /^([\d\./]+)(\s?.*)$/;
    const match = ingredientStr.trim().match(regex);
    
    if (!match) return ingredientStr;

    const [_, amountStr, restOfString] = match;
    let amount;

    if (amountStr.includes('/')) {
      const [num, den] = amountStr.split('/').map(Number);
      amount = num / den;
    } else {
      amount = parseFloat(amountStr);
    }

    if (isNaN(amount)) return ingredientStr;

    let newAmount = amount * ratio;
    newAmount = Math.round(newAmount * 100) / 100;

    return `${newAmount}${restOfString}`;
  };

  // --- LOGIC TO SCALE NUTRITION ---
  const getScaledNutrition = (value) => {
    const ratio = servings / recipe.servings;
    return Math.round(value * ratio);
  };

  const adjustServings = (newServings) => {
    if (newServings > 0 && newServings <= 20) setServings(newServings);
  };

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary" 
        style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        ← Back
      </button>

      {/* Main Glass Card */}
      <div className="recipe-detail-card" style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        borderRadius: '24px', 
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)' 
      }}>
        
        {/* Hero Image Section */}
        <div style={{ position: 'relative', height: 'clamp(250px, 40vh, 400px)' }}>
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', 
            padding: 'clamp(20px, 5vw, 40px)', 
            color: 'white'
          }}>
            <h1 style={{ fontSize: 'clamp(28px, 6vw, 42px)', marginBottom: '10px', lineHeight: '1.2' }}>{recipe.title}</h1>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '14px' }}>
              <span className={`tag ${recipe.difficulty.toLowerCase()}`} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}>
                📊 {recipe.difficulty}
              </span>
              <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}>
                ⏱️ {recipe.cookingTime} min
              </span>
              <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}>
                🌍 {recipe.cuisine}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: 'clamp(20px, 4vw, 40px)' }}>
          
          {/* --- ACTIONS BAR --- */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '30px', 
            gap: '20px',
            background: '#f8fafc',
            padding: '15px 20px',
            borderRadius: '16px'
          }}>
            
            {/* 1. LEFT: Favorites Button - ✅ Uses isFavorite helper */}
            <div style={{ 
              flex: '1 1 auto', 
              display: 'flex', 
              justifyContent: isMobile ? 'center' : 'flex-start',
              width: isMobile ? '100%' : 'auto' 
            }}>
              <button 
                onClick={() => toggleFavorite(recipe)}
                className="btn"
                style={{ 
                  background: isFavorite(recipe.id) ? '#ff6b6b' : 'white', 
                  color: isFavorite(recipe.id) ? 'white' : '#2d3436',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  border: '1px solid #eee',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                {isFavorite(recipe.id) ? 'Favorite' : 'Add to Favorites'}
                <span style={{ fontSize: '20px', lineHeight: 1 }}>
                  {isFavorite(recipe.id) ? '❤️' : '🤍'}
                </span>
              </button>
            </div>

            {/* 2. MIDDLE: Rating Stars */}
            <div style={{ 
              flex: '1 1 auto', 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center', 
              gap: '10px',
              width: isMobile ? '100%' : 'auto'
            }}>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#666' }}>Rate:</span>
              <div style={{ display: 'flex' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    style={{ 
                      fontSize: '28px', 
                      cursor: 'pointer', 
                      color: star <= currentRating ? '#ffd700' : '#d1d5db',
                      lineHeight: '1',
                      transition: 'transform 0.2s'
                    }}
                    onClick={() => rateRecipe(recipe.id, star)}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* 3. RIGHT: Servings */}
            <div style={{ 
              flex: '1 1 auto', 
              display: 'flex', 
              justifyContent: isMobile ? 'center' : 'flex-end',
              width: isMobile ? '100%' : 'auto'
            }}>
              <div style={{ 
                background: 'white', 
                padding: '6px 12px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                border: '1px solid #eee',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                <span style={{ fontWeight: '600', color: '#666', fontSize: '14px' }}>Servings:</span>
                <button 
                  onClick={() => adjustServings(servings - 1)} 
                  className="btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '18px', height: '30px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  −
                </button>
                <span style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>{servings}</span>
                <button 
                  onClick={() => adjustServings(servings + 1)} 
                  className="btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '18px', height: '30px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* MAIN CONTENT STACK */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* 1. Missing Ingredients */}
            {missingIngredients.length > 0 && userIngredients.length > 0 && (
              <div style={{ 
                background: '#fff3cd', 
                padding: '20px', 
                borderRadius: '16px', 
                borderLeft: '5px solid #ffc107',
                boxShadow: '0 4px 10px rgba(255, 193, 7, 0.1)'
              }}>
                <h4 style={{ color: '#856404', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚠️ Missing Ingredients
                </h4>
                <ul style={{ paddingLeft: '20px', color: '#856404', margin: 0 }}>
                  {missingIngredients.map((ing, i) => (
                    <li key={i} style={{ marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold' }}>{getScaledIngredient(ing)}</span>
                      {substitutions[ing] ? ` (Try: ${substitutions[ing].slice(0,2).join(', ')})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 2. Nutrition Facts */}
            <div style={{ 
              background: '#f0f4f8', 
              padding: '25px', 
              borderRadius: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#2d3436' }}>Nutrition Facts</h3>
              <div style={{ marginBottom: '15px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                (For {servings} Servings)
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' }}>
                {Object.entries(recipe.nutrition).map(([key, value]) => (
                  <div key={key} style={{ 
                    background: 'white', 
                    padding: '15px', 
                    borderRadius: '12px', 
                    textAlign: 'center', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.03)' 
                  }}>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#ff6b6b' }}>
                      {getScaledNutrition(value)}{key === 'calories' ? '' : <span style={{fontSize: '14px', fontWeight: 'normal'}}>g</span>}
                    </div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', marginTop: '5px', fontWeight: '600' }}>{key}</div>
                  </div>
                ))}
              </div>
              
              {recipe.allergies && (
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#666' }}>Contains Allergens:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {recipe.allergies.map(allergy => (
                      <span key={allergy} style={{ 
                        background: '#fff1f2', 
                        border: '1px solid #fda4af',
                        color: '#e11d48', 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '13px', 
                        fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}>
                        ⚠️ {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Ingredients List */}
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '20px', borderBottom: '3px solid #ff6b6b', display: 'inline-block', paddingBottom: '5px' }}>Ingredients</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} style={{ 
                    padding: '12px 15px', 
                    marginBottom: '8px',
                    borderRadius: '10px',
                    background: i % 2 === 0 ? '#f8f9fa' : 'transparent',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px', 
                    fontSize: '16px' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px' }}>✓</span> 
                    <span style={{ fontWeight: servings !== recipe.servings ? '600' : '400', color: servings !== recipe.servings ? '#2d3436' : 'inherit' }}>
                      {getScaledIngredient(ing)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Instructions */}
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '20px', borderBottom: '3px solid #ff6b6b', display: 'inline-block', paddingBottom: '5px' }}>Instructions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {recipe.instructions.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ 
                      minWidth: '35px', height: '35px', 
                      background: '#ff6b6b', color: 'white', 
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: 'bold', fontSize: '16px',
                      marginTop: '3px'
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#444', margin: 0 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;