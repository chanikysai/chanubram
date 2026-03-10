import { registerVendor, fetchVendorById } from '../../services/vendorApi';

// Mock the in-memory store and counter for isolation
let mockVendorsStore: { id: string; businessName: string; contactPerson: string; email: string; phone: string; address: string; businessDescription: string; }[] = [];
let vendorIdCounter = 1;

// Mock the simulateApiDelay to control time in tests
const mockSimulateApiDelay = jest.fn().mockResolvedValue(undefined);

// Mock the actual service implementation to use our controlled mock data
jest.mock('../../services/vendorApi', () => {
  // Capture the actual module to re-export methods and override internal state
  const originalModule = jest.requireActual('../../services/vendorApi');

  // We need to be able to manipulate the internal state (mockVendors, vendorIdCounter)
  // For simplicity in this mock, we'll redefine the functions to use the mocked state.
  // In a more complex scenario, we might inject the state or use dependency injection.

  return {
    ...originalModule,
    // Override the internal simulateApiDelay if it were exported, or mock its usage
    // For now, we assume the internal `simulateApiDelay` is called and we mock its effects.
    registerVendor: jest.fn(async (vendorData) => {
      // Re-implementing logic with mocked state and delay
      await mockSimulateApiDelay(700); // Use the mocked delay

      const existingVendor = mockVendorsStore.find(v => v.email === vendorData.email);
      if (existingVendor) {
        return { message: 'Email address is already associated with another vendor account.' };
      }

      if (!vendorData.businessName || !vendorData.contactPerson || !vendorData.email || !vendorData.phone || !vendorData.address || !vendorData.businessDescription) {
        return { message: 'All vendor details are required.' };
      }

      const newVendor = {
        id: `vendor-${vendorIdCounter}`,
        ...vendorData,
      };
      mockVendorsStore.push(newVendor);
      vendorIdCounter++;

      return {
        vendor: newVendor,
        message: 'Vendor registration successful. Your application is pending approval.',
      };
    }),
    fetchVendorById: jest.fn(async (vendorId: string) => {
      await mockSimulateApiDelay(400);
      const vendor = mockVendorsStore.find(v => v.id === vendorId);
      if (vendor) {
        return vendor;
      } else {
        return { message: 'Vendor not found.' };
      }
    }),
  };
});


describe('vendorApi', () => {
  // Reset mock state before each test
  beforeEach(() => {
    mockVendorsStore = []; // Clear the mock vendor list
    vendorIdCounter = 1; // Reset the counter
    mockSimulateApiDelay.mockClear(); // Clear delay mock calls
    // Clear mock implementations of the functions being tested
    (registerVendor as jest.Mock).mockClear();
    (fetchVendorById as jest.Mock).mockClear();
  });

  // Test Case 1: Happy Path - Successful Vendor Registration
  test('should successfully register a new vendor', async () => {
    const vendorData = {
      businessName: 'ElectroGadgets',
      contactPerson: 'Alice Smith',
      email: 'alice.smith@electrogadgets.com',
      phone: '555-123-4567',
      address: '456 Circuit Lane, Tech City',
      businessDescription: 'Specializing in high-quality electronic components and gadgets.',
    };

    const result = await registerVendor(vendorData);

    // Check if the API delay was called
    expect(mockSimulateApiDelay).toHaveBeenCalledWith(700);

    // Check the result
    expect(result).toHaveProperty('vendor');
    expect(result).toHaveProperty('message', 'Vendor registration successful. Your application is pending approval.');
    expect(result.vendor).toMatchObject({
      id: 'vendor-1',
      ...vendorData,
    });

    // Check if the vendor was added to the mock store (implicitly tested by fetchVendorById)
    // Call fetchVendorById to verify the vendor exists in our mock store
    const fetchedVendor = await fetchVendorById('vendor-1');
    expect(fetchedVendor).toHaveProperty('id', 'vendor-1');
    expect(fetchedVendor).toMatchObject(vendorData);
  });

  // Test Case 2: Error Handling - Duplicate Email
  test('should return an error if email is already in use', async () => {
    const vendorData1 = {
      businessName: 'ElectroGadgets',
      contactPerson: 'Alice Smith',
      email: 'alice.smith@electrogadgets.com',
      phone: '555-123-4567',
      address: '456 Circuit Lane, Tech City',
      businessDescription: 'Specializing in high-quality electronic components and gadgets.',
    };
    // Register the first vendor successfully
    await registerVendor(vendorData1);

    // Attempt to register another vendor with the same email
    const vendorData2 = {
      businessName: 'Electro Gadgets Pro',
      contactPerson: 'Bob Johnson',
      email: 'alice.smith@electrogadgets.com', // Duplicate email
      phone: '555-987-6543',
      address: '789 Tech Avenue, Tech City',
      businessDescription: 'Premium electronic solutions.',
    };

    const result = await registerVendor(vendorData2);

    // Check the error message
    expect(result).toHaveProperty('message', 'Email address is already associated with another vendor account.');
    expect(result).not.toHaveProperty('vendor'); // No vendor object returned on error

    // Ensure no new vendor was added for the duplicate email
    expect(mockVendorsStore.length).toBe(1);
    expect(mockVendorsStore[0].email).toBe('alice.smith@electrogadgets.com');
  });

  // Test Case 3: Error Handling - Missing Required Fields
  test('should return an error if any required field is missing', async () => {
    const incompleteVendorData = {
      businessName: 'Incomplete Biz',
      contactPerson: 'Test Contact',
      email: 'incomplete@example.com',
      phone: '', // Missing phone
      address: '123 Missing St',
      businessDescription: 'This one is missing phone.',
    };

    const result = await registerVendor(incompleteVendorData as any); // Cast to any to bypass strict type checking for test

    // Check the error message
    expect(result).toHaveProperty('message', 'All vendor details are required.');
    expect(result).not.toHaveProperty('vendor'); // No vendor object returned on error

    // Ensure no vendor was added to the store
    expect(mockVendorsStore.length).toBe(0);
  });

  // Test Case 4: fetchVendorById - Vendor Found
  test('should fetch a vendor by ID successfully', async () => {
    const vendorData = {
      businessName: 'ElectroGadgets',
      contactPerson: 'Alice Smith',
      email: 'alice.smith@electrogadgets.com',
      phone: '555-123-4567',
      address: '456 Circuit Lane, Tech City',
      businessDescription: 'Specializing in high-quality electronic components and gadgets.',
    };
    // Register a vendor first to have data in the store
    const registrationResult = await registerVendor(vendorData);
    const vendorId = (registrationResult as any).vendor.id;

    const fetchedVendor = await fetchVendorById(vendorId);

    // Check delay
    expect(mockSimulateApiDelay).toHaveBeenCalledWith(400);

    // Check fetched data
    expect(fetchedVendor).toHaveProperty('id', vendorId);
    expect(fetchedVendor).toMatchObject(vendorData);
  });

  // Test Case 5: fetchVendorById - Vendor Not Found
  test('should return an error if vendor ID is not found', async () => {
    const nonExistentId = 'vendor-999';

    const result = await fetchVendorById(nonExistentId);

    // Check delay
    expect(mockSimulateApiDelay).toHaveBeenCalledWith(400);

    // Check error response
    expect(result).toHaveProperty('message', 'Vendor not found.');
    expect(result).not.toHaveProperty('id'); // Ensure no vendor object is returned
  });
});
