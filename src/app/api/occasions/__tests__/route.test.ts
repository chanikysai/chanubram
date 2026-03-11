import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setReminder } from '@/lib/reminderService';

// Mock prisma and setReminder for testing the GET handler
jest.mock('@/lib/prisma', () => ({
  occasion: {
    findMany: jest.fn(),
  },
}));
// No need to mock setReminder for GET handler, but good to have consistent mocks if needed

// Cast mocks to JestMock types for easier assertion
const mockPrismaFindMany = prisma.occasion.findMany as jest.Mock;

describe('API Occasions GET Handler', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockPrismaFindMany.mockClear();
    // Mock console.error to prevent it from cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    jest.restoreAllMocks();
  });

  // Test case 1: Happy path - Successfully fetch multiple occasions
  test('should fetch and return a list of occasions sorted by date', async () => {
    const mockOccasions = [
      {
        id: 'occ_1',
        name: 'Anniversary',
        date: new Date('2024-12-25T00:00:00.000Z'),
        reminderDate: new Date('2024-12-20T00:00:00.000Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'occ_2',
        name: 'Birthday',
        date: new Date('2025-01-15T00:00:00.000Z'),
        reminderDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPrismaFindMany.mockResolvedValue(mockOccasions);

    // Simulate a GET request (NextResponse does not require a request object for GET)
    const response = await GET(new Request('http://localhost/api/occasions', { method: 'GET' }) as any); // Cast to any if needed

    expect(response.status).toBe(200);
    expect(mockPrismaFindMany).toHaveBeenCalledWith({
      orderBy: {
        date: 'asc',
      },
    });
    const responseData = await response.json();
    expect(responseData).toHaveLength(2);
    expect(responseData[0].name).toBe('Anniversary'); // Check sorting
    expect(responseData[1].name).toBe('Birthday');
  });

  // Test case 2: Edge case - No occasions found
  test('should return an empty array if no occasions are found', async () => {
    mockPrismaFindMany.mockResolvedValue([]);

    const response = await GET(new Request('http://localhost/api/occasions', { method: 'GET' }) as any);

    expect(response.status).toBe(200);
    expect(mockPrismaFindMany).toHaveBeenCalledWith({
      orderBy: {
        date: 'asc',
      },
    });
    const responseData = await response.json();
    expect(responseData).toEqual([]);
  });

  // Test case 3: Error handling - Prisma findMany fails
  test('should return 500 if prisma fails to fetch occasions', async () => {
    const prismaError = new Error('Database connection failed');
    mockPrismaFindMany.mockRejectedValue(prismaError);

    const response = await GET(new Request('http://localhost/api/occasions', { method: 'GET' }) as any);

    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData.message).toBe('An error occurred while fetching occasions.');
    expect(mockPrismaFindMany).toHaveBeenCalledTimes(1);
  });
});
