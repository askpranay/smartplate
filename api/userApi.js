const BASE = 'http://localhost:4000/api/users';

export const syncUser = (user) =>
  fetch(`${BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    }),
  });

export const getFavorites = (uid) =>
  fetch(`${BASE}/${uid}/favorites`).then(r => r.json());

export const addFavorite = (uid, recipe) =>
  fetch(`${BASE}/${uid}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe }),
  });

export const removeFavorite = (uid, recipeId) =>
  fetch(`${BASE}/${uid}/favorites/${recipeId}`, { method: 'DELETE' });

export const getRatings = (uid) =>
  fetch(`${BASE}/${uid}/ratings`).then(r => r.json());

export const saveRating = (uid, recipeId, rating) =>
  fetch(`${BASE}/${uid}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeId, rating }),
  });