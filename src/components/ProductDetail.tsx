// src/components/ProductDetail.tsx
import React from 'react';
import { Product } from '../types/product'; // Assuming Product type is defined in src/types/product.ts

// Placeholder for product type definition if src/types/product.ts doesn't exist or is incomplete
// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   imageUrl: string;
//   inventory: number;
// }

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  // Use placeholder image if imageUrl is missing or invalid
  const imageUrl = product.imageUrl || 'https://via.placeholder.com/400';

  return (
    <div className="product-detail" style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '30px', // Increased padding
      backgroundColor: '#fff',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // Slightly stronger shadow
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Center content horizontally
      gap: '20px' // Space between elements
    }}>
      {product.imageUrl && (
        <img
          src={imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            maxWidth: '400px', // Limit image width
            height: 'auto',
            maxHeight: '400px', // Limit image height
            objectFit: 'contain',
            borderRadius: '8px',
            border: '1px solid #eee' // Subtle border around image
          }}
        />
      )}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <h2 style={{ fontSize: '2.5em', marginBottom: '15px', color: '#333', fontWeight: '700' }}>
          {product.name}
        </h2>
        <p style={{ fontSize: '1.2em', color: '#555', lineHeight: '1.7', marginBottom: '25px' }}>
          {product.description || 'No description available for this product.'}
        </p>
        <p style={{ fontSize: '1.6em', color: '#007bff', fontWeight: 'bold' }}>
          Price: ${product.price.toFixed(2)}
        </p>
        {/* Displaying inventory information */}
        {typeof product.inventory === 'number' && (
          <p style={{ fontSize: '1.1em', color: product.inventory < 10 ? 'orange' : '#777' }}>
            Stock: {product.inventory > 0 ? product.inventory : 'Out of Stock'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
