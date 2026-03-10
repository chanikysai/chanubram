// src/pages/ProductPage.tsx - Updated to use Product type correctly
import React from 'react';
import { useParams } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
import ProductDetail from '../components/ProductDetail'; // Import ProductDetail
import type { Product } from '../types/product';

const mockProducts: Record<string, Product> = {
  'p1': { id: 'p1', name: 'Awesome Gadget', price: 49.99, description: 'A truly awesome gadget.' },
  'p2': { id: 'p2', name: 'Super Widget', price: 19.50, description: 'A super widget for all your needs.' },
  'p3': { id: 'p3', name: 'Mega Tool', price: 120.00, description: 'The ultimate tool for professionals.' },
  'p4': { id: 'p4', name: 'Mini Gizmo', price: 15.75, description: 'A small, handy gizmo.' },
};

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  // const { addItem, cartItems } = useCart();

  // Ensure productId is available before accessing mockProducts
  const product = productId ? mockProducts[productId] : null;

  // const handleAddToCart = () => {
  //   if (product) {
  //     addItem(product);
  //   }
  // };
  if (!product) {
    return <div>Product not found.</div>;
  }

  // const isItemInCart = cartItems.some(item => item.product.id === product.id);
  // const cartItem = cartItems.find(item => item.product.id === product.id);
  return (
    <div className="product-detail-page">
      <ProductDetail product={product} /> {/* Render ProductDetail */}
      {isItemInCart ? (
        <p style={{ textAlign: 'center', marginTop: '10px' }}>In Cart: {cartItem?.quantity}</p>
      ) : (
        <button onClick={handleAddToCart} style={{ display: 'block', margin: '10px auto' }}>Add to Cart</button>
      )}
    </div>
  );
};

export default ProductPage;
