import React, { useState, useEffect } from 'react';
import VendorRegistrationForm, { VendorRegistrationData } from '../components/VendorRegistrationForm';
import { registerVendor, Vendor, ApiError, getCurrentVendor } from '../services/vendorApi'; // Import necessary functions and types
import { useNavigate } from 'react-router-dom'; // Assuming React Router for navigation

// Mock the API call for getCurrentVendor to simulate logged-in state
jest.mock('../services/vendorApi');
// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Cast mocks to their specific types
const mockGetCurrentVendor = getCurrentVendor as jest.Mock;
const mockRegisterVendor = registerVendor as jest.Mock;
const mockUseNavigate = 'mockNavigate' as any; // Mock the useNavigate return value

const VendorDashboardPage: React.FC = () => {
  const [isVendorRegistered, setIsVendorRegistered] = useState<boolean>(false); // Indicates if user is logged in/registered vendor
  const [vendorData, setVendorData] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Assuming usage of react-router-dom

  useEffect(() => {
    const fetchVendorStatus = async () => {
      try {
        const fetchedVendor = await mockGetCurrentVendor(); // Use the mocked function
        if (fetchedVendor) {
          setVendorData(fetchedVendor);
          setIsVendorRegistered(true);
        } else {
          setIsVendorRegistered(false); // No vendor logged in
        }
      } catch (err: any) {
        console.error('Error fetching vendor status:', err);
        setError(err.message || 'Failed to load dashboard status.');
        setIsVendorRegistered(false); // Assume not registered if error occurs
      }
    };
    fetchVendorStatus();
  }, []);

  const handleRegistrationSubmit = async (data: VendorRegistrationData) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const registeredVendor = await mockRegisterVendor(data); // Use the mocked function
      setVendorData(registeredVendor);
      setIsVendorRegistered(true);
      // Optionally navigate to a success page or the dashboard overview
      // For now, we just update the state to show the welcome message.
      // navigate('/vendor/dashboard/success'); // Example navigation
    } catch (err: any) {
      // Check if the error is an ApiError object with a message
      if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during registration.');
      }
      setIsVendorRegistered(false); // Keep form visible if registration failed
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !vendorData) { // Show loading only if we are fetching initial status and haven't loaded data
    return <div>Loading dashboard status...</div>; // Or a spinner component
  }

  return (
    <div>
      <h1>Vendor Dashboard</h1>
      {!isVendorRegistered ? (
        <>
          {error && <div style={{ color: 'red', marginBottom: '10px' }} data-testid="dashboard-error-message">{error}</div>}
          <VendorRegistrationForm
            onSubmit={handleRegistrationSubmit}
            isLoading={isLoading} // Pass loading state to form
            error={null} // Pass null error to form, as dashboard handles its own error display
          />
        </>
      ) : (
        <div>
          {vendorData && <h2>Welcome, {vendorData.businessName}!</h2>}
          <p>Your vendor dashboard is ready.</p>
          {/* Render other dashboard components here */}
          {/* e.g., links to manage products, view orders, etc. */}
        </div>
      )}
    </div>
  );
};

export default VendorDashboardPage;
