import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OccasionsPage from '../page';

// Mock the fetch API to control network responses
global.fetch = jest.fn();

// Mock the Link component from next/link to avoid errors during rendering
jest.mock('next/link', () => {
  return ({ children, ...props }: any) => <a {...props}>{children}</a>;
});

// Mock the date formatting helper if it were complex, but it's simple enough to test inline
// If it were in a separate file, we'd mock that file.

describe('OccasionsPage', () => {
  const mockFetch = fetch as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mockClear();
    // Mock console.error to prevent it from cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    jest.restoreAllMocks();
  });

  // Test case 1: Happy path - Page renders loading state and then displays occasions
  test('renders loading state and then displays occasions', async () => {
    const mockOccasions = [
      {
        id: 'occ_1',
        name: 'Anniversary',
        date: new Date('2024-12-25T00:00:00.000Z').toISOString(),
        reminderDate: new Date('2024-12-20T00:00:00.000Z').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'occ_2',
        name: 'Partner Birthday',
        date: new Date('2025-01-15T00:00:00.000Z').toISOString(),
        reminderDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOccasions,
    });

    render(<OccasionsPage />);

    // Check for loading message
    expect(screen.getByText('Loading occasions...')).toBeInTheDocument();

    // Wait for the data to be fetched and rendered
    await waitFor(() => {
      expect(screen.queryByText('Loading occasions...')).not.toBeInTheDocument();
      expect(screen.getByText('Upcoming Special Occasions')).toBeInTheDocument();
      expect(screen.getByText('Add New Occasion')).toBeInTheDocument();

      // Check if occasions are displayed
      expect(screen.getByText('Anniversary')).toBeInTheDocument();
      expect(screen.getByText('Partner Birthday')).toBeInTheDocument();
      expect(screen.getByText('Date: December 25, 2024')).toBeInTheDocument();
      expect(screen.getByText('Reminder: December 20, 2024')).toBeInTheDocument();
      expect(screen.getByText('Date: January 15, 2025')).toBeInTheDocument();
      // Reminder date should not be displayed if null
      expect(screen.queryByText('Reminder:')).not.toBeInTheDocument(); // Check for 'Reminder:' text absence if reminderDate is null
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/occasions');
  });

  // Test case 2: Error handling - Fetching occasions fails
  test('displays error message when fetching occasions fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<OccasionsPage />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load occasions. Please try again later.')).toBeInTheDocument();
      expect(screen.queryByText('Loading occasions...')).not.toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/occasions');
  });

  // Test case 3: Edge case - No occasions found
  test('displays message when no occasions are found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [], // Empty array for no occasions
    });

    render(<OccasionsPage />);

    // Wait for the "no occasions" message to appear
    await waitFor(() => {
      expect(screen.getByText('No upcoming occasions found. Add one to get started!')).toBeInTheDocument();
      expect(screen.queryByText('Loading occasions...')).not.toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/occasions');
  });

  // Test case 4: Link to add new occasion works
  test('link to add new occasion navigates correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [], // Provide empty data to avoid rendering occasions
    });

    render(<OccasionsPage />);

    await waitFor(() => {
      const addButton = screen.getByText('Add New Occasion');
      expect(addButton).toBeInTheDocument();
      // The mock Link component will render as an anchor tag
      expect(addButton.closest('a')).toHaveAttribute('href', '/occasions/new');
    });
  });

  // Test case 5: Sorting of occasions (ensure dates are sorted correctly)
  test('displays occasions sorted by date', async () => {
    const mockOccasions = [
      {
        id: 'occ_2',
        name: 'Later Birthday',
        date: new Date('2025-02-01T00:00:00.000Z').toISOString(),
        reminderDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'occ_1',
        name: 'Earlier Anniversary',
        date: new Date('2024-12-25T00:00:00.000Z').toISOString(),
        reminderDate: new Date('2024-12-20T00:00:00.000Z').toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOccasions,
    });

    render(<OccasionsPage />);

    await waitFor(() => {
      const occasionCards = screen.getAllByRole('heading', { level: 2 }); // Headings for occasion names
      expect(occasionCards.length).toBe(2);

      // Check the order of displayed occasions
      expect(occasionCards[0]).toHaveTextContent('Earlier Anniversary');
      expect(occasionCards[1]).toHaveTextContent('Later Birthday');
    });
  });
});
