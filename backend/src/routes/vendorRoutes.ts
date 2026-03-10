// backend/src/routes/vendorRoutes.ts
import { Router } from 'express';
import pool from '../db'; // Import the database connection pool
import { VendorRegistrationData } from '../services/vendorApi'; // Import frontend data structure
import { Vendor } from '../services/vendorApi'; // Import Vendor type for response

const router = Router();

// Helper function for basic server-side validation
const validateVendorData = (data: VendorRegistrationData): string | null => {
  if (!data.businessName) return 'Business name is required.';
  if (!data.email) return 'Email is required.';
  if (!/\S+@\S+\.\S+/.test(data.email)) return 'Invalid email format.';
  if (!data.phoneNumber) return 'Phone number is required.';
  if (!/^\d{3}-\d{3}-\d{4}$/.test(data.phoneNumber)) return 'Invalid phone number format (e.g., 123-456-7890).';
  if (!data.contactPerson) return 'Contact person is required.';
  if (!data.address) return 'Address is required.';
  if (!data.businessDescription) return 'Business description is required.';
  return null; // No validation errors
};

// POST /api/vendors/register endpoint
router.post('/register', async (req, res) => {
  const vendorData: VendorRegistrationData = req.body;

  const validationError = validateVendorData(vendorData);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    // Check if email already exists
    const existingVendor = await pool.query('SELECT id FROM vendors WHERE email = $1', [vendorData.email]);
    if (existingVendor.rows.length > 0) {
      return res.status(409).json({ message: 'Email address already in use.' });
    }

    // Insert new vendor into the database
    const queryText = `
      INSERT INTO vendors (business_name, email, phone_number, contact_person, address, business_description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, business_name, email, phone_number, contact_person, address, business_description, status, created_at
    `;
    const queryValues = [
      vendorData.businessName,
      vendorData.email,
      vendorData.phoneNumber,
      vendorData.contactPerson,
      vendorData.address,
      vendorData.businessDescription,
      'pending', // New vendors start with 'pending' status
    ];

    const result = await pool.query(queryText, queryValues);
    const newVendor: Vendor = result.rows[0];

    res.status(201).json(newVendor);

  } catch (error: any) {
    console.error('Error during vendor registration:', error);
    // Handle database errors
    if (error.code === '23505') { // Unique violation error code for email
      return res.status(409).json({ message: 'Email address already in use.' });
    }
    res.status(500).json({ message: 'Failed to register vendor due to a server error.' });
  }
});

// GET /api/vendors/me endpoint
router.get('/me', async (req, res) => {
  console.log('Received request for current vendor.');
  // In a real backend:
  // 1. Authenticate user (e.g., via JWT token from Authorization header).
  // 2. Extract user ID from token.
  // 3. Query the database for the vendor with that ID.
  // 4. Return vendor details or 404 if not found.

  // For now, simulating no vendor logged in, as per previous implementation.
  // If authentication was implemented, it might look like this:
  /*
  try {
    // Assume authentication middleware populates req.user with { id: 'vendor-uuid' }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }
    const vendorId = req.user.id;
    const result = await pool.query('SELECT * FROM vendors WHERE id = $1', [vendorId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching current vendor:', error);
    res.status(500).json({ message: 'Failed to fetch vendor data.' });
  }
  */

  // Default: Simulate no vendor logged in
  res.status(404).json({ message: 'No vendor logged in.' });
});


// Admin functions - Stubs for now, as per previous step
router.post('/admin/approve/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  console.log(`Received request to approve vendor ${vendorId}`);
  res.status(501).json({ message: 'Admin approve vendor endpoint not implemented.' });
});

router.post('/admin/reject/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  const { reason } = req.body;
  console.log(`Received request to reject vendor ${vendorId} with reason: ${reason}`);
  res.status(501).json({ message: 'Admin reject vendor endpoint not implemented.' });
});

// Vendor update function - Stub for now
router.put('/vendors/:vendorId', async (req, res) => {
  const { vendorId } = req.params;
  const updateData = req.body;
  console.log(`Received request to update vendor ${vendorId} application:`, updateData);
  // In a real backend:
  // 1. Authenticate user (check if it's the vendor or an admin).
  // 2. Validate update data.
  // 3. Update vendor details in DB.
  // 4. Potentially reset status to 'pending' if vendor re-submits after rejection.
  res.status(501).json({ message: 'Vendor update application endpoint not implemented.' });
});

export default router;
