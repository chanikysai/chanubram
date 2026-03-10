// src/components/ProductCard.tsx
import React from 'react';
import { Product } from '../services/productApi'; // Assuming Product interface is accessible

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void; // Callback to handle product click
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div
      className="product-card"
      onClick={() => onClick(product)}
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px',
        cursor: 'pointer',
        width: '200px', // Example fixed width
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out',
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
      onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{
          width: '100%',
          height: '150px', // Fixed height for images
          objectFit: 'cover', // Ensure image covers the area without distortion
          borderRadius: '4px',
          marginBottom: '12px',
        }}
      />
      <h3 style={{ fontSize: '1.1em', margin: '8px 0', flexGrow: 1 }}>{product.name}</h3>
      <p style={{ fontSize: '1em', color: '#007bff', fontWeight: 'bold', margin: '4px 0' }}>
        ${product.price.toFixed(2)}
      </p>
      <p style={{ fontSize: '0.9em', color: '#777', marginTop: 'auto' }}>
        {product.category}
      </p>
    </div>
  );
};

export default ProductCard;
