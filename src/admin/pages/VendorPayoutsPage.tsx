import React, { useState, useEffect } from 'react';
import { fetchPayouts, processPayout, Payout } from '../services/payoutsApi';
import './VendorPayoutsPage.css'; // Assuming a CSS file for styling

const VendorPayoutsPage: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayouts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPayouts();
        setPayouts(data);
      } catch (err) {
        console.error('Failed to fetch payouts:', err);
        setError('Error loading payouts.');
      } finally {
        setLoading(false);
      }
    };
    loadPayouts();
  }, []);

  const handleProcessPayout = async (payoutId: string) => {
    try {
      // Optimistically update UI or show a loading indicator for this specific payout
      setPayouts(payouts.map(p =>
        p.id === payoutId ? { ...p, status: 'processing' as const } : p
      ));

      const updatedPayout = await processPayout(payoutId);

      setPayouts(payouts.map(p =>
        p.id === payoutId ? updatedPayout : p
      ));
      // Optionally show a success notification
    } catch (err) {
      console.error(`Failed to process payout ${payoutId}:`, err);
      setError('Error processing payout.');
      // Revert status if processing failed
      setPayouts(payouts.map(p =>
        p.id === payoutId ? { ...p, status: 'pending' } : p // Revert to pending or original status
      ));
    }
  };

  if (loading) {
    return <div>Loading payouts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="vendor-payouts-page">
      <h1>Vendor Payouts</h1>
      {payouts.length === 0 ? (
        <p>No payouts found.</p>
      ) : (
        <table className="payouts-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Total Sales</th>
              <th>Commission Rate</th>
              <th>Commission Amount</th>
              <th>Payout Amount</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Paid At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr key={payout.id}>
                <td>{payout.vendorName}</td>
                <td>${payout.totalSales.toFixed(2)}</td>
                <td>{(payout.commissionRate * 100).toFixed(2)}%</td>
                <td>${payout.commissionAmount.toFixed(2)}</td>
                <td>${payout.payoutAmount.toFixed(2)}</td>
                <td>{payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}</td>
                <td>{new Date(payout.createdAt).toLocaleDateString()}</td>
                <td>{payout.paidAt ? new Date(payout.paidAt).toLocaleDateString() : '-'}</td>
                <td>
                  {payout.status === 'pending' && (
                    <button
                      onClick={() => handleProcessPayout(payout.id)}
                      disabled={payout.status === 'processing'}
                    >
                      {payout.status === 'processing' ? 'Processing...' : 'Process'}
                    </button>
                  )}
                  {payout.status === 'paid' && (
                    <span>Paid</span>
                  )}
                  {payout.status === 'failed' && (
                    <span className="status-failed">Failed</span>
                  )}
                  {/* Add more actions if needed, e.g., 'View Details', 'Generate Report' */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VendorPayoutsPage;
