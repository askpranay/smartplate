import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.js';

dotenv.config();
const app = express();

// Debug: Log environment variables (hide password)
console.log('🔧 Backend starting...');
console.log('   DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('   DB_USER:', process.env.DB_USER || 'root');
console.log('   DB_NAME:', process.env.DB_NAME || 'smartplate');
console.log('   PORT:', process.env.PORT || 4000);

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Debug: Log all incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  if (req.method !== 'GET') {
    console.log('   Body:', JSON.stringify(req.body).slice(0, 200));
  }
  next();
});

app.use('/api/users', userRoutes);

// Debug: Log 404 errors
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not found' });
});

// Debug: Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
