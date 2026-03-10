-- migration_xxxx_create_vendors_table.sql
-- Create the vendors table for the vendor registration feature.
-- This table will store information about registered third-party sellers.

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    contact_person VARCHAR(255),
    address TEXT, -- Added address field
    business_description TEXT, -- Added business_description field
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors (email);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors (status);
