// backend/src/db.ts
import { Pool } from 'pg';

// Database connection configuration using environment variables
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'chanubram_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Optional: Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.stack);
    process.exit(1); // Exit if database connection fails
  } else {
    console.log('Successfully connected to the database.');
    release(); // Release the client back to the pool
  }
});

export default pool;
