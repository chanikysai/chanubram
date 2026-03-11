import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a data-testid={`link-${href}`} href={href}>
      {children}
    </a>
  ),
}));

describe('Navbar', () => {
  // Happy Path: Renders with App Logo and desktop navigation links
  test('should render with app logo and desktop navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('App Logo')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Memories')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    expect(screen.getByTestId('link-/chat')).toHaveAttribute('href', '/chat');
    expect(screen.getByTestId('link-/memories')).toHaveAttribute('href', '/memories');
    expect(screen.getByTestId('link-/goals')).toHaveAttribute('href', '/goals');
    expect(screen.getByTestId('link-/settings')).toHaveAttribute('href', '/settings');
    expect(screen.getByTestId('link-/')).toHaveAttribute('href', '/');
  });

  // Edge Case: Renders with only logo if no desktop nav items were present
  // For this specific implementation, nav items are hardcoded, so this test
  // verifies the logo is present even if the nav part was empty.
  test('should render the logo even if navigation links were dynamically empty', () => {
    render(<Navbar />);
    expect(screen.getByText('App Logo')).toBeInTheDocument();
    // If there were no nav items, we'd expect no links, but we do have them.
    // This test primarily ensures the logo is rendered.
  });

  // Responsiveness Check: Ensure nav is hidden on mobile (via md:hidden)
  test('should hide navigation links on small screens (md:hidden)', () => {
    render(<Navbar />);
    const navElement = screen.getByRole('navigation');
    // We cannot directly test 'hidden on mobile' with basic RTL without viewport manipulation.
    // We can check for the presence of Tailwind classes that imply this behavior.
    expect(navElement).toHaveClass('hidden');
    expect(navElement).toHaveClass('md:flex');
  });

  // Error Handling: Not applicable for this simple component.
});
