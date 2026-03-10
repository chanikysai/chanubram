// Placeholder for vendor payout API functions.
// In a real application, these would interact with a backend API.

export interface Payout {
  id: string;
  vendorId: string;
  vendorName: string;
  totalSales: number;
  commissionRate: number;
  commissionAmount: number;
  payoutAmount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  createdAt: string;
  paidAt?: string | null;
}

// Mock data for vendor payouts
const mockPayouts: Payout[] = [
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
    status: 'processing',
    createdAt: '2026-03-09T09:00:00Z',
    paidAt: null,
  },
];

// Simulate fetching all payouts
export const fetchPayouts = async (): Promise<Payout[]> => {
  console.log('Fetching all payouts...');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPayouts;
};

// Simulate fetching payouts for a specific vendor
export const fetchPayoutsByVendor = async (vendorId: string): Promise<Payout[]> => {
  console.log(`Fetching payouts for vendor: ${vendorId}...`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPayouts.filter(payout => payout.vendorId === vendorId);
};

// Simulate generating a payout report
export const generatePayoutReport = async (startDate: string, endDate: string): Promise<string> => {
  console.log(`Generating payout report from ${startDate} to ${endDate}...`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real scenario, this would generate a CSV or PDF
  return `Report for ${startDate} - ${endDate}. Generated successfully.`;
};

// Simulate processing a payout
export const processPayout = async (payoutId: string): Promise<Payout> => {
  console.log(`Processing payout with ID: ${payoutId}...`);
  await new Promise(resolve => setTimeout(resolve, 800));
  const payoutIndex = mockPayouts.findIndex(p => p.id === payoutId);
  if (payoutIndex === -1) {
    throw new Error(`Payout with ID ${payoutId} not found.`);
  }
  // Update status to 'paid'
  mockPayouts[payoutIndex].status = 'paid';
  mockPayouts[payoutIndex].paidAt = new Date().toISOString();
  return mockPayouts[payoutIndex];
};

// Simulate creating a new payout (e.g., for manual adjustment or initial setup)
export const createPayout = async (newPayoutData: Omit<Payout, 'id' | 'createdAt' | 'paidAt'>): Promise<Payout> => {
  console.log('Creating new payout...');
  await new Promise(resolve => setTimeout(resolve, 600));
  const newPayout: Payout = {
    ...newPayoutData,
    id: `payout-${Date.now()}`,
    createdAt: new Date().toISOString(),
    paidAt: null, // Default to null
  };
  mockPayouts.push(newPayout);
  return newPayout;
};
