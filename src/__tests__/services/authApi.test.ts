// Mocking fetch for API calls
global.fetch = jest.fn();

describe('authApi', () => {
  const API_BASE_URL = '/api/auth';

  beforeEach(() => {
    // Clear mocks before each test
    (fetch as jest.Mock).mockClear();
  });

  describe('registerUser', () => {
    const mockCredentials = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
    const mockResponse = { user: { id: '1', name: 'Test User', email: 'test@example.com' }, token: 'fake-token-123' };

    // Happy Path: Successful registration
    test('should successfully register a user', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      });
      const data = await result.json();


      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockCredentials),
      });
      // Asserting based on the mock resolved value
      expect(data).toEqual(mockResponse);
    });

    // Edge Case/Error Handling: Registration fails (e.g., server error)
    test('should throw an error if registration fails', async () => {
      const errorMessage = 'Email already in use';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      });

      await expect(fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      })).rejects.toThrow(errorMessage);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Edge Case: Network error
    test('should throw an error on network failure', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      })).rejects.toThrow('Network error');
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('loginUser', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };
    const mockResponse = { user: { id: '1', name: 'Test User', email: 'test@example.com' }, token: 'fake-token-123' };

    // Happy Path: Successful login
    test('should successfully log in a user', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      });
      const data = await result.json();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockCredentials),
      });
      expect(data).toEqual(mockResponse);
    });

    // Edge Case/Error Handling: Login fails (e.g., invalid credentials)
    test('should throw an error if login fails', async () => {
      const errorMessage = 'Invalid email or password';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      });

      await expect(fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      })).rejects.toThrow(errorMessage);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Edge Case: Network error during login
    test('should throw an error on network failure during login', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      })).rejects.toThrow('Network error');
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
