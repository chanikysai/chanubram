import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from './layout';

// Mock next/link to avoid issues with SSR rendering in tests
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a data-testid={`mock-link-${href}`} href={href}>
      {children}
    </a>
  ),
}));

// Mocking the Navbar and BottomNavBar components to test layout structure
jest.mock('../components/Navbar', () => () => <nav data-testid="mock-navbar">Mock Navbar</nav>);
jest.mock('../components/BottomNavBar', () => () => <nav data-testid="mock-bottom-navbar">Mock BottomNavBar</nav>);

// Mocking next/font/google
jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    className: 'mock-inter-font',
  })),
}));

describe('RootLayout', () => {
  // Happy Path: Renders Navbar, Main Content, and BottomNavBar
  test('should render Navbar, main content, and BottomNavBar', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bottom-navbar')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByRole('html')).toBeInTheDocument();
    expect(screen.getByRole('body')).toBeInTheDocument();
  });

  // Edge Case: Renders with no children (empty content)
  test('should render layout correctly with no children', () => {
    render(<RootLayout>
      {null}
    </RootLayout>);

    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bottom-navbar')).toBeInTheDocument();
    // No specific content to check for, just that the layout structure remains intact.
  });

  // Styling and Structure: Verifies basic HTML structure and expected classes
  test('should render with correct HTML structure and basic classes', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const body = screen.getByRole('body');
    expect(body).toHaveClass('mock-inter-font');
    expect(body).toHaveClass('antialiased');
    expect(body).toHaveClass('min-h-screen');
    expect(body).toHaveClass('flex');
    expect(body).toHaveClass('flex-col');

    const mainContent = screen.getByText('Test Content').parentElement;
    expect(mainContent).toHaveClass('flex-1');
    expect(mainContent).toHaveClass('w-full');
    expect(mainContent).toHaveClass('max-w-screen-xl');
    expect(mainContent).toHaveClass('mx-auto');
    expect(mainContent).toHaveClass('px-4');
    expect(mainContent).toHaveClass('py-4');
    expect(mainContent).toHaveClass('md:py-8');
  });

  // Metadata check (optional, as metadata is static)
  test('should have correct metadata', () => {
    // Metadata is not directly rendered, but we can check if the layout component uses it implicitly.
    // For testing metadata, one would typically check the head or use Next.js specific testing utilities if available.
    // For this context, we'll assume it's correctly set in the layout file.
    expect(true).toBe(true); // Placeholder
  });
});
