// Assuming a base URL for API calls
const API_BASE_URL = '/api'; // Replace with your actual API base URL

// Import interfaces from the component file or a shared types file
import { VendorRegistrationData } from '../components/VendorRegistrationForm';

// Define the Vendor interface based on the database schema and expected API response
export interface Vendor {
  id: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  contactPerson: string;
  address: string; // From updated schema
  businessDescription: string; // From updated schema
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Interface for vendor application data that might be edited
// This could be a subset or specific fields relevant for updates
export interface VendorApplicationUpdateData {
  businessName?: string;
  email?: string;
  phoneNumber?: string;
  contactPerson?: string;
  address?: string;
  businessDescription?: string;
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
        errorData = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse error response JSON:', jsonError);
        errorData.message = 'Failed to register vendor due to an unknown server error.';
      }
      throw new Error(errorData.message);
    }

    const vendor: Vendor = await response.json();
    return vendor;
  } catch (error: any) {
    console.error('Error in registerVendor API call:', error);
    throw error;
  }
};

export const getCurrentVendor = async (): Promise<Vendor | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vendors/me`);
    if (response.status === 404) {
      return null;
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
  console.warn('fetchVendorById is not fully implemented. This is a stub.');
  throw new Error('fetchVendorById is not implemented.');
};

export const updateVendorApplication = async (
  vendorId: string,
  data: VendorApplicationUpdateData // Use the specific update interface
): Promise<Vendor> => {
  console.warn('updateVendorApplication is not fully implemented. This is a stub.');
  throw new Error('updateVendorApplication is not implemented.');
};

// Admin functions
export const approveVendor = async (vendorId: string): Promise<Vendor> => {
  console.warn('approveVendor is not fully implemented. This is a stub.');
  throw new Error('approveVendor is not implemented.');
};

export const rejectVendor = async (vendorId: string, reason: string): Promise<Vendor> => {
  console.warn('rejectVendor is not fully implemented. This is a stub.');
  throw new Error('rejectVendor is not implemented.');
};
