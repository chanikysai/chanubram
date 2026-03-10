// backend/__tests__/vendorDetailRoutes.test.ts
import request from 'supertest';
import express from 'express';
import vendorDetailRoutes from '../src/routes/vendorDetailRoutes';
import pool from '../src/db';
import redisClient from '../src/config/redisClient';

// Mocking the database pool and Redis client
jest.mock('../src/db');
jest.mock('../src/config/redisClient');

const app = express();
app.use(express.json());
app.use('/api/vendors', vendorDetailRoutes);

// Mock vendor data
const mockVendor = {
  id: 'vendor-123',
  business_name: 'Tech Solutions Inc.',
  email: 'contact@techsolutions.com',
  phone_number: '123-456-7890',
  contact_person: 'Alice Smith',
  address: '123 Main St, Anytown, USA',
  business_description: 'Providing innovative tech solutions.',
  status: 'approved',
  created_at: new Date().toISOString(),
};

// Mocking Redis client methods
const mockRedisGet = jest.fn();
const mockRedisSetEx = jest.fn();
redisClient.get = mockRedisGet;
redisClient.setEx = mockRedisSetEx;

// Mocking Database pool query method
const mockPoolQuery = jest.fn();
pool.query = mockPoolQuery;

describe('Vendor Detail Routes (Caching)', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  // Test case 1: Cache hit - Vendor data found in Redis
  test('should return vendor details from cache if available', async () => {
    mockRedisGet.mockResolvedValue(JSON.stringify(mockVendor)); // Simulate cache hit

    const response = await request(app).get('/api/vendors/vendor-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockVendor);
    expect(mockRedisGet).toHaveBeenCalledWith('vendor:vendor-123');
    expect(mockPoolQuery).not.toHaveBeenCalled(); // Database should not be queried
    expect(mockRedisSetEx).not.toHaveBeenCalled(); // Cache should not be set again
  });

  // Test case 2: Cache miss - Vendor data fetched from DB and cached
  test('should fetch vendor details from DB and cache it if not in Redis', async () => {
    mockRedisGet.mockResolvedValue(null); // Simulate cache miss
    mockPoolQuery.mockResolvedValue({ rows: [mockVendor] }); // Simulate DB returning data
    mockRedisSetEx.mockResolvedValue(null); // Simulate successful cache set

    const response = await request(app).get('/api/vendors/vendor-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockVendor);
    expect(mockRedisGet).toHaveBeenCalledWith('vendor:vendor-123');
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT * FROM vendors WHERE id = $1', ['vendor-123']);
    expect(mockRedisSetEx).toHaveBeenCalledWith('vendor:vendor-123', 3600, JSON.stringify(mockVendor)); // Check if setEx was called with correct params
  });

  // Test case 3: Vendor not found in DB
  test('should return 404 if vendor is not found in the database', async () => {
    mockRedisGet.mockResolvedValue(null); // Simulate cache miss
    mockPoolQuery.mockResolvedValue({ rows: [] }); // Simulate DB returning no data

    const response = await request(app).get('/api/vendors/non-existent-vendor');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Vendor not found.' });
    expect(mockRedisGet).toHaveBeenCalledWith('vendor:non-existent-vendor');
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT * FROM vendors WHERE id = $1', ['non-existent-vendor']);
    expect(mockRedisSetEx).not.toHaveBeenCalled(); // Cache should not be set for not found
  });

  // Test case 4: Database error during fetch
  test('should return 500 if there is a database error', async () => {
    mockRedisGet.mockResolvedValue(null); // Simulate cache miss
    const dbError = new Error('Database connection failed');
    mockPoolQuery.mockRejectedValue(dbError); // Simulate DB error

    const response = await request(app).get('/api/vendors/vendor-123');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Failed to fetch vendor details due to a server error.' });
    expect(mockRedisGet).toHaveBeenCalledWith('vendor:vendor-123');
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT * FROM vendors WHERE id = $1', ['vendor-123']);
    expect(mockRedisSetEx).not.toHaveBeenCalled();
  });

  // Test case 5: Redis error during get
  test('should fall through to DB if Redis GET fails', async () => {
    mockRedisGet.mockRejectedValue(new Error('Redis connection error')); // Simulate Redis error on GET
    mockPoolQuery.mockResolvedValue({ rows: [mockVendor] });
    mockRedisSetEx.mockResolvedValue(null); // Simulate successful cache set after DB fetch

    const response = await request(app).get('/api/vendors/vendor-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockVendor);
    expect(mockRedisGet).toHaveBeenCalledWith('vendor:vendor-123');
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT * FROM vendors WHERE id = $1', ['vendor-123']);
    expect(mockRedisSetEx).toHaveBeenCalledWith('vendor:vendor-123', 3600, JSON.stringify(mockVendor));
  });

  // Test case 6: Redis error during SETEX
  test('should still return data if Redis SETEX fails after DB fetch', async () => {
    mockRedisGet.mockResolvedValue(null); // Simulate cache miss
    mockPoolQuery.mockResolvedValue({ rows: [mockVendor] });
    mockRedisSetEx.mockRejectedValue(new Error('Redis SETEX error')); // Simulate Redis error on SETEX

    const response = await request(app).get('/api/vendors/vendor-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockVendor);
    expect(mockRedisGet).toHaveBeenCalledWith('vendor:vendor-123');
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT * FROM vendors WHERE id = $1', ['vendor-123']);
    expect(mockRedisSetEx).toHaveBeenCalledWith('vendor:vendor-123', 3600, JSON.stringify(mockVendor));
  });
});
