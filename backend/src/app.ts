import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // Import dotenv to load environment variables
import vendorRoutes from './routes/vendorRoutes';
import couponRoutes from './routes/couponRoutes'; // Import coupon routes
import pool from './db'; // Import pool to ensure DB connection is checked on startup

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// API Routes
app.use('/api/vendors', vendorRoutes); // Mount vendor routes under /api/vendors
app.use('/api/coupons', couponRoutes); // Mount coupon routes under /api/coupons

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start the server
// Use a graceful shutdown pattern for the pool
const server = app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server and database pool');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});
