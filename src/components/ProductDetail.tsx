// src/components/ProductDetail.tsx - Updated to use Product type correctly
import React from 'react';
import { useCart } from '../context/CartContext'; // Import useCart
import type { Product } from '../types/product';

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const { addItem } = useCart(); // Get addItem from context

  const handleAddToCart = () => {
    addItem(product); // Call addItem with the product object
  };

  return (
    <div className="product-detail" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', maxWidth: '400px', margin: '20px auto', backgroundColor: '#fff' }}>
      <h2 style={{ marginBottom: '10px' }}>{product.name}</h2>
      <p style={{ marginBottom: '15px', color: '#555' }}>{product.description || 'No description available.'}</p>
      <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>Price: ${product.price.toFixed(2)}</p>
      <button
        onClick={handleAddToCart}
        style={{
          backgroundColor: '#28a745', // Green button
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1em',
          transition: 'background-color 0.3s ease'
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#218838')} // Darker green on hover
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetail;
