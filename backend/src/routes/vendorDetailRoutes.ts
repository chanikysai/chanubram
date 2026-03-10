// backend/src/routes/vendorDetailRoutes.ts
import { Router, Request, Response } from 'express';
import pool from '../db';
import redisClient from '../config/redisClient';
import { Vendor } from '../services/vendorApi'; // Assuming Vendor type is defined in services

const router = Router();
const VENDOR_CACHE_PREFIX = 'vendor:';
const CACHE_EXPIRATION_SECONDS = 3600; // Cache for 1 hour

// GET /api/vendors/:vendorId endpoint with caching
router.get('/:vendorId', async (req: Request, res: Response) => {
  const { vendorId } = req.params;
  const cacheKey = `${VENDOR_CACHE_PREFIX}${vendorId}`;

  try {
    // 1. Check Redis cache first
    const cachedVendor = await redisClient.get(cacheKey);
    if (cachedVendor) {
      console.log(`Cache hit for vendor ID: ${vendorId}`);
      return res.status(200).json(JSON.parse(cachedVendor));
    }
    console.log(`Cache miss for vendor ID: ${vendorId}`);

    // 2. If not in cache, fetch from database
    const queryText = 'SELECT * FROM vendors WHERE id = $1';
    const result = await pool.query(queryText, [vendorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    const vendor: Vendor = result.rows[0];

    // 3. Store in Redis cache with an expiration time
    await redisClient.setEx(cacheKey, CACHE_EXPIRATION_SECONDS, JSON.stringify(vendor));

    // 4. Return the vendor data
    res.status(200).json(vendor);

  } catch (error: any) {
    console.error(`Error fetching vendor ${vendorId}:`, error);
    res.status(500).json({ message: 'Failed to fetch vendor details due to a server error.' });
  }
});

export default router;
