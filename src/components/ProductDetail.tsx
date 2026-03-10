// src/components/ProductDetail.tsx
import React from 'react';
import { Product } from '../services/productApi'; // Assuming Product interface is accessible

interface ProductDetailProps {
  product: Product | null; // Allow null to handle loading/error states
  isLoading: boolean;
  error: string | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, isLoading, error }) => {
  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading product details...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  if (!product) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>No product selected or found.</div>;
  }

  return (
    <div className="product-detail" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '600px', margin: '20px auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{
          width: '100%',
          maxWidth: '400px', // Max width for the image
          height: '300px',
          objectFit: 'cover',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      />
      <h2 style={{ fontSize: '2em', marginBottom: '10px', color: '#333' }}>{product.name}</h2>
      <p style={{ fontSize: '1.2em', color: '#007bff', fontWeight: 'bold', marginBottom: '15px' }}>
        ${product.price.toFixed(2)}
      </p>
      <p style={{ fontSize: '1em', color: '#555', lineHeight: '1.6', marginBottom: '20px' }}>
        {product.description}
      </p>
      <div style={{ width: '100%', textAlign: 'left', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 style={{ fontSize: '1.3em', marginBottom: '15px', color: '#333' }}>Specifications:</h3>
        {product.specifications && Object.keys(product.specifications).length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(product.specifications).map(([key, value]) => (
              <li key={key} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: '#555' }}>{key}:</strong>
                <span style={{ color: '#777' }}>{value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#777' }}>No specifications available.</p>
        )}
      </div>
      <p style={{ fontSize: '0.9em', color: '#999', marginTop: '30px' }}>
        Category: {product.category}
      </p>
    </div>
  );
};

export default ProductDetail;
