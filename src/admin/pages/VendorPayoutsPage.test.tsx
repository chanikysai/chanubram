import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorPayoutsPage from './VendorPayoutsPage';
import * as payoutsApi from '../services/payoutsApi';

// Mock the API calls
jest.mock('../services/payoutsApi');

// Define mock data
const mockPayouts = [
  {
    id: 'payout-001',
    vendorId: 'vendor-abc',
    vendorName: 'ElectroGadgets Inc.',
    totalSales: 1500.50,
    commissionRate: 0.10,
    commissionAmount: 150.05,
    payoutAmount: 1350.45,
    status: 'paid',
    createdAt: '2026-03-01T10:00:00Z',
    paidAt: '2026-03-05T14:30:00Z',
  },
  {
    id: 'payout-002',
    vendorId: 'vendor-def',
    vendorName: 'CozyHome Decor',
    totalSales: 875.20,
    commissionRate: 0.12,
    commissionAmount: 105.02,
    payoutAmount: 770.18,
    status: 'pending',
    createdAt: '2026-03-08T11:00:00Z',
    paidAt: null,
  },
  {
    id: 'payout-003',
    vendorId: 'vendor-ghi',
    vendorName: 'Adventure Gear Co.',
    totalSales: 2300.00,
    commissionRate: 0.08,
    commissionAmount: 184.00,
    payoutAmount: 2116.00,
    status: 'processing', // Simulate a payout already in processing
    createdAt: '2026-03-09T09:00:00Z',
    paidAt: null,
  },
];

// Mock the fetchPayouts function from payoutsApi
const mockFetchPayouts = jest.spyOn(payoutsApi, 'fetchPayouts');
mockFetchPayouts.mockResolvedValue(mockPayouts);

// Mock the processPayout function
const mockProcessPayout = jest.spyOn(payoutsApi, 'processPayout');

describe('VendorPayoutsPage', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    mockFetchPayouts.mockClear();
    mockProcessPayout.mockClear();
    // Reset mock implementation for fetchPayouts for each test
    mockFetchPayouts.mockResolvedValue(mockPayouts);
  });

  // Happy Path: Renders the page and displays payouts
  test('should render the page and display a list of payouts correctly', async () => {
    render(<VendorPayoutsPage />);

    // Wait for the mock API call to resolve and update the UI
    await waitFor(() => expect(mockFetchPayouts).toHaveBeenCalledTimes(1));

    // Check for presence of vendor names and amounts
    await screen.findByText('ElectroGadgets Inc.');
    await screen.findByText('CozyHome Decor');
    await screen.findByText('Adventure Gear Co.');

    await screen.findByText('1350.45'); // Payout amount for ElectroGadgets
    await screen.findByText('770.18'); // Payout amount for CozyHome Decor
    await screen.findByText('2116.00'); // Payout amount for Adventure Gear Co.

    // Check for status
    await screen.findByText('Paid');
    await screen.findByText('Pending');
    await screen.findByText('Processing'); // Check for status 'Processing'
  });

  // Edge Case: No payouts available
  test('should display a message when no payouts are available', async () => {
    mockFetchPayouts.mockResolvedValue([]); // Simulate an empty payout list
    render(<VendorPayoutsPage />);

    // Wait for the message to appear
    await waitFor(() => expect(mockFetchPayouts).toHaveBeenCalledTimes(1));
    await screen.findByText('No payouts found.');
  });

  // Error Handling: API fails to fetch payouts
  test('should display an error message if fetching payouts fails', async () => {
    mockFetchPayouts.mockRejectedValue(new Error('API is down'));
    render(<VendorPayoutsPage />);

    // Wait for the error message to appear
    await waitFor(() => expect(mockFetchPayouts).toHaveBeenCalledTimes(1));
    await screen.findByText('Error loading payouts.');
  });

  // Interaction: Process a pending payout
  test('should allow processing a pending payout and update its status to Paid', async () => {
    // Ensure mockPayouts has a pending payout for this test
    const initialPayouts = [
      { ...mockPayouts[1], status: 'pending' }, // Ensure CozyHome Decor is pending
      { ...mockPayouts[0], status: 'paid' }
    ];
    mockFetchPayouts.mockResolvedValue(initialPayouts);

    render(<VendorPayoutsPage />);

    // Wait for the initial render and data load
    await waitFor(() => expect(mockFetchPayouts).toHaveBeenCalledTimes(1));

    // Find the 'Process' button for the 'Pending' payout (CozyHome Decor)
    const pendingPayoutRow = await screen.findByText('CozyHome Decor');
    const processButton = pendingPayoutRow.closest('tr')?.querySelector('button');

    expect(processButton).toBeInTheDocument();
    expect(processButton).toHaveTextContent('Process');

    // Mock the processPayout to return an updated payout
    const updatedPayout = {
      ...initialPayouts[0], // CozyHome Decor payout
      status: 'paid',
      paidAt: new Date().toISOString(),
    };
    mockProcessPayout.mockResolvedValue(updatedPayout);

    // Click the process button
    fireEvent.click(processButton!);

    // Wait for the UI to update and processPayout to be called
    await waitFor(() => expect(mockProcessPayout).toHaveBeenCalledWith('payout-002'));

    // Check if the status is updated to 'Paid' and paidAt is displayed
    const updatedRow = await screen.findByText('CozyHome Decor').closest('tr');
    expect(updatedRow).toHaveTextContent('Paid');
    expect(updatedRow).toHaveTextContent(new Date(updatedPayout.paidAt!).toLocaleDateString());
  });

  // Edge Case: Trying to process an already processing or paid payout
  test('should disable process button for non-pending payouts', async () => {
    render(<VendorPayoutsPage />);
    await waitFor(() => expect(mockFetchPayouts).toHaveBeenCalledTimes(1));

    // Find the row for 'ElectroGadgets Inc.' (status: Paid)
    const paidPayoutRow = await screen.findByText('ElectroGadgets Inc.').closest('tr');
    const paidProcessButton = paidPayoutRow?.querySelector('button');
    expect(paidProcessButton).not.toBeInTheDocument(); // No button for 'Paid' status

    // Find the row for 'Adventure Gear Co.' (status: Processing)
    const processingPayoutRow = await screen.findByText('Adventure Gear Co.').closest('tr');
    const processingProcessButton = processingPayoutRow?.querySelector('button');
    expect(processingProcessButton).toBeInTheDocument();
    expect(processingProcessButton).toHaveTextContent('Processing...');
    expect(processingProcessButton).toBeDisabled();
  });

  // Error Handling: Processing a payout fails
  test('should display an error message and revert status if processing a payout fails', async () => {
    // Ensure mockPayouts has a pending payout for this test
    const initialPayouts = [
      { ...mockPayouts[1], status: 'pending' }, // Ensure CozyHome Decor is pending
    ];
    mockFetchPayouts.mockResolvedValue(initialPayouts);

    mockProcessPayout.mockRejectedValue(new Error('Payment gateway declined'));

    render(<VendorPayoutsPage />);

    await waitFor(() => expect(mockFetchPayouts).toHaveBeenCalledTimes(1));

    // Find the 'Process' button for the 'Pending' payout (CozyHome Decor)
    const pendingPayoutRow = await screen.findByText('CozyHome Decor');
    const processButton = pendingPayoutRow.closest('tr')?.querySelector('button');

    expect(processButton).toBeInTheDocument();

    // Click the process button
    fireEvent.click(processButton!);

    // Wait for the error message to appear
    await waitFor(() => expect(mockProcessPayout).toHaveBeenCalledWith('payout-002'));
    await screen.findByText('Error processing payout.');

    // Check that the status is reverted back to 'Pending'
    const updatedRow = await screen.findByText('CozyHome Decor').closest('tr');
    expect(updatedRow).toHaveTextContent('Pending');
  });
});
