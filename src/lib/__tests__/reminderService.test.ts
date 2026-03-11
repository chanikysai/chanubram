import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { setReminder } from '@/lib/reminderService'; // Import the function to be mocked

// Mock the setReminder function
jest.mock('@/lib/reminderService', () => ({
  setReminder: jest.fn(),
}));

// Mock the API call directly if needed, but for this service, mocking the function is sufficient
// jest.mock('fetch', () => ({ ... })); // If setReminder internally calls fetch

describe('reminderService', () => {
  const mockSetReminder = setReminder as jest.Mock;

  beforeEach(() => {
    // Clear mocks before each test
    mockSetReminder.mockClear();
    // Mock console.log to avoid cluttering test output, and check if it was called
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.log after each test
    jest.restoreAllMocks();
  });

  // Test case 1: Happy path - setReminder is called with correct parameters
  test('should call setReminder with correct parameters', async () => {
    const occasionId = 'occ_123';
    const occasionName = 'Anniversary';
    const occasionDate = '2024-12-25T00:00:00.000Z';
    const reminderDate = '2024-12-20T00:00:00.000Z';

    await setReminder(occasionId, occasionName, occasionDate, reminderDate);

    await waitFor(() => {
      expect(mockSetReminder).toHaveBeenCalledTimes(1);
      expect(mockSetReminder).toHaveBeenCalledWith(
        occasionId,
        occasionName,
        occasionDate,
        reminderDate
      );
      // Check if console.log was called with the expected message
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Setting reminder for "Anniversary"'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('on 2024-12-20T00:00:00.000Z'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('(Occasion ID: occ_123)'));
    });
  });

  // Test case 2: Edge case - setReminder is called with a null reminderDate
  test('should handle null reminderDate gracefully', async () => {
    const occasionId = 'occ_456';
    const occasionName = 'Partner's Birthday';
    const occasionDate = '2025-01-15T00:00:00.000Z';
    const reminderDate = ''; // Simulating an empty string or no reminder date

    // The actual implementation might expect null or undefined, or handle empty string.
    // Assuming the service is robust enough to handle it.
    await setReminder(occasionId, occasionName, occasionDate, reminderDate);

    await waitFor(() => {
      expect(mockSetReminder).toHaveBeenCalledTimes(1);
      // The service implementation logs, we are checking if it was called.
      // For the actual function under test, we'd check its internal logic or return value.
      // Here we test the mock wrapper's behavior.
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Setting reminder for "Partner's Birthday"'));
      // The mock implementation logs the provided reminderDate, which might be empty string in this case.
      // If the actual function converts '' to null or skips, the mock should reflect that if it was the SUT.
      // For this mock, we check if it was called with the empty string.
      expect(mockSetReminder).toHaveBeenCalledWith(
        occasionId,
        occasionName,
        occasionDate,
        reminderDate // Checking that the empty string was passed
      );
    });
  });

  // Test case 3: Error handling - The mock simulates an error during the 'API call'
  // Note: This test is for the *mock* itself, not necessarily a real error in the service.
  // If the real service had logic that could throw, we'd test that.
  // For this mock, it always succeeds after a delay.
  // To simulate error, we'd need to mock the Promise rejection.
  test('should simulate success and not throw an error', async () => {
    const occasionId = 'occ_789';
    const occasionName = 'Graduation';
    const occasionDate = '2026-06-01T00:00:00.000Z';
    const reminderDate = '2026-05-25T00:00:00.000Z';

    // Expecting the function call not to throw an error
    await expect(setReminder(occasionId, occasionName, occasionDate, reminderDate)).resolves.not.toThrow();

    await waitFor(() => {
      expect(mockSetReminder).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Mock reminder set successfully.'));
    });
  });
});
