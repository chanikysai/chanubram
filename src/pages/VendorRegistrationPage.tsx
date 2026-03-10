import React from 'react';
import VendorRegistrationForm from '../components/VendorRegistrationForm';
import { VendorRegistrationData } from '../components/VendorRegistrationForm'; // Import the interface
import { registerVendor } from '../services/vendorApi'; // Import the API service

const VendorRegistrationPage: React.FC = () => {
  const handleRegistrationSubmit = async (data: VendorRegistrationData) => {
    // This handler will be called when the form is submitted successfully
    // It should ideally communicate with the backend API.
    // For now, we'll simulate the call and log the data.
    console.log('Submitting vendor registration data:', data);
    try {
      await registerVendor(data);
      // On successful registration, navigate to the dashboard or a success page
      // For now, we'll just log success
      console.log('Vendor registered successfully (simulated).');
      // In a real app, you would navigate:
      // navigate('/vendor/dashboard');
    } catch (error: any) {
      console.error('Registration failed:', error.message);
      // Handle and display error message to the user
    }
  };

  return (
    <div>
      <h1>Become a Vendor</h1>
      <p>Please fill out the form below to register your store.</p>
      <VendorRegistrationForm onSubmit={handleRegistrationSubmit} />
    </div>
  );
};

export default VendorRegistrationPage;
