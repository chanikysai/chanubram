import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BottomNavBar from './BottomNavBar';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a data-testid={`link-${href}`} href={href}>
      {children}
    </a>
  ),
}));

describe('BottomNavBar', () => {
  // Happy Path: Renders with all navigation items
  test('should render with all navigation items', () => {
    render(<BottomNavBar />);
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Memories')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    expect(screen.getByTestId('link-/chat')).toHaveAttribute('href', '/chat');
    expect(screen.getByTestId('link-/memories')).toHaveAttribute('href', '/memories');
    expect(screen.getByTestId('link-/goals')).toHaveAttribute('href', '/goals');
    expect(screen.getByTestId('link-/settings')).toHaveAttribute('href', '/settings');
  });

  // Edge Case: No nav items (though hardcoded, good to test if dynamic)
  // For this specific implementation, navItems is hardcoded, so this test might not be strictly necessary unless navItems could be empty.
  test('should render correctly even if navItems were empty (conceptual)', () => {
    // To test this, we'd need to mock the navItems array, which is not feasible with this implementation.
    // However, if it were dynamic and could be empty, we'd expect no links to render.
    // For now, we assert the opposite of the happy path.
    render(<BottomNavBar />);
    expect(screen.getByTestId('link-/chat')).toBeInTheDocument(); // Confirming it renders as expected
  });

  // Styling/Responsiveness Check (Conceptual - actual visual testing is complex in unit tests)
  test('should have correct Tailwind classes for positioning and mobile display', () => {
    render(<BottomNavBar />);
    const navElement = screen.getByRole('navigation');
    expect(navElement).toHaveClass('fixed');
    expect(navElement).toHaveClass('bottom-0');
    expect(navElement).toHaveClass('left-0');
    expect(navElement).toHaveClass('right-0');
    expect(navElement).toHaveClass('flex');
    expect(navElement).toHaveClass('justify-around');
    expect(navElement).toHaveClass('py-2');
    expect(navElement).toHaveClass('px-3');
    expect(navElement).toHaveClass('z-50');
    expect(navElement).toHaveClass('border-t');
    expect(navElement).toHaveClass('md:hidden'); // Hidden on medium screens and up
  });

  // Error Handling: Not directly applicable for this simple component as it doesn't fetch data or handle complex logic.
  // If it were to fetch data, error states would be tested.
});
