import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { registerUser, loginUser, getUserById } from './services/user-authentication-registrationService';
import { setTokenCookie, clearTokenCookie, authenticateToken } from './middleware/authMiddleware';

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;
const cookieMaxAge = parseInt(process.env.COOKIE_MAX_AGE || '3600000', 10);

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies

// --- Authentication Routes ---

// Registration Route
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const { token, userId, username } = await registerUser(userData);
    
    // Set JWT as httpOnly cookie
    setTokenCookie(res, token, cookieMaxAge);

    res.status(201).json({ userId, username, message: 'User registered successfully' });
  } catch (error: any) {
    console.error('Registration error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Login Route
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const credentials = req.body;
    const { token, userId, username } = await loginUser(credentials);

    // Set JWT as httpOnly cookie
    setTokenCookie(res, token, cookieMaxAge);

    res.status(200).json({ userId, username, message: 'Logged in successfully' });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(401).json({ message: error.message }); // 401 Unauthorized for invalid credentials
  }
});

// Logout Route
app.post('/auth/logout', (req: Request, res: Response) => {
  clearTokenCookie(res);
  res.status(200).json({ message: 'Logged out successfully' });
});

// --- Protected Route Example ---
interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

app.get('/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  // req.user is populated by authenticateToken middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // In a real app, you'd fetch user details from DB using req.user.id
  // For now, we'll just return the decoded JWT payload data
  res.json({
    message: `Welcome, ${req.user.username}!`, 
    userId: req.user.id,
    username: req.user.username
  });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export app for testing purposes
export { app };