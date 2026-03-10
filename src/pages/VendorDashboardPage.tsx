import React, { useState, useEffect } from 'react';
import VendorRegistrationForm, { VendorRegistrationData } from '../components/VendorRegistrationForm';
import { registerVendor, Vendor, ApiError, getCurrentVendor, fetchVendorById, updateVendor } from '../services/vendorApi'; // Import necessary functions and types
import { useNavigate } from 'react-router-dom'; // Assuming React Router for navigation

// Mock the API calls for demonstration purposes
jest.mock('../services/vendorApi');
// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Cast mocks to their specific types
const mockGetCurrentVendor = getCurrentVendor as jest.Mock;
const mockRegisterVendor = registerVendor as jest.Mock;
const mockFetchVendorById = fetchVendorById as jest.Mock; // For potential future use
const mockUpdateVendor = updateVendor as jest.Mock; // For potential future use
const mockUseNavigate = 'mockNavigate' as any; // Mock the useNavigate return value

const VendorDashboardPage: React.FC = () => {
  const [isVendorRegistered, setIsVendorRegistered] = useState<boolean>(false); // Indicates if user is logged in/registered vendor
  const [vendorData, setVendorData] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Assuming usage of react-router-dom

  useEffect(() => {
    const fetchVendorStatus = async () => {
      setIsLoading(true); // Start loading when checking status
      setError(null); // Clear any previous errors
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
      } finally {
        setIsLoading(false); // Stop loading after checking status
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

  const handleEditApplication = (vendorId: string) => {
    // Placeholder for editing application logic
    console.log(`Editing application for vendor: ${vendorId}`);
    // In a real app, this might navigate to a form pre-filled with current data
    // navigate(`/vendor/edit/${vendorId}`);
  };

  if (isLoading) {
    return <div>Loading dashboard...</div>; // Show loading indicator
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
          <p>Your application status: <span data-testid={`vendor-status-${vendorData.status}`}>{vendorData.status}</span></p>

          {vendorData && vendorData.status === 'pending' && (
            <p>Your application is currently under review. We will notify you once a decision is made.</p>
          )}
          {vendorData && vendorData.status === 'approved' && (
            <div>
              <p>Your vendor account has been approved. Welcome aboard!</p>
              {/* Render dashboard features for approved vendors here */}
              <p>You can now start listing products.</p>
            </div>
          )}
          {vendorData && vendorData.status === 'rejected' && (
            <div>
              <p>We regret to inform you that your vendor application has been rejected.</p>
              <p>Please contact support for more information or to reapply.</p>
              {/* Example button to trigger an edit/reapply process */}
              <button onClick={() => handleEditApplication(vendorData.id)} aria-label="Edit Application">
                Edit Application
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorDashboardPage;
