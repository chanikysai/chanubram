import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// Import component
// CORRECTED IMPORT PATH
import VendorDashboardPage from '../pages/VendorDashboardPage'; // Import from ../pages/
// Import specific functions and types from the API module
import * as vendorApi from '../../services/vendorApi'; // Import the module
import { Vendor, VendorRegistrationData, ApiError } from '../../services/vendorApi'; // Import types
import { useNavigate } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(() => mockNavigate), // Provide a mock implementation for useNavigate
}));

// Use spies for mocking functions
const getCurrentVendorSpy = jest.spyOn(vendorApi, 'getCurrentVendor');
const registerVendorSpy = jest.spyOn(vendorApi, 'registerVendor');

describe('VendorDashboardPage', () => {
  beforeEach(() => {
    // Reset spies before each test
    getCurrentVendorSpy.mockClear();
    registerVendorSpy.mockClear();
    mockNavigate.mockClear();
  });

  test('shows loading state initially', () => {
    // Simulate no vendor found immediately
    getCurrentVendorSpy.mockResolvedValue(null);
    render(<VendorDashboardPage />);
    expect(screen.getByText(/loading dashboard.../i)).toBeInTheDocument();
  });

  test('renders registration form if no vendor is found', async () => {
    getCurrentVendorSpy.mockResolvedValue(null); // No vendor found
    render(<VendorDashboardPage />);

    // Wait for the loading state to disappear and the form to appear
    await waitFor(() => {
      expect(screen.queryByText(/loading dashboard.../i)).not.toBeInTheDocument();
      expect(screen.getByText(/vendor registration/i)).toBeInTheDocument(); // Check for form heading
      expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
    });
  });

  test('renders dashboard for an existing vendor', async () => {
    const mockVendor: Vendor = {
      id: 'v1',
      businessName: 'Test Vendor Corp',
      email: 'vendor@example.com',
      phoneNumber: '123-456-7890',
      contactPerson: 'John Doe',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    getCurrentVendorSpy.mockResolvedValue(mockVendor); // Simulate finding a vendor

    render(<VendorDashboardPage />);

    // Wait for the dashboard content to load
    await waitFor(() => {
      expect(screen.getByText(/welcome to your vendor dashboard, test vendor corp!/i)).toBeInTheDocument();
      expect(screen.getByText(/manage products/i)).toBeInTheDocument();
      expect(screen.queryByText(/vendor registration/i)).not.toBeInTheDocument(); // Registration form should not be visible
    });
  });

  test('handles vendor registration submission and success', async () => {
    getCurrentVendorSpy.mockResolvedValue(null); // Start as if no vendor is logged in
    render(<VendorDashboardPage />);

    // Wait for the registration form to be visible
    await screen.findByLabelText(/business name/i);

    // Fill out the form
    const businessNameInput = screen.getByLabelText(/business name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const phoneNumberInput = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    const contactPersonInput = screen.getByLabelText(/contact person/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /register store/i });

    fireEvent.change(businessNameInput, { target: { value: 'New Vendor Ltd.' } });
    fireEvent.change(emailInput, { target: { value: 'new.vendor@example.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: '987-654-3210' } });
    fireEvent.change(contactPersonInput, { target: { value: 'Jane Smith' } });

    // Mock a successful registration response
    const registeredVendor: Vendor = {
      id: 'v2',
      businessName: 'New Vendor Ltd.',
      email: 'new.vendor@example.com',
      phoneNumber: '987-654-3210',
      contactPerson: 'Jane Smith',
      status: 'pending', // Typically pending after initial registration
      createdAt: new Date().toISOString(),
    };
    registerVendorSpy.mockResolvedValue(registeredVendor);

    // Click submit
    fireEvent.click(submitButton);

    // Wait for the component to update with the new vendor data
    await waitFor(() => {
      expect(registerVendorSpy).toHaveBeenCalledTimes(1);
      expect(registerVendorSpy).toHaveBeenCalledWith({
        businessName: 'New Vendor Ltd.',
        email: 'new.vendor@example.com',
        phoneNumber: '987-654-3210',
        contactPerson: 'Jane Smith',
      });
      // Check if the dashboard is rendered with the new vendor's name
      expect(screen.getByText(/welcome to your vendor dashboard, new vendor ltd.!/i)).toBeInTheDocument();
      expect(screen.getByText(/your status: pending/i)).toBeInTheDocument();
    });
  });

  test('handles vendor registration API error', async () => {
    getCurrentVendorSpy.mockResolvedValue(null); // Start as if no vendor is logged in
    render(<VendorDashboardPage />);

    // Wait for the registration form to be visible
    await screen.findByLabelText(/business name/i);

    // Fill out the form
    const businessNameInput = screen.getByLabelText(/business name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const phoneNumberInput = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    const contactPersonInput = screen.getByLabelText(/contact person/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /register store/i });

    fireEvent.change(businessNameInput, { target: { value: 'Test Vendor' } });
    fireEvent.change(emailInput, { target: { value: 'test@vendor.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: '123-456-7890' } });
    fireEvent.change(contactPersonInput, { target: { value: 'John Doe' } });

    // Mock a registration error response
    const apiError: ApiError = { message: 'Email already in use.' };
    registerVendorSpy.mockRejectedValue(new Error(apiError.message));

    // Click submit
    fireEvent.click(submitButton);

    // Wait for the error message to appear in the page's error display
    await waitFor(() => {
      expect(registerVendorSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/email already in use./i)).toBeInTheDocument(); // Check for the error message displayed by the page
    });
    // Ensure dashboard is not rendered
    expect(screen.queryByText(/welcome to your vendor dashboard/i)).not.toBeInTheDocument();
  });

  test('navigates to vendor products page via link', async () => {
    const mockVendor: Vendor = {
      id: 'v1',
      businessName: 'Test Vendor Corp',
      email: 'vendor@example.com',
      phoneNumber: '123-456-7890',
      contactPerson: 'John Doe',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    getCurrentVendorSpy.mockResolvedValue(mockVendor);
    render(<VendorDashboardPage />);

    await screen.findByText(/manage products/i); // Wait for dashboard to load

    const manageProductsLink = screen.getByRole('link', { name: /manage products/i });
    expect(manageProductsLink).toHaveAttribute('href', '/vendor/products');
    // Note: For anchor tags <a>, fireEvent.click doesn't trigger react-router navigation.
    // We only assert the href attribute here. If using Link component, we would mock navigate.
  });

  test('handles error fetching vendor data', async () => {
    const errorMessage = 'Network Error';
    getCurrentVendorSpy.mockRejectedValue(new Error(errorMessage)); // Simulate network error

    render(<VendorDashboardPage />);

    // Wait for loading to finish and error to appear
    await waitFor(() => {
      expect(screen.queryByText(/loading dashboard.../i)).not.toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument(); // Error message from API call
      expect(screen.getByText(/vendor registration/i)).toBeInTheDocument(); // Should fallback to registration form
    });
  });
});
