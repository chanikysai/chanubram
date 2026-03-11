import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewOccasionPage from '../page';
import { useRouter } from 'next/navigation';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the OccasionForm component to spy on its props
jest.mock('@/components/OccasionForm', () => ({
  __esModule: true,
  default: jest.fn(({ onSuccess }) => (
    <div>
      Mock OccasionForm
      <button onClick={() => onSuccess && onSuccess()}>Simulate Success</button>
    </div>
  )),
}));

describe('NewOccasionPage', () => {
  const mockPush = jest.fn();
  const MockOccasionForm = require('@/components/OccasionForm').default; // Get the mocked component

  beforeEach(() => {
    // Reset mocks before each test
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    MockOccasionForm.mockClear();
    mockPush.mockClear();
  });

  // Test case 1: Happy path - Page renders the form and handles successful submission
  test('renders the OccasionForm and navigates on success', async () => {
    render(<NewOccasionPage />);

    // Check if the mocked OccasionForm is rendered
    expect(screen.getByText('Mock OccasionForm')).toBeInTheDocument();

    // Simulate a successful submission from the mock form by clicking its button
    const successButton = screen.getByText('Simulate Success');
    fireEvent.click(successButton);

    // Wait for the router.push to be called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/occasions');
    });
  });

  // Test case 2: Page renders without crashing
  test('renders without crashing', () => {
    render(<NewOccasionPage />);
    expect(screen.getByText('Mock OccasionForm')).toBeInTheDocument();
  });

  // Test case 3: Edge case - The onSuccess callback is called correctly by the form
  test('calls onSuccess prop when the form reports success', async () => {
    render(<NewOccasionPage />);

    // Find the button within the mock form that triggers onSuccess
    const successButton = screen.getByText('Simulate Success');
    fireEvent.click(successButton);

    // Wait for the mock onSuccess to be called (which is handled by the page's router.push)
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/occasions');
    });
  });
});
