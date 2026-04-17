import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { recipes } from '../data/recipes';
import { useAuth } from './AuthContext';
import { 
  getFavorites, 
  addFavorite, 
  removeFavorite, 
  getRatings, 
  saveRating 
} from '../../api/userApi';


const DEBUG = false ;
const log = (...args) => DEBUG && console.log('🍽️ RecipeContext:', ...args);
const logError = (...args) => console.error('❌ RecipeContext:', ...args);

// ───────────────────────────────────────────────────────────────────────────
// Create Context
// ───────────────────────────────────────────────────────────────────────────
const RecipeContext = createContext();

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};

// ───────────────────────────────────────────────────────────────────────────
// Provider Component
// ───────────────────────────────────────────────────────────────────────────
export const RecipeProvider = ({ children }) => {
  const { user } = useAuth();

  // ─── State Management ───────────────────────────────────────────────────
  const [allRecipes] = useState(recipes);
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);
  const [userIngredients, setUserIngredients] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState({});
  const [filters, setFilters] = useState({
    difficulty: 'all',
    cuisine: 'all',
    dietary: 'all',
    maxTime: 120
  });
  
  // 🔐 Track pending operations to prevent race conditions
  const [pendingOps, setPendingOps] = useState({});

  // ─── Helper: Normalize ID to string for consistent comparison ───────────
  const normalizeId = useCallback((id) => {
    if (id === null || id === undefined) return '';
    return String(id).trim();
  }, []);

  // ─── Load favorites & ratings from MySQL when user logs in ─────────────
  useEffect(() => {
    if (user) {
      log(`📥 Loading data for user: ${user.uid}`);
      
      getFavorites(user.uid)
        .then(data => {
          // 🔍 Debug: Log raw API response
          if (DEBUG) {
            console.log('📦 Raw favorites from API:', data);
            console.log('📦 Is array:', Array.isArray(data));
            console.log('📦 Count:', data?.length || 0);
            if (Array.isArray(data) && data.length > 0) {
              console.log('📦 First favorite:', {
                id: data[0].id,
                type: typeof data[0].id,
                title: data[0].title
              });
            }
          }
          
          const favs = Array.isArray(data) ? data : [];
          
          // 🔐 Normalize ALL IDs to strings for bulletproof comparison
          const normalized = favs.map(f => ({
            ...f,
            id: normalizeId(f.id)  // Force string + trim
          }));
          
          log(`✅ Loaded ${normalized.length} favorites from DB`);
          log(`   Normalized IDs: [${normalized.map(f => `"${f.id}"`).join(', ')}]`);
          
          // 🔍 Log each loaded favorite for debugging
          if (DEBUG && normalized.length > 0) {
            normalized.forEach(f => {
              log(`   - "${f.id}" (${typeof f.id}): ${f.title || f.name}`);
            });
          }
          
          setFavorites(normalized);
        })
        .catch(err => {
          console.error('❌ Failed to load favorites:', err);
          logError('Failed to load favorites:', err);
        });

      getRatings(user.uid)
        .then(data => {
          const rats = data && typeof data === 'object' ? data : {};
          log(`✅ Loaded ${Object.keys(rats).length} ratings from DB`);
          setRatings(rats);
        })
        .catch(err => logError('Failed to load ratings:', err));
    } else {
      log('👤 User logged out — clearing state');
      setFavorites([]);
      setRatings({});
    }
  }, [user, normalizeId]);

  // ─── Ingredient Management ─────────────────────────────────────────────
  const addIngredient = (ingredient) => {
    const normalizedIngredient = ingredient.toLowerCase().trim();
    if (!normalizedIngredient) return;
    setUserIngredients(prev => {
      if (!prev.includes(normalizedIngredient)) {
        return [...prev, normalizedIngredient];
      }
      return prev;
    });
  };

  const removeIngredient = (ingredient) => {
    setUserIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const clearIngredients = () => {
    setUserIngredients([]);
  };

  // ─── Favorite Management (MySQL-backed, race-condition safe) ───────────
  const toggleFavorite = useCallback(async (recipe) => {
    if (!user) {
      alert('Please sign in to save favorites!');
      return;
    }

    const recipeId = normalizeId(recipe.id);
    const recipeTitle = recipe.title || recipe.name || 'Unknown';
    
    log(`🔄 toggleFavorite: ${recipeId} "${recipeTitle}"`);

    // 🔐 Prevent rapid double-clicks on same recipe (race condition fix)
    if (pendingOps[recipeId]) {
      log(`⏳ Operation already pending for ${recipeId}, skipping`);
      return;
    }
    setPendingOps(prev => ({ ...prev, [recipeId]: true }));

    try {
      // ✅ Type-safe comparison using normalized IDs
      const isFav = favorites.some(f => normalizeId(f.id) === recipeId);
      log(`   Current status: ${isFav ? '❤️ favorited' : '🤍 not favorited'}`);

      if (isFav) {
        // ── Remove favorite ───────────────────────────────────────────
        log(`   🗑️ Removing from favorites`);
        
        // Optimistic update: remove from UI immediately
        setFavorites(prev => {
          const updated = prev.filter(f => normalizeId(f.id) !== recipeId);
          log(`   📊 State: ${prev.length} → ${updated.length} favorites`);
          return updated;
        });

        await removeFavorite(user.uid, recipe.id);
        log(`   ✅ Removed from DB: ${recipeId}`);
        
      } else {
        // ── Add favorite ──────────────────────────────────────────────
        log(`   💾 Adding to favorites`);
        
        // ✅ Normalize recipe before storing to ensure ID consistency
        const normalizedRecipe = {
          ...recipe,
          id: normalizeId(recipe.id)  // Force string ID
        };
        
        // Optimistic update: add to UI immediately
        setFavorites(prev => {
          // Prevent duplicates in state (defensive)
          const withoutDuplicate = prev.filter(f => normalizeId(f.id) !== recipeId);
          const updated = [...withoutDuplicate, normalizedRecipe];
          log(`   📊 State: ${prev.length} → ${updated.length} favorites`);
          return updated;
        });

        await addFavorite(user.uid, normalizedRecipe);
        log(`   ✅ Added to DB: ${recipeId}`);
      }
    } catch (err) {
      logError('❌ toggleFavorite failed:', err);
      
      // 🔐 Rollback: re-fetch from DB to ensure state consistency
      log(`   🔄 Rolling back — re-fetching from DB`);
      getFavorites(user.uid)
        .then(data => {
          const favs = Array.isArray(data) ? data : [];
          const normalized = favs.map(f => ({ ...f, id: normalizeId(f.id) }));
          setFavorites(normalized);
          log(`   ✅ State restored from DB: ${normalized.length} favorites`);
        })
        .catch(fetchErr => logError('Failed to restore state:', fetchErr));
      
      alert('Failed to update favorites. Please try again.');
    } finally {
      // 🔐 Clear pending flag (always runs)
      setPendingOps(prev => {
        const updated = { ...prev };
        delete updated[recipeId];
        return updated;
      });
    }
  }, [user, favorites, pendingOps, normalizeId]);

  // ─── Helper: Check if recipe is favorited (bulletproof ID comparison) ─
  const isFavorite = useCallback((recipeId) => {
    const normalized = normalizeId(recipeId);
    
    // ✅ Compare using normalized string IDs
    const result = favorites.some(f => {
      const favId = normalizeId(f.id);
      return favId === normalized;
    });
    
    // 🔍 Debug logging for mismatch investigation
    if (DEBUG && recipeId !== undefined) {
      log(`🔍 isFavorite("${recipeId}" → "${normalized}") = ${result}`);
      if (favorites.length > 0) {
        log(`   Checking against: [${favorites.map(f => `"${normalizeId(f.id)}"`).join(', ')}]`);
      }
      if (!result && favorites.length > 0) {
        // Log details when match fails (helps debug)
        const found = favorites.find(f => normalizeId(f.id) === normalized);
        if (!found) {
          log(`   ⚠️ No match found for "${normalized}"`);
        }
      }
    }
    
    return result;
  }, [favorites, normalizeId]);

  // ─── Rating Management ────────────────────────────────────────────────
  const rateRecipe = async (recipeId, rating) => {
    if (!user) {
      alert('Please sign in to rate recipes!');
      return;
    }

    log(`⭐ Rating recipe ${recipeId}: ${rating} stars`);
    
    // Optimistic update
    setRatings(prev => ({ ...prev, [recipeId]: rating }));
    
    try {
      await saveRating(user.uid, recipeId, rating);
      log(`✅ Rating saved: ${recipeId} → ${rating}`);
    } catch (err) {
      logError('Failed to save rating:', err);
      // Rollback
      setRatings(prev => {
        const updated = { ...prev };
        delete updated[recipeId];
        return updated;
      });
      alert('Failed to save rating. Please try again.');
    }
  };

  // ─── Calculate match percentage ───────────────────────────────────────
  const calculateMatch = (recipe) => {
    if (userIngredients.length === 0) return 0;
    const recipeIngredients = recipe.ingredients.map(ing =>
      ing.toLowerCase().split(' ').slice(-1)[0]
    );
    let matches = 0;
    userIngredients.forEach(userIng => {
      if (recipeIngredients.some(recipeIng =>
        recipeIng.includes(userIng) || userIng.includes(recipeIng)
      )) {
        matches++;
      }
    });
    return Math.round((matches / recipe.ingredients.length) * 100);
  };

  // ─── Filter recipes ───────────────────────────────────────────────────
  const filterRecipes = () => {
    let filtered = [...allRecipes];
    if (userIngredients.length > 0) {
      filtered = filtered
        .map(recipe => ({ ...recipe, matchPercentage: calculateMatch(recipe) }))
        .filter(recipe => recipe.matchPercentage > 0);
      filtered.sort((a, b) => {
        const ratingDiff = (ratings[b.id] || 0) - (ratings[a.id] || 0);
        if (ratingDiff !== 0) return ratingDiff * 0.2;
        return b.matchPercentage - a.matchPercentage;
      });
    }
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(recipe =>
        recipe.difficulty?.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }
    if (filters.cuisine !== 'all') {
      filtered = filtered.filter(recipe =>
        recipe.cuisine?.toLowerCase() === filters.cuisine.toLowerCase()
      );
    }
    if (filters.dietary !== 'all') {
      filtered = filtered.filter(recipe =>
        recipe.dietaryTags?.includes(filters.dietary.toLowerCase())
      );
    }
    filtered = filtered.filter(recipe => recipe.cookingTime <= filters.maxTime);
    setFilteredRecipes(filtered);
  };

  useEffect(() => {
    filterRecipes();
  }, [userIngredients, filters, ratings]);

  // ─── Smart Recommendations ────────────────────────────────────────────
  const getRecommendations = () => {
    const favoriteIds = favorites.map(f => Number(normalizeId(f.id)));
    const highRatedIds = Object.keys(ratings)
      .filter(id => ratings[id] >= 4)
      .map(Number);
    const uniqueLikedIds = [...new Set([...favoriteIds, ...highRatedIds])];
    
    if (uniqueLikedIds.length === 0) return allRecipes.slice(0, 3);
    
    const likedRecipes = allRecipes.filter(r => 
      uniqueLikedIds.includes(Number(normalizeId(r.id)))
    );
    
    const cuisineScores = {};
    const tagScores = {};
    
    likedRecipes.forEach(recipe => {
      cuisineScores[recipe.cuisine] = (cuisineScores[recipe.cuisine] || 0) + 3;
      recipe.dietaryTags?.forEach(tag => {
        tagScores[tag] = (tagScores[tag] || 0) + 1;
      });
    });
    
    const candidates = allRecipes.filter(r => 
      !uniqueLikedIds.includes(Number(normalizeId(r.id)))
    );
    
    const scoredCandidates = candidates.map(recipe => {
      let score = 0;
      if (cuisineScores[recipe.cuisine]) score += cuisineScores[recipe.cuisine];
      recipe.dietaryTags?.forEach(tag => {
        if (tagScores[tag]) score += tagScores[tag];
      });
      return { ...recipe, recommendationScore: score };
    });
    
    return scoredCandidates
      .filter(r => r.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getMissingIngredients = (recipe) => {
    const recipeIngredients = recipe.ingredients.map(ing =>
      ing.toLowerCase().split(' ').slice(-1)[0]
    );
    return recipe.ingredients.filter((_, index) => {
      const ingredientName = recipeIngredients[index];
      return !userIngredients.some(userIng =>
        ingredientName.includes(userIng) || userIng.includes(ingredientName)
      );
    });
  };

  // ─── Context Value ────────────────────────────────────────────────────
  const value = {
    allRecipes,
    filteredRecipes,
    userIngredients,
    favorites,
    ratings,
    filters,
    addIngredient,
    removeIngredient,
    clearIngredients,
    toggleFavorite,
    isFavorite,        // ✅ Exported for components
    rateRecipe,
    updateFilters,
    calculateMatch,
    getRecommendations,
    getMissingIngredients
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};