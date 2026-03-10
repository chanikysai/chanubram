import { registerVendor, Vendor, ApiError, getCurrentVendor, fetchVendorById, updateVendorApplication, approveVendor, rejectVendor, VendorApplicationData } from '../services/vendorApi'; // Adjusted import path

// Mock the vendor API
jest.mock('../services/vendorApi');
// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Cast mocks to their specific types
const mockGetCurrentVendor = getCurrentVendor as jest.Mock;
const mockRegisterVendor = registerVendor as jest.Mock;
const mockFetchVendorById = fetchVendorById as jest.Mock;
const mockUpdateVendorApplication = updateVendorApplication as jest.Mock;
const mockApproveVendor = approveVendor as jest.Mock;
const mockRejectVendor = rejectVendor as jest.Mock;
const mockUseNavigate = 'mockNavigate' as any; // Mock the useNavigate return value

describe('vendorApi', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Set up mock for useNavigate (though not directly used in service tests)
    (require('react-router-dom').useNavigate as jest.Mock).mockReturnValue(mockUseNavigate);
  });

  // Test for registerVendor (already covered by component tests, but good to have service-level)
  test('registerVendor should handle successful registration', async () => {
    const mockVendorData: VendorRegistrationData = {
      businessName: 'Test Biz', email: 'test@example.com', phoneNumber: '123-456-7890', contactPerson: 'Test Person',
    };
    const mockVendorResponse: Vendor = {
      id: 'vendor-1', businessName: 'Test Biz', email: 'test@example.com', phoneNumber: '123-456-7890', contactPerson: 'Test Person', status: 'pending', createdAt: new Date().toISOString(),
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true, json: async () => mockVendorResponse,
    });

    const result = await registerVendor(mockVendorData);

    expect(global.fetch).toHaveBeenCalledWith('/api/vendors/register', expect.anything());
    expect(result).toEqual(mockVendorResponse);
  });

  test('registerVendor should throw an error on failed registration', async () => {
    const mockVendorData: VendorRegistrationData = {
      businessName: 'Test Biz', email: 'test@example.com', phoneNumber: '123-456-7890', contactPerson: 'Test Person',
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Email already in use' }),
    });

    await expect(registerVendor(mockVendorData)).rejects.toThrow('Email already in use');
    expect(global.fetch).toHaveBeenCalledWith('/api/vendors/register', expect.anything());
  });

  // Test for getCurrentVendor
  test('getCurrentVendor should return vendor data if logged in', async () => {
    const mockVendor: Vendor = {
      id: 'vendor-current', businessName: 'Current Vendor', email: 'current@example.com', phoneNumber: '111-111-1111', contactPerson: 'User', status: 'approved', createdAt: new Date().toISOString(),
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true, json: async () => mockVendor,
    });

    const result = await getCurrentVendor();

    expect(global.fetch).toHaveBeenCalledWith('/api/vendors/me', expect.anything());
    expect(result).toEqual(mockVendor);
  });

  test('getCurrentVendor should return null if no vendor is logged in', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 404, json: async () => ({}),
    });

    const result = await getCurrentVendor();

    expect(global.fetch).toHaveBeenCalledWith('/api/vendors/me', expect.anything());
    expect(result).toBeNull();
  });

  test('getCurrentVendor should throw an error if fetching fails', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false, json: async () => ({ message: 'Server error' }),
    });

    await expect(getCurrentVendor()).rejects.toThrow('Server error');
    expect(global.fetch).toHaveBeenCalledWith('/api/vendors/me', expect.anything());
  });

  // Tests for new stubbed functions (should throw unimplemented errors)
  test('fetchVendorById should throw unimplemented error', async () => {
    await expect(fetchVendorById('some-id')).rejects.toThrow('is not implemented.');
  });

  test('updateVendorApplication should throw unimplemented error', async () => {
    const data: VendorApplicationData = { businessName: 'New Name' };
    await expect(updateVendorApplication('some-id', data)).rejects.toThrow('is not implemented.');
  });

  test('approveVendor should throw unimplemented error', async () => {
    await expect(approveVendor('some-id')).rejects.toThrow('is not implemented.');
  });

  test('rejectVendor should throw unimplemented error', async () => {
    await expect(rejectVendor('some-id', 'Bad reason')).rejects.toThrow('is not implemented.');
  });
});
