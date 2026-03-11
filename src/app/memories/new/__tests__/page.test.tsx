import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewMemoryPage from '../page';
import MemoryForm from '@/components/MemoryForm'; // Import to check if it's rendered

// Mock the MemoryForm component to isolate page-level testing
jest.mock('@/components/MemoryForm', () => {
  return jest.fn(() => <div data-testid="mock-memory-form">Mock Memory Form</div>);
});

describe('NewMemoryPage', () => {
  // Test case 1: Happy path - Page renders and includes the MemoryForm
  it('should render the NewMemoryPage and contain the MemoryForm component', () => {
    render(<NewMemoryPage />);

    // Check if the main heading is rendered
    expect(screen.getByRole('heading', { name: /create new memory/i })).toBeInTheDocument();

    // Check if the mocked MemoryForm component is rendered
    expect(screen.getByTestId('mock-memory-form')).toBeInTheDocument();
    expect(screen.getByText('Mock Memory Form')).toBeInTheDocument();
  });

  // Edge cases and error handling are mostly within MemoryForm,
  // so this page's tests focus on its rendering responsibilities.
});
