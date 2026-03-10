-- migration_xxxx_create_products_table.sql
-- Create the products table for the marketplace.
-- This table will store details about products listed by vendors.

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL, -- Foreign key to the vendors table
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL, -- Price with 2 decimal places
    inventory INTEGER NOT NULL DEFAULT 0, -- Stock count
    image_url VARCHAR(255), -- URL for the product image
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- e.g., 'available', 'out_of_stock', 'discontinued'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Define the foreign key constraint
    FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE
);

-- Add indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products (vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
