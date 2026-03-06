import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Load secrets from .env file
const jwtSecret = process.env.JWT_SECRET as string;

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined in .env file');
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      username: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(403).json({ message: 'Token is not valid' });
  }
};

export const setTokenCookie = (res: Response, token: string, maxAge: number) => {
  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side JS access
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: maxAge, // in milliseconds
    sameSite: 'strict', // Protects against CSRF attacks
  });
};

export const clearTokenCookie = (res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};