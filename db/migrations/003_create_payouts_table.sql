-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create the vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Create the payouts table
CREATE TABLE IF NOT EXISTS payouts (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    total_sales REAL NOT NULL CHECK (total_sales >= 0),
    commission_rate REAL NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 1),
    commission_amount REAL NOT NULL CHECK (commission_amount >= 0),
    payout_amount REAL NOT NULL CHECK (payout_amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Create the commissions table (optional, could be calculated on the fly or stored)
-- For now, let's assume commission is calculated based on sales and stored in payouts.
-- If more complex commission rules are needed, a separate table might be beneficial.

-- Example: Add some initial data (optional, for testing)
INSERT INTO vendors (id, name, email) VALUES
('vendor-abc', 'ElectroGadgets Inc.', 'contact@electrogadgets.com'),
('vendor-def', 'CozyHome Decor', 'sales@cozyhome.com'),
('vendor-ghi', 'Adventure Gear Co.', 'support@adventuregear.com');

INSERT INTO payouts (id, vendor_id, total_sales, commission_rate, commission_amount, payout_amount, status, created_at, paid_at) VALUES
('payout-001', 'vendor-abc', 1500.50, 0.10, 150.05, 1350.45, 'paid', '2026-03-01T10:00:00Z', '2026-03-05T14:30:00Z'),
('payout-002', 'vendor-def', 875.20, 0.12, 105.02, 770.18, 'pending', '2026-03-08T11:00:00Z', NULL),
('payout-003', 'vendor-ghi', 2300.00, 0.08, 184.00, 2116.00, 'processing', '2026-03-09T09:00:00Z', NULL);
