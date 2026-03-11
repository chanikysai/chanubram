// src/app/daily-question/__tests__/page.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import DailyQuestionPage from '../page';

// Mock the fetch API globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper to mock API responses
const mockApiResponse = (url: string, response: any, status: number = 200) => {
  mockFetch.mockImplementation((fetchUrl) => {
    if (fetchUrl === url) {
      return Promise.resolve({
        ok: status >= 200 && status < 300,
        status: status,
        json: () => Promise.resolve(response),
      });
    }
    return Promise.reject(new Error(`Unhandled fetch call to ${fetchUrl}`));
  });
};

const mockApiError = (url: string, message: string, status: number = 500) => {
  mockFetch.mockImplementation((fetchUrl) => {
    if (fetchUrl === url) {
      return Promise.resolve({
        ok: false,
        status: status,
        json: () => Promise.resolve({ message }),
      });
    }
    return Promise.reject(new Error(`Unhandled fetch call to ${fetchUrl}`));
  });
};

describe('DailyQuestionPage', () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const mockQuestionData = {
    id: 'q1',
    text: 'What is one thing you admire about me today, and why?',
    createdAt: today.toISOString(),
    answers: [
      { id: 'a1', questionId: 'q1', userId: 'user123', text: 'Your kindness.', createdAt: new Date(today.getTime() - 86400000).toISOString() }, // Yesterday
      { id: 'a2', questionId: 'q1', userId: 'partner456', text: 'Your sense of humor!', createdAt: new Date(today.getTime() - 43200000).toISOString() }, // 12 hours ago
    ],
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mockClear();
  });

  // Test case 1: Renders loading state initially
  test('should show loading indicator while fetching data', () => {
    mockApiResponse('/api/daily-question', mockQuestionData); // Mock fetch response
    render(<DailyQuestionPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  // Test case 2: Renders error state if fetching fails
  test('should show error message if fetching question fails', async () => {
    mockApiError('/api/daily-question', 'Failed to load');
    render(<DailyQuestionPage />);
    await waitFor(() => expect(screen.getByText(/error: Failed to load/i)).toBeInTheDocument());
  });

  // Test case 3: Renders question and answers when data is fetched successfully
  test('should display the daily question and existing answers', async () => {
    mockApiResponse('/api/daily-question', mockQuestionData);
    render(<DailyQuestionPage />);

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    expect(screen.getByText(mockQuestionData.text)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(formattedDate, 'i'))).toBeInTheDocument();

    // Check for displayed answers
    expect(screen.getByText(/partner response/i)).toBeInTheDocument(); // Generic text, check for presence
    expect(screen.getByText('Your kindness.')).toBeInTheDocument();
    expect(screen.getByText('Your sense of humor!')).toBeInTheDocument();
  });

  // Test case 4: User can type in the answer textarea
  test('should allow user to type in the answer textarea', () => {
    mockApiResponse('/api/daily-question', mockQuestionData);
    render(<DailyQuestionPage />);

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    const testAnswer = 'This is a test answer.';
    fireEvent.change(textarea, { target: { value: testAnswer } });

    expect(textarea).toHaveValue(testAnswer);
  });

  // Test case 5: Submitting an answer
  test('should submit the answer and refetch questions on successful submission', async () => {
    mockApiResponse('/api/daily-question', mockQuestionData); // Initial fetch
    mockApiResponse('/api/daily-question/submit', { id: 'a3', questionId: 'q1', userId: 'user123', text: 'Testing submission', createdAt: new Date().toISOString() }); // Submit response

    render(<DailyQuestionPage />);

    await waitFor(() => screen.getByPlaceholderText(/share your thoughts/i)); // Ensure data is loaded

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    const testAnswer = 'Testing submission';

    fireEvent.change(textarea, { target: { value: testAnswer } });
    fireEvent.click(submitButton);

    // Check if submitting is indicated
    expect(screen.getByRole('button', { name: /submitting.../i })).toBeDisabled();

    // Wait for fetch to complete (which includes the refetch after submit)
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // One for initial GET, one for POST, one for refetch GET - this counts calls. Submit POST call + Refetch GET call = 2 calls AFTER initial GET. So total is 3.
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/daily-question/submit', expect.anything()); // POST call
      expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/daily-question'); // Refetch GET call
    });

    // Ensure textarea is cleared and button is back to normal state
    expect(textarea).toHaveValue('');
    expect(screen.getByRole('button', { name: /submit answer/i })).toBeEnabled();
  });

  // Test case 6: Error submitting an answer
  test('should show error message if submitting answer fails', async () => {
    mockApiResponse('/api/daily-question', mockQuestionData); // Initial fetch
    mockApiError('/api/daily-question/submit', 'Failed to save'); // Submit error

    render(<DailyQuestionPage />);

    await waitFor(() => screen.getByPlaceholderText(/share your thoughts/i));

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    const testAnswer = 'This will fail.';

    fireEvent.change(textarea, { target: { value: testAnswer } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText(/error: Failed to save/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /submit answer/i })).toBeEnabled(); // Button should be re-enabled
  });

  // Test case 7: Form submission with empty textarea should be disabled/prevented
  test('submit button should be disabled if textarea is empty', () => {
    mockApiResponse('/api/daily-question', mockQuestionData);
    render(<DailyQuestionPage />);

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    const submitButton = screen.getByRole('button', { name: /submit answer/i });

    expect(submitButton).toBeDisabled(); // Initially disabled

    fireEvent.change(textarea, { target: { value: 'Some text' } });
    expect(submitButton).toBeEnabled(); // Enabled when has text

    fireEvent.change(textarea, { target: { value: '   ' } }); // Whitespace only
    expect(submitButton).toBeDisabled();
  });
});
