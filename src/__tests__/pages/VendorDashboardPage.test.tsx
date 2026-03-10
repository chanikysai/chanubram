import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VendorRegistrationForm, { VendorRegistrationData } from '../components/VendorRegistrationForm'; // Adjusted import path
import { registerVendor, Vendor, ApiError } from '../services/vendorApi'; // Adjusted import path
import VendorDashboardPage from '../pages/VendorDashboardPage'; // Adjusted import path

// Mock the vendor API
jest.mock('../services/vendorApi');
// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockRegisterVendor = registerVendor as jest.Mock;
const mockUseNavigate = 'mockNavigate' as any; // Mock the useNavigate return value

describe('VendorDashboardPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Set up mock for useNavigate
    (require('react-router-dom').useNavigate as jest.Mock).mockReturnValue(mockUseNavigate);

    // Default mock for getCurrentVendor to simulate no vendor logged in
    (Vendor.prototype.getCurrentVendor as any) = jest.fn().mockResolvedValue(null);
  });

  // Happy Path Test: Renders registration form when no vendor is logged in
  test('should render VendorRegistrationForm when no vendor is logged in', async () => {
    // Simulate no vendor logged in
    (Vendor.prototype.getCurrentVendor as any) = jest.fn().mockResolvedValue(null);

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Vendor Registration/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Business Name:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
      expect(screen.queryByText(/Welcome, .*!/i)).not.toBeInTheDocument();
    });
  });

  // Edge Case Test: Renders vendor info when a vendor is logged in
  test('should render vendor welcome message when a vendor is logged in', async () => {
    const mockVendor: Vendor = {
      id: 'vendor-abc',
      businessName: 'ElectroWorld',
      email: 'electro@example.com',
      phoneNumber: '555-123-4567',
      contactPerson: 'Jane Doe',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    // Simulate a vendor being logged in
    (Vendor.prototype.getCurrentVendor as any) = jest.fn().mockResolvedValue(mockVendor);

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Vendor Dashboard/i })).toBeInTheDocument();
      expect(screen.getByText(`Welcome, ${mockVendor.businessName}!`)).toBeInTheDocument();
      expect(screen.getByText('Your vendor dashboard is ready.')).toBeInTheDocument();
      expect(screen.queryByLabelText(/Business Name:/i)).not.toBeInTheDocument(); // Registration form should not be visible
    });
  });

  // Error Handling Test: Handles registration submission error
  test('should display an error message if vendor registration fails', async () => {
    const registrationError: ApiError = { message: 'Internal server error during registration' };
    mockRegisterVendor.mockRejectedValueOnce(new Error(registrationError.message));

    render(<VendorDashboardPage />);

    // First, ensure the form is rendered
    await waitFor(() => {
      expect(screen.getByLabelText(/Business Name:/i)).toBeInTheDocument();
    });

    // Simulate filling and submitting the form
    const businessNameInput = screen.getByLabelText(/Business Name:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const phoneNumberInput = screen.getByLabelText(/Phone Number:/i);
    const contactPersonInput = screen.getByLabelText(/Contact Person:/i);
    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(businessNameInput, { target: { value: 'Test Vendor' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: '111-222-3333' } });
    fireEvent.change(contactPersonInput, { target: { value: 'Test Person' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterVendor).toHaveBeenCalledTimes(1);
      // Error message from the API should be displayed
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent(registrationError.message);
      // Form should remain visible after failed submission
      expect(screen.getByLabelText(/Business Name:/i)).toBeInTheDocument();
    });
  });

  // Test: Navigation on successful registration (assuming no specific navigation set up yet)
  // For now, we'll check that the component state updates correctly.
  test('should update state to show welcome message after successful registration', async () => {
    const mockVendor: Vendor = {
      id: 'vendor-xyz',
      businessName: 'New Vendor Inc.',
      email: 'new@example.com',
      phoneNumber: '999-888-7777',
      contactPerson: 'New Person',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    mockRegisterVendor.mockResolvedValueOnce(mockVendor);

    render(<VendorDashboardPage />);

    // Fill and submit the registration form
    const businessNameInput = screen.getByLabelText(/Business Name:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const phoneNumberInput = screen.getByLabelText(/Phone Number:/i);
    const contactPersonInput = screen.getByLabelText(/Contact Person:/i);
    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(businessNameInput, { target: { value: 'New Vendor Inc.' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: '999-888-7777' } });
    fireEvent.change(contactPersonInput, { target: { value: 'New Person' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterVendor).toHaveBeenCalledTimes(1);
      // State should update to show the vendor welcome message
      expect(screen.getByText(`Welcome, ${mockVendor.businessName}!`)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Business Name:/i)).not.toBeInTheDocument();
    });
  });

  // Test: Loading state during registration
  test('should show loading indicator during registration submission', async () => {
    mockRegisterVendor.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100))); // Simulate network delay

    render(<VendorDashboardPage />);

    // Fill and submit the registration form
    const businessNameInput = screen.getByLabelText(/Business Name:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const phoneNumberInput = screen.getByLabelText(/Phone Number:/i);
    const contactPersonInput = screen.getByLabelText(/Contact Person:/i);
    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(businessNameInput, { target: { value: 'Loading Test' } });
    fireEvent.change(emailInput, { target: { value: 'loading@test.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: '111-111-1111' } });
    fireEvent.change(contactPersonInput, { target: { value: 'Loading Person' } });
    fireEvent.click(submitButton);

    // Check if the button text changes to "Registering..." and becomes disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Registering.../i })).toBeDisabled();
    });

    // Wait for the mock to resolve, then check if state reverts
    await waitFor(() => {
      // Button should revert to "Register" and be enabled (or registration successful message shown)
      expect(screen.getByRole('button', { name: /Register/i })).toBeEnabled();
    });
  });
});
