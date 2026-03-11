// src/app/api/daily-question/__tests__/submit.test.ts

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { POST } from '../submit/route'; // Import the handler from the submit route file

// Mock PrismaClient and its methods
const mockPrisma = {
  question: { // Needed to mock `findUnique`
    findUnique: jest.fn(),
  },
  answer: {
    create: jest.fn(),
  },
};

// Mock getServerSession to return a specific session object
const mockSession = {
  user: { id: 'user123', name: 'Test User' },
};

// Mock authOptions
jest.mock('../auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

describe('POST /api/daily-question/submit API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up Prisma mock
    (PrismaClient as any) = jest.fn(() => mockPrisma);

    // Mock getServerSession
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  // Test case 1: Successful answer submission
  test('should successfully submit an answer and return 201 with the created answer', async () => {
    const questionId = 'q1';
    const answerText = 'I like blue.';
    const userId = 'user123';

    // Mock the API request body
    const requestBody = { questionId, text: answerText };
    const req = new Request('http://localhost/api/daily-question/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    // Mock Prisma to return the created answer
    const createdAnswer = {
      id: 'a1',
      questionId,
      userId,
      text: answerText.trim(),
      createdAt: new Date().toISOString(),
    };
    mockPrisma.question.findUnique.mockResolvedValue({ id: questionId }); // Mock question exists
    mockPrisma.answer.create.mockResolvedValue(createdAnswer);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual(createdAnswer);
    expect(mockPrisma.question.findUnique).toHaveBeenCalledWith({ where: { id: questionId } });
    expect(mockPrisma.answer.create).toHaveBeenCalledWith({
      data: {
        questionId,
        userId,
        text: answerText.trim(),
      },
    });
  });

  // Test case 2: Unauthorized access (no session)
  test('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null); // Simulate no session

    const requestBody = { questionId: 'q1', text: 'Some answer' };
    const req = new Request('http://localhost/api/daily-question/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
    expect(mockPrisma.answer.create).not.toHaveBeenCalled();
  });

  // Test case 3: Bad Request - Missing questionId
  test('should return 400 if questionId is missing', async () => {
    const requestBody = { text: 'Some answer' };
    const req = new Request('http://localhost/api/daily-question/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Question ID and answer text are required.');
    expect(mockPrisma.answer.create).not.toHaveBeenCalled();
  });

  // Test case 4: Bad Request - Empty text
  test('should return 400 if answer text is empty', async () => {
    const requestBody = { questionId: 'q1', text: '   ' }; // Whitespace only
    const req = new Request('http://localhost/api/daily-question/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Question ID and answer text are required.');
    expect(mockPrisma.answer.create).not.toHaveBeenCalled();
  });

  // Test case 5: Not Found - Invalid questionId
  test('should return 404 if questionId is not found', async () => {
    const requestBody = { questionId: 'nonexistent_q_id', text: 'Some answer' };
    const req = new Request('http://localhost/api/daily-question/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    mockPrisma.question.findUnique.mockResolvedValue(null); // Simulate question not found

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe('Question not found.');
    expect(mockPrisma.answer.create).not.toHaveBeenCalled();
  });

  // Test case 6: Server Error - Prisma throws an error
  test('should return 500 on database error', async () => {
    const requestBody = { questionId: 'q1', text: 'Some answer' };
    const req = new Request('http://localhost/api/daily-question/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    mockPrisma.question.findUnique.mockResolvedValue({ id: 'q1' }); // Mock question exists
    mockPrisma.answer.create.mockRejectedValue(new Error('Database connection error'));

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Error submitting answer');
    expect(mockPrisma.answer.create).toHaveBeenCalledTimes(1);
  });

  // Test case 7: Server Error - Prisma foreign key constraint error (e.g., invalid questionId)
  test('should return 400 for invalid question ID (foreign key constraint)', async () => {
    const requestBody = { questionId: 'q1', text: 'Some answer' };
    const req = new Request('http://localhost/api/daily-question/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const fkError = new Error('Foreign key constraint failed');
    // @ts-ignore - Prisma error codes might not be directly typed in generic Error
    fkError.code = 'P2003'; 
    mockPrisma.answer.create.mockRejectedValue(fkError);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Invalid question ID provided.');
    expect(mockPrisma.answer.create).toHaveBeenCalledTimes(1);
  });
});
