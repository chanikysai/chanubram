// src/services/authApi.ts

// Define types for API responses
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  user: User;
  token: string; // JWT or similar
}

interface ErrorResponse {
  message: string;
}

// Simulate a delay for API calls
const simulateApiDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data and tokens
let mockUsers = [
  { id: '1', name: 'Existing User', email: 'user@example.com' }
];
let mockTokens = {
  'user@example.com': 'mock-jwt-token-for-user@example.com'
};

export const registerUser = async (userData: { email: string, name: string, password: string }): Promise<AuthResponse | ErrorResponse> => {
  await simulateApiDelay(500); // Simulate network latency

  const existingUser = mockUsers.find(u => u.email === userData.email);
  if (existingUser) {
    return { message: 'Email already in use.' };
  }

  if (userData.password.length < 6) {
    return { message: 'Password must be at least 6 characters long.' };
  }

  const newUser: User = {
    id: `user-\${mockUsers.length + 1}`,
    name: userData.name,
    email: userData.email,
  };
  mockUsers.push(newUser);
  mockTokens[newUser.email] = `mock-jwt-token-for-\${newUser.email}`; // Generate a mock token

  return { user: newUser, token: mockTokens[newUser.email] };
};

export const loginUser = async (credentials: { email: string, password: string }): Promise<AuthResponse | ErrorResponse> => {
  await simulateApiDelay(500); // Simulate network latency

  const user = mockUsers.find(u => u.email === credentials.email);
  // In a real app, you'd hash and compare passwords. Here we just check existence.
  // This mock assumes any password works if the email exists, which is NOT secure.
  // For this example, we'll simulate a basic check: if email exists, login succeeds.
  // A slightly better mock: check if email/password combo is in mockTokens map
  if (user && mockTokens[credentials.email] === `mock-jwt-token-for-\${credentials.email}`) { // Basic check, not real password validation
    return { user, token: mockTokens[credentials.email] };
  } else {
    return { message: 'Invalid email or password.' };
  }
};

// Add a placeholder for logout if needed in future features
export const logoutUser = async (): Promise<{ message: string }> => {
  await simulateApiDelay(100);
  // In a real app, this would invalidate the token on the server and clear client-side storage.
  return { message: 'Logged out successfully.' };
};
