// src/components/ProductDetail.tsx
import React from 'react';
import { Product } from '../types/product'; // Assuming Product type is defined here

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  return (
    <div className="product-detail" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            maxWidth: '400px', // Limit image width
            height: 'auto',
            maxHeight: '400px', // Limit image height
            objectFit: 'contain',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'block', // Center the image
            margin: '0 auto 20px auto',
          }}
        />
      )}
      <h2 style={{ fontSize: '2em', marginBottom: '15px', color: '#333' }}>{product.name}</h2>
      <p style={{ fontSize: '1.1em', color: '#555', lineHeight: '1.6', marginBottom: '20px' }}>
        {product.description || 'No description available for this product.'}
      </p>
      <p style={{ fontSize: '1.3em', color: '#007bff', fontWeight: 'bold' }}>
        Price: ${product.price.toFixed(2)}
      </p>
      {/* Add other product details here if available, e.g., stock, brand, etc. */}
      {/* Example: <p>Stock: {product.stock}</p> */}
    </div>
  );
};

export default ProductDetail;
