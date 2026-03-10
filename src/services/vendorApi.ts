// Assuming a base URL for API calls
const API_BASE_URL = '/api'; // Replace with your actual API base URL

// Import interfaces from the component file or a shared types file
import { VendorRegistrationData } from '../components/VendorRegistrationForm';

export interface Vendor {
  id: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  contactPerson: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export const registerVendor = async (
  vendorData: VendorRegistrationData
): Promise<Vendor> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vendors/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      let errorData: ApiError = { message: 'An unknown error occurred' };
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // If response.json() fails, use a generic error message
        console.error('Failed to parse error response JSON:', jsonError);
      }
      throw new Error(errorData.message || 'Failed to register vendor');
    }

    const vendor: Vendor = await response.json();
    return vendor;
  } catch (error: any) {
    console.error('Error in registerVendor API call:', error);
    // Re-throw the error to be caught by the caller
    throw error;
  }
};

// Placeholder for other vendor-related API functions
export const fetchVendorById = async (vendorId: string): Promise<Vendor> => {
  const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}`);
  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || `Failed to fetch vendor ${vendorId}`);
  }
  return response.json();
};

export const getCurrentVendor = async (): Promise<Vendor | null> => {
  // In a real app, this would check auth tokens and fetch the logged-in vendor
  // For now, simulating no vendor logged in
  const response = await fetch(`${API_BASE_URL}/vendors/me`); // Assume this endpoint gets the current logged-in vendor
  if (response.status === 404) {
    return null; // No vendor logged in or found
  }
  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'Failed to fetch current vendor');
  }
  return response.json();
};
