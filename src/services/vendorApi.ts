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
  // Add other vendor properties as needed
}

// Interface for vendor application data that might be edited
export interface VendorApplicationData {
  businessName?: string;
  email?: string;
  phoneNumber?: string;
  contactPerson?: string;
}

// Interface for admin approval/rejection payloads
export interface AdminVendorActionPayload {
  vendorId: string;
  reason?: string; // For rejection
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
        // Attempt to parse error response JSON for a more specific message
        errorData = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse error response JSON:', jsonError);
        // Fallback message if JSON parsing fails
        errorData.message = 'Failed to register vendor due to an unknown server error.';
      }
      throw new Error(errorData.message);
    }

    const vendor: Vendor = await response.json();
    return vendor;
  } catch (error: any) {
    console.error('Error in registerVendor API call:', error);
    // Re-throw the error to be caught by the caller
    throw error;
  }
};

export const getCurrentVendor = async (): Promise<Vendor | null> => {
  // In a real app, this would check auth tokens and fetch the logged-in vendor from an API endpoint
  // This mock implementation assumes the existence of an endpoint like '/api/vendors/me'
  try {
    const response = await fetch(`${API_BASE_URL}/vendors/me`); // Assume this endpoint gets the current logged-in vendor
    if (response.status === 404) {
      return null; // No vendor logged in or found
    }
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || 'Failed to fetch current vendor');
    }
    const vendor: Vendor = await response.json();
    return vendor;
  } catch (error: any) {
    console.error('Error fetching current vendor:', error);
    throw error;
  }
};

export const fetchVendorById = async (vendorId: string): Promise<Vendor> => {
  // Placeholder for fetching a specific vendor by ID (e.g., for admin view)
  console.warn('fetchVendorById is not fully implemented. This is a stub.');
  throw new Error('fetchVendorById is not implemented.');
};

export const updateVendorApplication = async (
  vendorId: string,
  data: VendorApplicationData
): Promise<Vendor> => {
  // Placeholder for updating a vendor's application details
  console.warn('updateVendorApplication is not fully implemented. This is a stub.');
  throw new Error('updateVendorApplication is not implemented.');
};

// Admin functions (Backend/API simulation)
export const approveVendor = async (vendorId: string): Promise<Vendor> => {
  // Simulates an admin approving a vendor application via an API call
  console.warn('approveVendor is not fully implemented. This is a stub.');
  // In a real backend, this would update the vendor's status to 'approved'
  throw new Error('approveVendor is not implemented.');
};

export const rejectVendor = async (vendorId: string, reason: string): Promise<Vendor> => {
  // Simulates an admin rejecting a vendor application via an API call
  console.warn('rejectVendor is not fully implemented. This is a stub.');
  // In a real backend, this would update the vendor's status to 'rejected' and optionally store a reason
  throw new Error('rejectVendor is not implemented.');
};
