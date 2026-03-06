import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, setTokenCookie, clearTokenCookie } from '../middleware/authMiddleware';

// Mocking external dependencies
jest.mock('jsonwebtoken');

// Mock implementations
const mockJwtVerify = jwt.verify as jest.Mock;

// Mock Request, Response, and NextFunction
let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
let nextFunction: jest.Mock;

// Load environment variables for testing
process.env.JWT_SECRET = 'testsecret';
process.env.NODE_ENV = 'development'; // Default to development for testing secure option

describe('Authentication Middleware', () => {

  beforeEach(() => {
    // Reset mocks before each test
    mockJwtVerify.mockClear();
    nextFunction = jest.fn();

    // Mock Request and Response objects
    mockRequest = {
      cookies: {},
    } as Partial<Request>;
    mockResponse = {
      status: jest.fn().mockReturnThis(), // Chainable status
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as Partial<Response>;
  });

  describe('authenticateToken', () => {
    const mockDecodedToken = {
      id: 'user-id-123',
      username: 'testuser',
    };

    // Happy Path: Valid token
    it('should call next() and populate req.user if token is valid', () => {
      // Arrange
      mockRequest.cookies.token = 'validToken123';
      mockJwtVerify.mockReturnValue(mockDecodedToken);

      // Act
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockJwtVerify).toHaveBeenCalledWith('validToken123', 'testsecret');
      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect((mockRequest as any).user).toEqual(mockDecodedToken);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    // Error Handling: No token
    it('should return 401 if token is missing', () => {
      // Arrange: mockRequest.cookies.token is undefined

      // Act
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockJwtVerify).not.toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Authentication token is missing' });
    });

    // Error Handling: Invalid token
    it('should return 403 if token is invalid', () => {
      // Arrange
      mockRequest.cookies.token = 'invalidToken';
      mockJwtVerify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      // Act
      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockJwtVerify).toHaveBeenCalledWith('invalidToken', 'testsecret');
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    });
  });

  describe('setTokenCookie', () => {
    const testToken = 'testTokenValue';
    const testMaxAge = 3600000; // 1 hour in ms

    // Happy Path: Set cookie with default settings
    it('should set an httpOnly cookie with correct options in development', () => {
      // Arrange
      process.env.NODE_ENV = 'development';

      // Act
      setTokenCookie(mockResponse as Response, testToken, testMaxAge);

      // Assert
      expect(mockResponse.cookie).toHaveBeenCalledWith('token', testToken, {
        httpOnly: true,
        secure: false, // NODE_ENV is development
        maxAge: testMaxAge,
        sameSite: 'strict',
      });
    });

    // Happy Path: Set cookie in production (secure=true)
    it('should set an httpOnly, secure cookie in production', () => {
      // Arrange
      process.env.NODE_ENV = 'production';

      // Act
      setTokenCookie(mockResponse as Response, testToken, testMaxAge);

      // Assert
      expect(mockResponse.cookie).toHaveBeenCalledWith('token', testToken, {
        httpOnly: true,
        secure: true, // NODE_ENV is production
        maxAge: testMaxAge,
        sameSite: 'strict',
      });
    });
  });

  describe('clearTokenCookie', () => {
    // Happy Path: Clear cookie
    it('should clear the token cookie', () => {
      // Arrange
      process.env.NODE_ENV = 'development'; // Test with development env

      // Act
      clearTokenCookie(mockResponse as Response);

      // Assert
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('token', {
        httpOnly: true,
        secure: false, // NODE_ENV is development
        sameSite: 'strict',
      });
    });

    // Edge Case: Clear cookie in production env
    it('should clear the token cookie in production env', () => {
      // Arrange
      process.env.NODE_ENV = 'production';

      // Act
      clearTokenCookie(mockResponse as Response);

      // Assert
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('token', {
        httpOnly: true,
        secure: true, // NODE_ENV is production
        sameSite: 'strict',
      });
    });
  });
});
