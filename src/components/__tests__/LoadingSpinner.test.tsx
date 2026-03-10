// src/components/__tests__/LoadingSpinner.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  // Test case 1: Basic rendering of the spinner
  test('renders the spinner component', () => {
    render(<LoadingSpinner />);
    // Check if there's an element with class 'spinner'
    const spinnerElement = screen.getByRole('progressbar', { name: /loading/i }); // Attempt to find a role that might be associated, or fallback to text if present
    // Fallback to checking for the div with class spinner if role not found by testing library
    const spinnerDiv = screen.getByRole('img', { name: 'spinner' }); // Assuming the spinner div acts like an img for accessibility testing if no other role matches

    // A more robust check would be to look for the specific style or class if there's no accessible role
    // For now, we'll assume a common pattern or check for a placeholder element.
    // If the spinner is just a div with a class, we can check for its presence.
    // A better approach for accessibility would be to add aria-label="Loading..." to the spinner div.
    // Let's add a specific check for the spinner div's existence and its styling.
    const spinner = screen.container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveStyle('animation: spin 1s ease infinite;');
  });

  // Test case 2: Spinner's visual appearance and animation presence
  test('spinner has correct styling and animation', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('img', { name: 'spinner' }); // Use getByRole or getByTestId based on how it's rendered
    // Fallback to checking container if getByRole fails for structural elements without explicit roles
    const spinnerElement = screen.container.querySelector('.spinner');
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveClass('spinner');
    expect(spinnerElement).toHaveStyle('border-radius: 50%');
    expect(spinnerElement).toHaveStyle('border-left-color: #09f');
    expect(spinnerElement).toHaveStyle('animation: spin 1s ease infinite');
  });

  // Test case 3: Ensure the spinner is centered (basic check)
  test('spinner is centered within its container', () => {
    render(<LoadingSpinner />);
    const container = screen.getByText(/loading/i).closest('div'); // Get the parent div of the spinner
    expect(container).toHaveStyle('display: flex');
    expect(container).toHaveStyle('justify-content: center');
    expect(container).toHaveStyle('align-items: center');
  });
});
