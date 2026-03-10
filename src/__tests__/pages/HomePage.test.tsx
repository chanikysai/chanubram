import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../../pages/HomePage';
import { MemoryRouter } from 'react-router-dom'; // For testing routing

describe('HomePage', () => {
  it('renders welcome message and navigation links', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome to Our Store')).toBeInTheDocument();
    expect(screen.getByText('Explore our products and add them to your cart!')).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByRole('link', { name: 'Go to Cart' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Product 1' })).toBeInTheDocument();
  });

  // Edge case: Content of the page is static, so edge cases are minimal.
  // The main purpose is to render correctly and provide links.

  // Error Handling: If react-router-dom is not set up correctly, this component might not render.
  // The test setup with MemoryRouter simulates a basic routing environment.
});
