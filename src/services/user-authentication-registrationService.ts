import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed

// In-memory user store for demonstration purposes
const users: User[] = [];

const SALT_ROUNDS = 10;

// Load secrets from .env file
const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined in .env file');
}
if (!jwtExpiresIn) {
  throw new Error('JWT_EXPIRES_IN must be defined in .env file');
}

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
}): Promise<{ token: string; userId: string; username: string }> => {
  const { username, email, password } = userData;

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create new user
  const newUser: User = {
    id: uuidv4(), // Generate unique ID
    username,
    email,
    passwordHash,
  };

  users.push(newUser);

  // Generate JWT
  const token = jwt.sign({ id: newUser.id, username: newUser.username }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  return { token, userId: newUser.id, username: newUser.username };
};

export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<{ token: string; userId: string; username: string }> => {
  const { email, password } = credentials;

  // Find user by email
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT
  const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  return { token, userId: user.id, username: user.username };
};

// Helper to get user by ID (e.g., for profile retrieval)
export const getUserById = (userId: string): User | undefined => {
  return users.find(u => u.id === userId);
};