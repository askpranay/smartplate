import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'; // ✅ Added BrowserRouter
import { RecipeProvider } from './context/RecipeContext';
import { AuthProvider } from "./context/AuthContext";
import Header from './components/Header';
import Hero from './components/Hero';
import IngredientInput from './components/IngredientInput';
import FilterBar from './components/FilterBar';
import RecipeGrid from './components/RecipeGrid';
import RecipeDetail from './components/RecipeDetail';
import FavoritesList from './components/FavoritesList';
import './index.css';
import { useAuth } from "./context/AuthContext";

// Home Component
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {user && (
        <div style={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white", 
          padding: "0.75rem 1.5rem", 
          textAlign: "center",
          fontSize: "0.95rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          Welcome back, {user.displayName}! 🎉
        </div>
      )}
      
      <Hero />
      <div className="container">
        <IngredientInput />
        <FilterBar />
        <RecipeGrid onRecipeClick={() => {}} />
      </div>
    </>
  );
};

// Main App Component
function App() {
  const [showFavorites, setShowFavorites] = useState(false);
  const toggleFavorites = () => setShowFavorites(!showFavorites);

  return (
    <BrowserRouter> {/* ✅ Router wraps EVERYTHING */}
      <AuthProvider>
        <RecipeProvider>
          <div className="App">
            <Header onToggleFavorites={toggleFavorites} showFavorites={showFavorites} />
            
            <main style={{ minHeight: "calc(100vh - 60px)" }}>
              {showFavorites ? (
                <div className="container">
                  <FavoritesList onRecipeClick={() => {}} />
                </div>
              ) : (
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/recipe/:id" element={<RecipeDetail />} />
                </Routes>
              )}
            </main>
          </div>
        </RecipeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;