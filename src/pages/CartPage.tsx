// src/pages/CartPage.tsx
import React, { useState } from 'react';
import { useCart, CartItem } from '../context/CartContext'; // Import CartItem type
import CartItemComponent from '../components/CartItem'; // Import the newly created component
import CartSummary from '../components/CartSummary';
import CouponInput from '../components/CouponInput'; // Assuming this component exists or will be created if not already
import { CouponApplicationResult } from '../types/coupon'; // Assuming this type exists or will be defined

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem } = useCart();
  const [couponResult, setCouponResult] = useState<CouponApplicationResult | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [isCouponLoading, setIsCouponLoading] = useState<boolean>(false);

  // Calculate subtotal before any potential coupon discount
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calculate the total price, applying the discount if a coupon was successfully applied
  const total = couponResult?.success ? subtotal - (couponResult.discountAmount || 0) : subtotal;

  // Function to handle coupon application logic
  const handleApplyCoupon = async (couponCode: string) => {
    setIsCouponLoading(true);
    setCouponError('');
    setCouponResult(null);

    // Simulate API call for coupon validation
    // In a real application, this would involve an API request.
    console.log(`Attempting to apply coupon: ${couponCode}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    if (couponCode.toLowerCase() === 'sale10') {
      const discountAmount = subtotal * 0.10; // 10% discount
      setCouponResult({
        success: true,
        message: `Applied 10% discount (${discountAmount.toFixed(2)})!`,
        discountAmount: discountAmount,
        couponCode: couponCode,
      });
      console.log('Coupon applied successfully.');
    } else if (couponCode.toLowerCase() === 'freeship') { // Changed to 'freeship' for common coupon codes
      setCouponResult({
        success: true,
        message: 'Free shipping applied!',
        discountAmount: 0, // Assuming free shipping doesn't reduce price but modifies shipping cost
        couponCode: couponCode,
        // In a real app, this might set a flag for free shipping
      });
      console.log('Free shipping coupon applied.');
    } else {
      const errorMessage = 'Invalid coupon code. Please try again.';
      setCouponError(errorMessage);
      console.log('Coupon application failed.');
    }
    setIsCouponLoading(false);
  };

  return (
    <div className="cart-page" style={{ padding: '20px', maxWidth: '960px', margin: '0 auto' }}>
      <h1>Shopping Cart</h1>
      {items.length === 0 ? (
        <p>Your shopping cart is currently empty. Why not add some products?</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column-reverse' }}>
          {/* Cart Summary on the right (or bottom on mobile) */}
          <div style={{ flex: 1 }}>
            <CartSummary items={items} total={total} discountAmount={couponResult?.discountAmount || 0} couponMessage={couponResult?.message} />
          </div>
          {/* Cart Items List on the left (or top on mobile) */}
          <div style={{ flex: 2 }}>
            {/* Coupon Input Component */}
            <CouponInput
              onApplyCoupon={handleApplyCoupon}
              isLoading={isCouponLoading}
              error={couponError}
              successMessage={couponResult?.message}
            />
            
            {/* Render CartItemComponent for each item in the cart */}
            {items.map((item: CartItem) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
