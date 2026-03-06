import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser, getUserById } from '../services/user-authentication-registrationService';

// Mocking external dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

// Mock implementation for bcrypt
const mockHash = bcrypt.hash as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;

// Mock implementation for jwt
const mockSign = jwt.sign as jest.Mock;

// Mock implementation for uuid
const mockUuidv4 = require('uuid').v4 as jest.Mock;

// Load environment variables for testing
process.env.JWT_SECRET = 'testsecret';
process.env.JWT_EXPIRES_IN = '1h';

describe('User Authentication Service', () => {

  beforeEach(() => {
    // Reset mocks before each test
    mockHash.mockClear();
    mockCompare.mockClear();
    mockSign.mockClear();
    mockUuidv4.mockClear();

    // Provide default mock implementations that can be overridden if needed
    mockHash.mockResolvedValue('hashedPassword123');
    mockCompare.mockResolvedValue(true);
    mockSign.mockReturnValue('mockedToken123');
    mockUuidv4.mockReturnValue('mocked-uuid-123');
  });

  describe('registerUser', () => {
    const mockUserRegistrationData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    // Happy Path: Successful registration
    it('should successfully register a new user', async () => {
      // Arrange
      mockUuidv4.mockReturnValue('user-id-abc');
      mockSign.mockReturnValue('token-for-user-abc');

      // Act
      const result = await registerUser(mockUserRegistrationData);

      // Assert
      expect(mockHash).toHaveBeenCalledWith('password123', 10);
      expect(mockUuidv4).toHaveBeenCalled();
      expect(mockSign).toHaveBeenCalledWith({ id: 'user-id-abc', username: 'testuser' }, 'testsecret', { expiresIn: '1h' });
      expect(result).toEqual({
        token: 'token-for-user-abc',
        userId: 'user-id-abc',
        username: 'testuser',
      });
    });

    // Error Handling: Email already in use
    it('should throw an error if the email is already in use', async () => {
      // Arrange: First registration to populate the in-memory store
      await registerUser(mockUserRegistrationData);

      // Act & Assert: Try to register with the same email again
      await expect(registerUser(mockUserRegistrationData)).rejects.toThrow('Email already in use');
      expect(mockHash).not.toHaveBeenCalled(); // Should not proceed to hash if email is duplicate
      expect(mockSign).not.toHaveBeenCalled();
    });

    // Edge Case: Missing fields (service assumes valid input, but this tests robustness if data is partially missing from upstream)
    // NOTE: In a real app, this validation would ideally be done at the API layer before reaching the service.
    it('should throw an error if required fields are missing', async () => {
      const incompleteData = { username: 'testuser', email: 'test@example.com' }; // Missing password
      // Act & Assert
      await expect(registerUser(incompleteData as any)).rejects.toThrow(); // bcrypt.hash might throw, or we could add explicit checks
    });
  });

  describe('loginUser', () => {
    const mockLoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };
    const mockUser = {
      id: 'user-id-abc',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedPassword123',
    };

    // Happy Path: Successful login
    it('should successfully log in a user with valid credentials', async () => {
      // Arrange: Manually set up the in-memory user state as if registered
      // (In a real scenario, this would be fetched from a DB)
      (global as any).users = [mockUser]; // Accessing the global 'users' array from the service
      mockCompare.mockResolvedValue(true);
      mockSign.mockReturnValue('loginToken123');

      // Act
      const result = await loginUser(mockLoginCredentials);

      // Assert
      expect(mockCompare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(mockSign).toHaveBeenCalledWith({ id: 'user-id-abc', username: 'testuser' }, 'testsecret', { expiresIn: '1h' });
      expect(result).toEqual({
        token: 'loginToken123',
        userId: 'user-id-abc',
        username: 'testuser',
      });
    });

    // Error Handling: Invalid credentials (wrong password)
    it('should throw an error for invalid credentials (wrong password)', async () => {
      // Arrange
      (global as any).users = [mockUser];
      mockCompare.mockResolvedValue(false);

      // Act & Assert
      await expect(loginUser(mockLoginCredentials)).rejects.toThrow('Invalid credentials');
      expect(mockCompare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(mockSign).not.toHaveBeenCalled();
    });

    // Error Handling: User not found
    it('should throw an error if the user is not found', async () => {
      // Arrange: Ensure no user exists with the given email
      (global as any).users = [];

      // Act & Assert
      await expect(loginUser(mockLoginCredentials)).rejects.toThrow('Invalid credentials');
      expect(mockCompare).not.toHaveBeenCalled(); // Should not compare if user not found
      expect(mockSign).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    const mockUser = {
      id: 'user-id-xyz',
      username: 'anotheruser',
      email: 'another@example.com',
      passwordHash: 'hashedPasswordXYZ',
    };

    // Happy Path: User found
    it('should return the user if found', () => {
      // Arrange
      (global as any).users = [mockUser];

      // Act
      const user = getUserById('user-id-xyz');

      // Assert
      expect(user).toEqual(mockUser);
    });

    // Edge Case: User not found
    it('should return undefined if user is not found', () => {
      // Arrange
      (global as any).users = [mockUser];

      // Act
      const user = getUserById('non-existent-id');

      // Assert
      expect(user).toBeUndefined();
    });
  });
});
