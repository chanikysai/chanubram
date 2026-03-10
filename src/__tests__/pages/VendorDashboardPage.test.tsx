import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VendorRegistrationForm, { VendorRegistrationData } from '../components/VendorRegistrationForm'; // Adjusted import path
import { registerVendor, Vendor, ApiError, getCurrentVendor, fetchVendorById, updateVendor } from '../../services/vendorApi'; // Adjusted import path
import VendorDashboardPage from '../pages/VendorDashboardPage'; // Adjusted import path

// Mock the vendor API
jest.mock('../../services/vendorApi');
// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Cast mocks to their specific types
const mockGetCurrentVendor = getCurrentVendor as jest.Mock;
const mockRegisterVendor = registerVendor as jest.Mock;
const mockFetchVendorById = fetchVendorById as jest.Mock;
const mockUpdateVendor = updateVendor as jest.Mock;
const mockUseNavigate = 'mockNavigate' as any; // Mock the useNavigate return value

describe('VendorDashboardPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Set up mock for useNavigate
    (require('react-router-dom').useNavigate as jest.Mock).mockReturnValue(mockUseNavigate);
  });

  // Happy Path Test: Renders registration form when no vendor is logged in
  test('should render VendorRegistrationForm when no vendor is logged in', async () => {
    // Simulate no vendor logged in
    mockGetCurrentVendor.mockResolvedValue(null);

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Vendor Registration/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Business Name:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
      expect(screen.queryByText(/Welcome, .*!/i)).not.toBeInTheDocument();
    });
  });

  // Edge Case Test: Renders vendor info when a vendor is logged in with 'approved' status
  test('should render vendor welcome message and approved status when vendor is logged in', async () => {
    const mockVendor: Vendor = {
      id: 'vendor-abc',
      businessName: 'ElectroWorld',
      email: 'electro@example.com',
      phoneNumber: '555-123-4567',
      contactPerson: 'Jane Doe',
      status: 'approved', // Approved status
      createdAt: new Date().toISOString(),
    };
    mockGetCurrentVendor.mockResolvedValue(mockVendor);

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Vendor Dashboard/i })).toBeInTheDocument();
      expect(screen.getByText(`Welcome, ${mockVendor.businessName}!`)).toBeInTheDocument();
      expect(screen.getByText('Your application status: approved')).toBeInTheDocument();
      expect(screen.getByTestId('vendor-status-approved')).toHaveTextContent('approved');
      expect(screen.getByText('Your vendor account has been approved. Welcome aboard!')).toBeInTheDocument();
      expect(screen.queryByLabelText(/Business Name:/i)).not.toBeInTheDocument(); // Registration form should not be visible
    });
  });

  // Test case for 'pending' status
  test('should display pending status message when vendor is logged in with pending status', async () => {
    const mockVendorPending: Vendor = {
      id: 'vendor-pending-123',
      businessName: 'Pending Solutions',
      email: 'pending@example.com',
      phoneNumber: '444-555-6666',
      contactPerson: 'Reviewer',
      status: 'pending', // Pending status
      createdAt: new Date().toISOString(),
    };
    mockGetCurrentVendor.mockResolvedValue(mockVendorPending);

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Vendor Dashboard/i })).toBeInTheDocument();
      expect(screen.getByText(`Welcome, ${mockVendorPending.businessName}!`)).toBeInTheDocument();
      expect(screen.getByText('Your application status: pending')).toBeInTheDocument();
      expect(screen.getByTestId('vendor-status-pending')).toHaveTextContent('pending');
      expect(screen.getByText('Your application is currently under review. We will notify you once a decision is made.')).toBeInTheDocument();
    });
  });

  // Test case for 'rejected' status
  test('should display rejected status message and edit button when vendor is logged in with rejected status', async () => {
    const mockVendorRejected: Vendor = {
      id: 'vendor-rejected-456',
      businessName: 'Rejected Co.',
      email: 'rejected@example.com',
      phoneNumber: '777-888-9999',
      contactPerson: 'Denied User',
      status: 'rejected', // Rejected status
      createdAt: new Date().toISOString(),
    };
    mockGetCurrentVendor.mockResolvedValue(mockVendorRejected);

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Vendor Dashboard/i })).toBeInTheDocument();
      expect(screen.getByText(`Welcome, ${mockVendorRejected.businessName}!`)).toBeInTheDocument();
      expect(screen.getByText('Your application status: rejected')).toBeInTheDocument();
      expect(screen.getByTestId('vendor-status-rejected')).toHaveTextContent('rejected');
      expect(screen.getByText('We regret to inform you that your vendor application has been rejected.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Edit Application/i })).toBeInTheDocument();
    });
  });

  // Error Handling Test: Handles registration submission error
  test('should display an error message if vendor registration fails', async () => {
    const registrationError: ApiError = { message: 'Internal server error during registration' };
    mockRegisterVendor.mockRejectedValue(new Error(registrationError.message)); // Use rejectedValue

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
      expect(screen.getByTestId('dashboard-error-message')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-error-message')).toHaveTextContent(registrationError.message);
      // Form should remain visible after failed submission
      expect(screen.getByLabelText(/Business Name:/i)).toBeInTheDocument();
    });
  });

  // Test: Loading state during initial status check
  test('should show loading indicator during initial vendor status check', async () => {
    mockGetCurrentVendor.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100))); // Simulate network delay

    render(<VendorDashboardPage />);

    // Check for loading indicator
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

    // Wait for the mock to resolve and the loading indicator to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });
  });

  // Test: Handles error during initial status check
  test('should display error message if initial vendor status check fails', async () => {
    const initialError: ApiError = { message: 'Network error fetching status' };
    mockGetCurrentVendor.mockRejectedValue(new Error(initialError.message));

    render(<VendorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-error-message')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-error-message')).toHaveTextContent(initialError.message);
      expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument(); // Ensure registration form is shown
    });
  });

  // Test: Handles successful registration and updates UI to show approved status
  test('should switch to approved vendor view after successful registration', async () => {
    const mockVendorApprovedAfterRegister: Vendor = {
      id: 'vendor-newly-approved',
      businessName: 'Success Story Inc.',
      email: 'success@example.com',
      phoneNumber: '123-123-1234',
      contactPerson: 'Happy Client',
      status: 'approved', // Assume registration leads to approved status for this test
      createdAt: new Date().toISOString(),
    };
    mockRegisterVendor.mockResolvedValue(mockVendorApprovedAfterRegister);
    mockGetCurrentVendor.mockResolvedValue(null); // Ensure initially no vendor is logged in

    render(<VendorDashboardPage />);

    // Fill and submit the registration form
    const businessNameInput = screen.getByLabelText(/Business Name:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const phoneNumberInput = screen.getByLabelText(/Phone Number:/i);
    const contactPersonInput = screen.getByLabelText(/Contact Person:/i);
    const submitButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(businessNameInput, { target: { value: 'Success Story Inc.' } });
    fireEvent.change(emailInput, { target: { value: 'success@example.com' } });
    fireEvent.change(phoneNumberInput, { target: { value: '123-123-1234' } });
    fireEvent.change(contactPersonInput, { target: { value: 'Happy Client' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterVendor).toHaveBeenCalledTimes(1);
      expect(screen.getByText(`Welcome, ${mockVendorApprovedAfterRegister.businessName}!`)).toBeInTheDocument();
      expect(screen.getByText('Your application status: approved')).toBeInTheDocument();
      expect(screen.getByText('Your vendor account has been approved. Welcome aboard!')).toBeInTheDocument();
      expect(screen.queryByLabelText(/Business Name:/i)).not.toBeInTheDocument();
    });
  });
});
