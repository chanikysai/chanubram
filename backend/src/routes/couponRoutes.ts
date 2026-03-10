import { Router } from 'express';
import { Request, Response } from 'express';
import db from '../db'; // Assuming db connection is exported from ../db

const router = Router();

// POST /api/coupons - Create a new coupon
router.post('/', async (req: Request, res: Response) => {
  const { code, discountType, discountValue, validFrom, validUntil, usageLimit } = req.body;

  // Basic validation
  if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
    return res.status(400).json({ message: 'Missing required coupon fields.' });
  }
  if (discountValue <= 0) {
    return res.status(400).json({ message: 'Discount value must be positive.' });
  }
  if (new Date(validFrom) > new Date(validUntil)) {
    return res.status(400).json({ message: 'Valid from date cannot be after valid until date.' });
  }
  if (usageLimit !== undefined && usageLimit < 0) {
    return res.status(400).json({ message: 'Usage limit cannot be negative.' });
  }

  try {
    const existingCoupon = await db.query('SELECT id FROM coupons WHERE code = $1', [code]);
    if (existingCoupon.rows.length > 0) {
      return res.status(409).json({ message: 'Coupon code already exists.' });
    }

    const result = await db.query(
      `INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, usage_limit)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, code, discount_type, discount_value, valid_from, valid_until, usage_limit`,
      [code, discountType, discountValue, validFrom, validUntil, usageLimit]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating coupon:', err);
    res.status(500).json({ message: 'Internal server error while creating coupon.' });
  }
});

// POST /api/coupons/apply - Apply a coupon to an order (simulated)
// In a real app, this would likely involve cart/order context.
// For simplicity, it validates the coupon and returns potential discount details.
router.post('/apply', async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Coupon code is required.' });
  }

  try {
    const now = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    const couponResult = await db.query(
      `SELECT * FROM coupons
       WHERE code = $1
       AND valid_from <= $2
       AND valid_until >= $2`,
      [code, now]
    );

    if (couponResult.rows.length === 0) {
      return res.status(404).json({ message: 'Coupon not found or expired.' });
    }

    const coupon = couponResult.rows[0];

    // TODO: Add logic to check usage limit if implemented (requires tracking applied coupons per order/user)
    // For now, we assume it's valid if found and within date range.

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      // This calculation assumes an order total is available.
      // For this endpoint, we'll just return the percentage value.
      // A more complete implementation would need the order total passed in.
      discountAmount = coupon.discount_value; // Representing percentage here
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = coupon.discount_value;
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      discountAmount: discountAmount, // This might be a percentage or fixed amount
      discountType: coupon.discount_type,
      couponDetails: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        validFrom: coupon.valid_from,
        validUntil: coupon.valid_until,
        usageLimit: coupon.usage_limit,
      },
    });

  } catch (err) {
    console.error('Error applying coupon:', err);
    res.status(500).json({ message: 'Internal server error while applying coupon.' });
  }
});

export default router;
