// src/App.tsx (Test file)
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';

// Mock the lazy-loaded components
jest.mock('./pages/HomePage', () => () => <div>Mocked HomePage</div>);
jest.mock('./pages/VendorRegistrationPage', () => () => <div>Mocked VendorRegistrationPage</div>);
jest.mock('./pages/VendorDashboardPage', () => () => <div>Mocked VendorDashboardPage</div>);
jest.mock('./pages/VendorPayoutsPage', () => () => <div>Mocked VendorPayoutsPage</div>);
jest.mock('./pages/LoginPage', () => () => <div>Mocked LoginPage</div>);
jest.mock('./pages/RegisterPage', () => () => <div>Mocked RegisterPage</div>);
jest.mock('./components/LoadingSpinner', () => () => <div>Loading...</div>); // Mock the spinner

// Helper to render App with a specific route
const renderAppWithRoute = (route: string) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
};

describe('App Component with Lazy Loading', () => {
  // Test case 1: Root path renders HomePage with Suspense fallback
  test('should render HomePage lazily and show LoadingSpinner while loading', async () => {
    // Render the app starting at the root path
    renderAppWithRoute('/');

    // Initially, the fallback should be visible
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the lazy component to load and render
    await waitFor(() => {
      expect(screen.getByText('Mocked HomePage')).toBeInTheDocument();
    });

    // Ensure the fallback is no longer visible after loading
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Test case 2: Vendor Registration page renders lazily
  test('should render VendorRegistrationPage lazily', async () => {
    renderAppWithRoute('/register-vendor');

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mocked VendorRegistrationPage')).toBeInTheDocument();
    });
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Test case 3: Vendor Dashboard page renders lazily
  test('should render VendorDashboardPage lazily', async () => {
    renderAppWithRoute('/vendor/dashboard');

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mocked VendorDashboardPage')).toBeInTheDocument();
    });
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Test case 4: Admin Payouts page renders lazily
  test('should render VendorPayoutsPage lazily', async () => {
    renderAppWithRoute('/admin/payouts');

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mocked VendorPayoutsPage')).toBeInTheDocument();
    });
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Test case 5: Login page renders lazily
  test('should render LoginPage lazily', async () => {
    renderAppWithRoute('/login');

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mocked LoginPage')).toBeInTheDocument();
    });
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Test case 6: Register page renders lazily
  test('should render RegisterPage lazily', async () => {
    renderAppWithRoute('/register');

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mocked RegisterPage')).toBeInTheDocument();
    });
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
