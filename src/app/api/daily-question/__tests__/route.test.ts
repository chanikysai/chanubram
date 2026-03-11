// src/app/api/daily-question/__tests__/route.test.ts

// Mocking Prisma Client and NextAuth session is crucial here.
// For demonstration, we'll outline the structure and assume mocking libraries are available.

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { GET } from '../route'; // Import the handler from the actual file

// Mock PrismaClient and its methods
// Using a mock implementation that returns canned data for specific calls
const mockPrisma = {
  question: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  answer: {
    // Mock methods if needed for POST tests
  },
};

// Mock getServerSession to return a specific session object
const mockSession = {
  user: { id: 'user123', name: 'Test User' },
};

// Mock getDailyQuestion from '@/lib/questions'
jest.mock('../../../../lib/questions', () => ({
  getDailyQuestion: jest.fn(),
}));

// Mock authOptions (if it's a separate import)
jest.mock('../auth/[...nextauth]/route', () => ({
  authOptions: {}, // Provide a dummy or actual authOptions if needed for mockSession
}));


// Mock Date to control 'today' in the GET handler
const realDate = Date;
const mockDate = class extends Date {
  constructor(dateString: string | number | Date) {
    if (dateString === 'today') {
      // Return a fixed date for consistent testing
      super('2023-10-26T10:00:00.000Z');
    } else {
      super(dateString);
    }
  }
  getDate() { // Override getDate to ensure it works with mocked date
      const d = new realDate(this.getTime());
      return d.getDate();
  }
};
global.Date = mockDate as any;


describe('GET /api/daily-question API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Set up Prisma mock for this test suite
    (PrismaClient as any) = jest.fn(() => mockPrisma);

    // Mock getServerSession to return the mock session
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    // Mock getDailyQuestion to return a predictable question for our test date
    const mockGetDailyQuestion = require('../../../../lib/questions').getDailyQuestion;
    mockGetDailyQuestion.mockReturnValue('What is your favorite color?');
  });

  afterAll(() => {
    // Restore original Date object after all tests
    global.Date = realDate;
  });

  // Test case 1: Question exists for today
  test('should return the existing question and its answers if it exists for today', async () => {
    const mockQuestionId = 'q1';
    const mockAnswers = [{ id: 'a1', questionId: mockQuestionId, userId: 'user123', text: 'Blue', createdAt: new Date().toISOString() }];

    mockPrisma.question.findFirst.mockResolvedValue({
      id: mockQuestionId,
      text: 'What is your favorite color?',
      createdAt: '2023-10-26T00:00:00.000Z', // Matches mocked 'today'
      answers: mockAnswers,
    });

    const req = new Request('http://localhost/api/daily-question');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(mockQuestionId);
    expect(data.text).toBe('What is your favorite color?');
    expect(data.answers).toEqual(mockAnswers);
    expect(mockPrisma.question.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.question.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.question.create).not.toHaveBeenCalled();
    expect(mockPrisma.question.update).not.toHaveBeenCalled();
  });

  // Test case 2: No question for today, but question text exists from another day
  test('should update createdAt and return an existing question if text matches today', async () => {
    const mockQuestionId = 'q1';
    const mockExistingQuestionText = 'What is your favorite color?';

    mockPrisma.question.findFirst.mockResolvedValue(null); // No question for today

    // Mock findUnique to return an existing question
    mockPrisma.question.findUnique.mockResolvedValue({
      id: mockQuestionId,
      text: mockExistingQuestionText,
      createdAt: '2023-10-20T00:00:00.000Z', // From a previous day
      answers: [],
    });

    // Mock update to return the updated question
    const updatedQuestion = {
      id: mockQuestionId,
      text: mockExistingQuestionText,
      createdAt: '2023-10-26T00:00:00.000Z', // Updated to today
      answers: [],
    };
    mockPrisma.question.update.mockResolvedValue(updatedQuestion);

    const req = new Request('http://localhost/api/daily-question');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(mockQuestionId);
    expect(data.text).toBe(mockExistingQuestionText);
    expect(new Date(data.createdAt).toISOString().startsWith('2023-10-26')).toBe(true);
    expect(data.answers).toEqual([]);
    expect(mockPrisma.question.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.question.findUnique).toHaveBeenCalledWith({ where: { text: mockExistingQuestionText } });
    expect(mockPrisma.question.create).not.toHaveBeenCalled();
    expect(mockPrisma.question.update).toHaveBeenCalledTimes(1);
  });

  // Test case 3: No question for today and question text is new
  test('should create a new question if no question exists for today and text is new', async () => {
    const mockQuestionId = 'q_new_1';
    const newQuestionText = 'What is your favorite color?'; // As returned by getDailyQuestion

    mockPrisma.question.findFirst.mockResolvedValue(null); // No question for today
    mockPrisma.question.findUnique.mockResolvedValue(null); // No existing question with this text

    // Mock create to return the new question
    const createdQuestion = {
      id: mockQuestionId,
      text: newQuestionText,
      createdAt: '2023-10-26T00:00:00.000Z', // Today
      answers: [],
    };
    mockPrisma.question.create.mockResolvedValue(createdQuestion);

    const req = new Request('http://localhost/api/daily-question');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(mockQuestionId);
    expect(data.text).toBe(newQuestionText);
    expect(data.createdAt).toBe('2023-10-26T00:00:00.000Z');
    expect(data.answers).toEqual([]);
    expect(mockPrisma.question.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.question.findUnique).toHaveBeenCalledWith({ where: { text: newQuestionText } });
    expect(mockPrisma.question.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.question.update).not.toHaveBeenCalled();
  });

  // Test case 4: Server error during fetch
  test('should return 500 on server error', async () => {
    mockPrisma.question.findFirst.mockRejectedValue(new Error('Database error'));

    const req = new Request('http://localhost/api/daily-question');
    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe('Error fetching daily question');
  });

  // Optional: Test unauthorized access if authentication is enforced
  // test('should return 401 if user is not authenticated', async () => {
  //   (getServerSession as jest.Mock).mockResolvedValue(null); // Simulate no session
  //   const req = new Request('http://localhost/api/daily-question');
  //   const res = await GET(req);
  //   expect(res.status).toBe(401);
  //   const data = await res.json();
  //   expect(data.message).toBe('Unauthorized');
  // });
});

// TODO: Add tests for POST /api/daily-question/submit
// These tests would require mocking Prisma.answer.create and getServerSession
// and handling request body parsing.
