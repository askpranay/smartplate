import express from 'express';
import pool from '../db.js';

console.log('📦 User routes module loaded');

const router = express.Router();

// Upsert user on login (call this after Firebase sign-in)
router.post('/sync', async (req, res) => {
  console.log('🔄 /sync request received');
  const { uid, email, displayName, photoURL } = req.body;
  
  if (!uid || !email) {
    console.log('❌ Missing uid or email');
    return res.status(400).json({ error: 'uid and email required' });
  }
  
  try {
    console.log('🗄️ Executing INSERT query...');
    const [result] = await pool.execute(
      `INSERT INTO users (id, email, display_name, photo_url)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email=VALUES(email), display_name=VALUES(display_name), photo_url=VALUES(photo_url)`,
      [uid, email, displayName || null, photoURL || null]
    );
    console.log('✅ User sync successful:', result);
    res.json({ success: true });
  } catch (err) {
    console.error('💥 Sync error:', err.message);
    console.error('   Error code:', err.code);
    console.error('   Error errno:', err.errno);
    res.status(500).json({ error: err.message });
  }
});

// Get favorites for a user
router.get('/:uid/favorites', async (req, res) => {
  try {
    console.log(`📥 GET /favorites for user: ${req.params.uid}`);
    
    const [rows] = await pool.execute(
      'SELECT recipe_data FROM favorites WHERE user_id = ? ORDER BY saved_at DESC',
      [req.params.uid]
    );
    
    console.log(`📊 Found ${rows.length} favorites in DB`);
    
    // ✅ Normalize ALL recipe IDs to strings before sending to frontend
    const favorites = rows.map(r => {
      const recipe = r.recipe_data;
      // Ensure ID is always a string
      const normalizedRecipe = {
        ...recipe,
        id: String(recipe.id)
      };
      console.log(`   Recipe: ${normalizedRecipe.id} (${typeof normalizedRecipe.id}) - ${normalizedRecipe.title}`);
      return normalizedRecipe;
    });
    
    console.log(`✅ Sending ${favorites.length} favorites (all IDs normalized to strings)`);
    res.json(favorites);
  } catch (err) {
    console.error('❌ GET favorites error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
// Add a favorite
router.post('/:uid/favorites', async (req, res) => {
  const { recipe } = req.body;
  if (!recipe?.id) return res.status(400).json({ error: 'recipe with id required' });
  try {
    await pool.execute(
      'INSERT IGNORE INTO favorites (user_id, recipe_id, recipe_data) VALUES (?, ?, ?)',
      [req.params.uid, String(recipe.id), JSON.stringify(recipe)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a favorite
router.delete('/:uid/favorites/:recipeId', async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?',
      [req.params.uid, req.params.recipeId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ratings for a user
router.get('/:uid/ratings', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT recipe_id, rating FROM recipe_ratings WHERE user_id = ?',
      [req.params.uid]
    );
    // Return as { recipeId: rating } map
    const map = {};
    rows.forEach(r => { map[r.recipe_id] = r.rating; });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upsert a rating
router.post('/:uid/ratings', async (req, res) => {
  const { recipeId, rating } = req.body;
  if (!recipeId || !rating) return res.status(400).json({ error: 'recipeId and rating required' });
  try {
    await pool.execute(
      `INSERT INTO recipe_ratings (user_id, recipe_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating=VALUES(rating), rated_at=CURRENT_TIMESTAMP`,
      [req.params.uid, String(recipeId), rating]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;