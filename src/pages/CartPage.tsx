// src/pages/CartPage.tsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartItemComponent from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import CouponInput from '../components/CouponInput'; // Import CouponInput
import { CouponApplicationResult } from '../types/coupon'; // Import the type

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem } = useCart();
  const [couponResult, setCouponResult] = useState<CouponApplicationResult | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [isCouponLoading, setIsCouponLoading] = useState<boolean>(false);

  // Calculate subtotal before any potential coupon discount
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calculate the total price, applying the discount if a coupon was successfully applied
  const total = couponResult?.success ? subtotal - (couponResult.discountAmount || 0) : subtotal;

  const handleCouponApplied = (result: CouponApplicationResult) => {
    setCouponResult(result);
    setCouponError(''); // Clear any previous error
    setIsCouponLoading(false); // Ensure loading state is reset
    console.log('Coupon applied:', result);
  };

  const handleCouponError = (errorMessage: string) => {
    setCouponError(errorMessage);
    setCouponResult(null); // Reset coupon result on error
    setIsCouponLoading(false); // Ensure loading state is reset
    console.log('Coupon error:', errorMessage);
  };

  return (
    <div className="cart-page" style={{ padding: '20px', maxWidth: '960px', margin: '0 auto' }}>
      <h1>Shopping Cart</h1>
      {items.length === 0 ? (
        <p>Your shopping cart is currently empty. Why not add some products?</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column-reverse' /* Changed to column-reverse to place CouponInput above */ }}>
          <div style={{ flex: 1 /* Changed flex basis */ }}>
            <CartSummary items={items} total={total} discountAmount={couponResult?.discountAmount || 0} couponMessage={couponResult?.message} />
          </div>
          <div style={{ flex: 2 /* Changed flex basis */ }}>
            {/* Coupon Input Component */}
            <CouponInput
              onCouponApplied={handleCouponApplied}
              onCouponError={handleCouponError}
              isLoading={isCouponLoading}
            />
            {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}

            {/* Cart Items */}
            {items.map(item => (
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

