import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// 🔐 SECURE: All credentials from environment variables ONLY
// NEVER hardcode passwords in source code
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',  // ← From .env, never hardcoded
  database: process.env.DB_NAME || 'smartplate',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  // SSL for production (optional but recommended)
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined
});

// Connection test (only in development, minimal logging)
if (process.env.NODE_ENV !== 'production') {
  pool.getConnection()
    .then(conn => {
      console.log('✅ MySQL connected');
      conn.release();
    })
    .catch(err => {
      console.error('❌ MySQL connection failed');
      console.error('   Check server/.env file');
      // 🔐 NEVER log the actual error message with password details in production
      if (process.env.NODE_ENV === 'development') {
        console.error('   Details:', err.message);
      }
    });
}

export default pool;