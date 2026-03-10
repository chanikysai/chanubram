// backend/src/app.ts (example of integrating vendor routes)
import express from 'express';
import cors from 'cors';
import vendorRoutes from './routes/vendorRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// API Routes
app.use('/api/vendors', vendorRoutes); // Mount vendor routes under /api/vendors

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
