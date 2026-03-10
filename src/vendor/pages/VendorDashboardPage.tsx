import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// CORRECTED IMPORT PATH FOR VENDORREGISTRATIONFORM
import VendorRegistrationForm from '../components/VendorRegistrationForm'; // Correct path: ../components/
// CORRECTED IMPORT PATH FOR API SERVICES
import { getCurrentVendor, registerVendor, Vendor, VendorRegistrationData, ApiError } from '../../services/vendorApi'; // Correct path: ../../services/
import { act } from 'react'; // Import act for testing

const VendorDashboardPage: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null); // Use a state to hold vendor data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State to hold error messages
  const navigate = useNavigate();

  // Fetch current vendor data on component mount
  useEffect(() => {
    const fetchVendorData = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        const fetchedVendor = await getCurrentVendor();
        setVendor(fetchedVendor);
      } catch (err: any) {
        console.error('Error fetching vendor data:', err);
        // Check if err is an ApiError with a message, otherwise use a default
        const errorMessage = err.message || 'Failed to load vendor data. Please try again later.';
        setError(errorMessage);
        setVendor(null); // Ensure vendor is null on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  // Handle vendor registration submission
  const handleVendorRegistrationSubmit = async (formData: VendorRegistrationData) => {
    setIsLoading(true); // Start loading for registration
    setError(null); // Clear previous errors
    try {
      const registeredVendor = await registerVendor(formData);
      setVendor(registeredVendor); // Set the newly registered vendor
      // Optionally navigate to a "pending approval" page or show a success message
      // For now, we'll just display the dashboard with pending status
    } catch (err: any) {
      console.error('Error registering vendor:', err);
      // Check if err is an ApiError with a message, otherwise use a default
      const errorMessage = err.message || 'Registration failed. Please check your details and try again.';
      setError(errorMessage);
      setVendor(null); // Ensure vendor remains null on registration error
    } finally {
      setIsLoading(false);
    }
  };

  // Handle errors originating from the registration form's client-side validation
  const handleFormError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Render logic based on state
  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      {vendor ? (
        // Vendor dashboard content
        <>
          <h1>Welcome to Your Vendor Dashboard, {vendor.businessName}!</h1>
          <p>Your status: {vendor.status}</p> {/* Display status like pending/approved */}
          <p>This is your central hub for managing your store and products.</p>
          
          <div>
            {/* Use Link for better SPA navigation if available, otherwise use anchor tags */}
            <a href="/vendor/products">Manage Products</a> |{' '}
            <a href="/vendor/orders">View Orders</a> |{' '}
            <a href="/vendor/profile">Edit Profile</a>
          </div>
          {/* Future additions: overview of sales, notifications, etc. */}
        </>
      ) : (
        // Registration form if no vendor is found
        <>
          {error && <div className="error-message">{error}</div>} {/* Display general errors */}
          <VendorRegistrationForm
            onSubmit={handleVendorRegistrationSubmit}
            onError={handleFormError}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default VendorDashboardPage;
